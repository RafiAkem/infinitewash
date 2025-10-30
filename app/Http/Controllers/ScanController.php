<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Membership;
use App\Models\PublicHoliday;
use App\Models\Vehicle;
use App\Models\Visit;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ScanController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('scan.use');

        $today = CarbonImmutable::today();

        $lastScan = Visit::query()
            ->latest('created_at')
            ->with(['member', 'vehicle'])
            ->first();

        $visits = Visit::query()
            ->whereDate('visit_date', $today)
            ->when($lastScan, fn ($q) => $q->where('id', '!=', $lastScan->id))
            ->latest('visit_time')
            ->with(['member', 'vehicle'])
            ->paginate(15)
            ->withQueryString()
            ->through(function (Visit $visit) {
                return [
                    'id' => $visit->id,
                    'time' => ($visit->visit_time instanceof \DateTimeInterface
                        ? CarbonImmutable::instance($visit->visit_time)
                        : CarbonImmutable::parse((string) $visit->visit_time)
                    )
                        ->setTimezone(config('app.timezone'))
                        ->format('h:i A'),
                    'member' => [
                        'id' => $visit->member->id,
                        'name' => $visit->member->name,
                        'package' => $visit->member->package,
                        'status' => $visit->member->status,
                        'phone' => $visit->member->phone,
                    ],
                    'plate' => optional($visit->vehicle)->plate,
                    'status' => $visit->status,
                    'reason' => $visit->reason,
                ];
            });

        return Inertia::render('scan/index', [
            'todayVisits' => $visits,
            'lastScan' => $lastScan ? [
                'status' => $lastScan->status,
                'time' => ($lastScan->visit_time instanceof \DateTimeInterface
                    ? CarbonImmutable::instance($lastScan->visit_time)
                    : CarbonImmutable::parse((string) $lastScan->visit_time)
                )
                    ->setTimezone(config('app.timezone'))
                    ->format('h:i A'),
                'plate' => optional($lastScan->vehicle)->plate,
                'member' => [
                    'id' => $lastScan->member->id,
                    'name' => $lastScan->member->name,
                    'package' => $lastScan->member->package,
                    'status' => $lastScan->member->status,
                    'phone' => $lastScan->member->phone,
                ],
            ] : null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('scan.use');

        $validated = $request->validate([
            'card_uid' => ['nullable', 'digits:9'],
            'member_id' => ['nullable', 'uuid', 'exists:members,id'],
            'via' => ['nullable', 'in:card,phone'],
        ]);

        if (! $validated['card_uid'] && ! $validated['member_id']) {
            return Redirect::back()->with('scan', [
                'result' => [
                    'status' => 'blocked',
                    'reason' => 'Card UID atau nomor member wajib diisi.',
                ],
            ]);
        }

        $memberQuery = Member::query()
            ->with(['vehicles', 'memberships' => fn ($query) => $query->orderByDesc('valid_to')]);

        if ($validated['member_id']) {
            $memberQuery->where('id', $validated['member_id']);
        } else {
            $memberQuery->where('card_uid', $validated['card_uid']);
        }

        $member = $memberQuery->first();

        if (! $member) {
            return Redirect::back()->with('scan', [
                'result' => [
                    'status' => 'blocked',
                    'reason' => 'Member tidak ditemukan.',
                ],
            ]);
        }

        $now = CarbonImmutable::now();
        $today = $now->toDateString();

        if ($now->isWeekend()) {
            return $this->blockedResponse($member, 'Scan tidak tersedia pada akhir pekan.');
        }

        if ($this->isPublicHoliday($now)) {
            return $this->blockedResponse($member, 'Scan ditutup pada tanggal merah.');
        }

        if ($member->status !== 'active') {
            return $this->blockedResponse($member, 'Status member tidak aktif.');
        }

        $activeMembership = $member->memberships
            ->first(function (Membership $membership) use ($now) {
                if ($membership->status !== 'active') {
                    return false;
                }

                $validTo = CarbonImmutable::make($membership->valid_to)->endOfDay();

                return $validTo->greaterThanOrEqualTo($now);
            });

        if (! $activeMembership) {
            return $this->blockedResponse($member, 'Membership tidak aktif atau sudah kedaluwarsa.');
        }

        $alreadyScanned = Visit::query()
            ->where('member_id', $member->id)
            ->whereDate('visit_date', $today)
            ->exists();

        if ($alreadyScanned) {
            return $this->blockedResponse($member, 'Member sudah melakukan scan hari ini.');
        }

        $vehicle = $member->vehicles->first();

        Visit::create([
            'member_id' => $member->id,
            'vehicle_id' => $vehicle?->id,
            'visit_date' => $today,
            'visit_time' => $now->toTimeString(),
            'status' => 'allowed',
        ]);

        return Redirect::back()->with('scan', [
            'result' => [
                'status' => 'allowed',
                'member' => $this->formatScanMember($member, $vehicle),
                'reason' => null,
            ],
        ]);
    }

    public function lookup(Request $request): JsonResponse
    {
        Gate::authorize('scan.use');

        $validated = $request->validate([
            'phone' => ['required', 'string'],
        ]);

        $normalizedPhone = preg_replace('/\D+/', '', $validated['phone']);
        $variants = array_values(array_filter(array_unique(
            array_merge(
                [$normalizedPhone],
                $normalizedPhone !== ''
                    ? [$this->prependCountryCode($normalizedPhone), $this->stripCountryCode($normalizedPhone)]
                    : []
            )
        ), fn ($value) => $value !== ''));

        $replaceExpression = "REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(phone, '+', ''), '-', ''), ' ', ''), '(', ''), ')', '')";

        $member = null;

        if ($variants !== []) {
            $member = Member::query()
                ->with(['vehicles', 'memberships' => fn ($query) => $query->orderByDesc('valid_to')])
                ->where(function ($query) use ($variants, $replaceExpression) {
                    foreach ($variants as $index => $variant) {
                        if ($index === 0) {
                            $query->whereRaw("{$replaceExpression} = ?", [$variant]);
                        } else {
                            $query->orWhereRaw("{$replaceExpression} = ?", [$variant]);
                        }
                    }
                })
                ->first();
        }

        if (! $member) {
            $member = Member::query()
                ->with(['vehicles', 'memberships' => fn ($query) => $query->orderByDesc('valid_to')])
                ->where(function ($query) use ($validated, $normalizedPhone) {
                    $query->where('phone', 'like', '%' . $validated['phone'] . '%')
                        ->orWhere('phone', 'like', '%' . $normalizedPhone . '%');
                })
                ->first();
        }

        if (! $member) {
            return response()->json([
                'message' => 'Member tidak ditemukan.',
            ], 404);
        }

        $vehicle = $member->vehicles->first();

        return response()->json([
            'member' => $this->formatScanMember($member, $vehicle),
            'id' => $member->id,
        ]);
    }

    private function blockedResponse(Member $member, string $reason): RedirectResponse
    {
        $vehicle = $member->vehicles->first();

        // Record blocked attempt to visit history
        $now = CarbonImmutable::now();
        Visit::create([
            'member_id' => $member->id,
            'vehicle_id' => $vehicle?->id,
            'visit_date' => $now->toDateString(),
            'visit_time' => $now->toTimeString(),
            'status' => 'blocked',
            'reason' => $reason,
        ]);

        return Redirect::back()->with('scan', [
            'result' => [
                'status' => 'blocked',
                'member' => $this->formatScanMember($member, $vehicle),
                'reason' => $reason,
            ],
        ]);
    }

    private function formatScanMember(Member $member, ?Vehicle $vehicle): array
    {
        return [
            'id' => $member->id,
            'name' => $member->name,
            'package' => $member->package,
            'status' => $member->status,
            'phone' => $member->phone,
            'vehicle' => $vehicle?->plate,
        ];
    }

    private function isPublicHoliday(CarbonImmutable $date): bool
    {
        return PublicHoliday::query()
            ->whereDate('holiday_date', $date->toDateString())
            ->exists();
    }

    private function prependCountryCode(string $digits): string
    {
        if (str_starts_with($digits, '62')) {
            return $digits;
        }

        $trimmed = ltrim($digits, '0');

        return $trimmed === '' ? $digits : '62' . $trimmed;
    }

    private function stripCountryCode(string $digits): string
    {
        if (str_starts_with($digits, '62')) {
            return '0' . substr($digits, 2);
        }

        return $digits;
    }
}
