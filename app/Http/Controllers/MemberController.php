<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Membership;
use App\Models\Vehicle;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\CarbonImmutable;

class MemberController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('members.view');

        $search = trim((string) $request->string('search'));
        $package = $request->string('package')->toString();
        $status = $request->string('status')->toString();

        $membersQuery = Member::query()
            ->with('vehicles')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('member_code', 'like', "%{$search}%");
                });
            })
            ->when($package !== '' && $package !== 'all', fn ($query) => $query->where('package', $package))
            ->when($status !== '' && $status !== 'all', fn ($query) => $query->where('status', $status))
            ->latest();

        $members = $membersQuery
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Member $member) => [
                'id' => $member->id,
                'member_code' => $member->member_code,
                'name' => $member->name,
                'phone' => $member->phone,
                'address' => $member->address,
                'package' => $member->package,
                'status' => $member->status,
                'card_uid' => $member->card_uid,
            ]);

        return Inertia::render('members/index', [
            'members' => $members,
            'filters' => [
                'search' => $search,
                'package' => $package !== '' ? $package : 'all',
                'status' => $status !== '' ? $status : 'all',
            ],
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('members.create');

        return Inertia::render('members/create', [
            'packages' => [
                ['id' => '299k', 'name' => 'Basic', 'price' => 299000, 'quota' => 1],
                ['id' => '499k', 'name' => 'Plus', 'price' => 499000, 'quota' => 2],
                ['id' => '669k', 'name' => 'Premium', 'price' => 669000, 'quota' => 3],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('members.create');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:25'],
            'address' => ['nullable', 'string'],
            'card_uid' => ['required', 'digits:10', 'unique:members,card_uid'],
            'package' => ['required', 'in:299k,499k,669k'],
            'vehicles' => ['array'],
            'vehicles.*.plate' => ['required', 'string', 'max:32'],
            'vehicles.*.color' => ['nullable', 'string', 'max:32'],
            'membership.valid_from' => ['required', 'date'],
            'membership.valid_to' => ['required', 'date', 'after_or_equal:membership.valid_from'],
        ]);

        $nextCode = Member::query()->max('member_code');
        $nextSequence = $nextCode ? (int) Str::after($nextCode, 'M') + 1 : 1;
        $memberCode = 'M' . str_pad((string) $nextSequence, 4, '0', STR_PAD_LEFT);

        $normalizedUid = preg_replace('/\D+/', '', $validated['card_uid']);

        $normalizedPhone = $this->normalizePhoneNumber($validated['phone']);

        // Check if phone already exists (after normalization)
        $existingMember = Member::query()
            ->where('phone', $normalizedPhone)
            ->first();

        if ($existingMember) {
            return back()->withErrors([
                'phone' => 'Nomor telepon ini sudah digunakan oleh member lain.',
            ])->withInput();
        }

        $member = Member::create([
            'id' => (string) Str::uuid(),
            'member_code' => $memberCode,
            'name' => $validated['name'],
            'phone' => $normalizedPhone,
            'address' => $validated['address'] ?? null,
            'card_uid' => $normalizedUid,
            'package' => $validated['package'],
            'status' => 'active',
        ]);

        foreach ($validated['vehicles'] ?? [] as $vehicleData) {
            $member->vehicles()->create($vehicleData);
        }

        $member->memberships()->create([
            'valid_from' => $validated['membership']['valid_from'],
            'valid_to' => $validated['membership']['valid_to'],
            'status' => 'active',
        ]);

        return redirect()->route('members.show', $member);
    }

    public function checkPhone(Request $request): \Illuminate\Http\JsonResponse
    {
        Gate::authorize('members.create');

        $validated = $request->validate([
            'phone' => ['required', 'string', 'max:25'],
        ]);

        $normalizedPhone = $this->normalizePhoneNumber($validated['phone']);

        $existingMember = Member::query()
            ->where('phone', $normalizedPhone)
            ->first();

        return response()->json([
            'available' => $existingMember === null,
            'message' => $existingMember 
                ? 'Nomor telepon ini sudah digunakan oleh member lain.' 
                : 'Nomor telepon tersedia.',
        ]);
    }

    public function checkCardUid(Request $request): \Illuminate\Http\JsonResponse
    {
        Gate::authorize('members.create');

        $validated = $request->validate([
            'card_uid' => ['required', 'string', 'digits:10'],
        ]);

        $normalizedUid = preg_replace('/\D+/', '', $validated['card_uid']);

        $existingMember = Member::query()
            ->where('card_uid', $normalizedUid)
            ->first();

        return response()->json([
            'available' => $existingMember === null,
            'message' => $existingMember 
                ? 'Card UID ini sudah digunakan oleh member lain.' 
                : 'Card UID tersedia.',
        ]);
    }

    private function normalizePhoneNumber(string $value): string
    {
        $digits = preg_replace('/\D+/', '', $value);

        if ($digits === '') {
            return $value;
        }

        if (str_starts_with($digits, '62')) {
            $digits = substr($digits, 2);
        }

        $digits = ltrim($digits, '0');

        if ($digits === '') {
            return '0';
        }

        return '0' . $digits;
    }

    public function show(Member $member): Response
    {
        Gate::authorize('members.view');

        $member->load(['vehicles', 'memberships' => fn ($query) => $query->orderByDesc('valid_to'), 'visits' => fn ($query) => $query->latest()->take(10)]);

        $latestMembership = $member->memberships->first();

        $packageQuotas = [
            '299k' => 1,
            '499k' => 2,
            '669k' => 3,
        ];

        return Inertia::render('members/show', [
            'member' => [
                'id' => $member->id,
                'member_code' => $member->member_code,
                'name' => $member->name,
                'package' => $member->package,
                'status' => $member->status,
                'card_uid' => $member->card_uid,
                'phone' => $member->phone,
                'address' => $member->address,
                'joined_at' => optional($latestMembership?->valid_from)->format('c'),
                'expires_at' => optional($latestMembership?->valid_to)->format('c'),
                'package_quota' => $packageQuotas[$member->package] ?? 1,
            ],
            'vehicles' => $member->vehicles->map(fn (Vehicle $vehicle) => [
                'id' => $vehicle->id,
                'plate' => $vehicle->plate,
                'color' => $vehicle->color,
            ]),
            'memberships' => $member->memberships->map(fn (Membership $membership) => [
                'id' => $membership->id,
                'valid_from' => $membership->valid_from,
                'valid_to' => $membership->valid_to,
                'status' => $membership->status,
            ]),
            'recentVisits' => $member->visits->map(function (\App\Models\Visit $visit) {
                $tz = config('app.timezone');
                $date = \Carbon\CarbonImmutable::make($visit->visit_date)->setTimezone($tz)->format('d M Y');
                $time = ($visit->visit_time instanceof \DateTimeInterface
                    ? \Carbon\CarbonImmutable::instance($visit->visit_time)
                    : \Carbon\CarbonImmutable::parse((string) $visit->visit_time)
                )->setTimezone($tz)->format('h:i A');

                return [
                    'id' => $visit->id,
                    'visit_date' => $date,
                    'visit_time' => $time,
                    'status' => $visit->status,
                ];
            }),
        ]);
    }

    public function destroyMany(Request $request): RedirectResponse
    {
        Gate::authorize('members.delete');

        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['uuid'],
        ]);

        $ids = $validated['ids'];

        $members = Member::query()->whereIn('id', $ids)->get();

        foreach ($members as $member) {
            $member->vehicles()->delete();
            $member->memberships()->delete();
            $member->visits()->delete();
            $member->cardRequests()->delete();
            $member->delete();
        }

        return redirect()
            ->route('members.index')
            ->with('flash', [
                'type' => 'success',
                'message' => 'Selected members have been deleted.',
            ]);
    }

    public function extend(Member $member, Request $request): RedirectResponse
    {
        Gate::authorize('members.view');

        $validated = $request->validate([
            'valid_to' => ['required', 'date', 'after_or_equal:today'],
        ]);

        $now = CarbonImmutable::today();
        $latest = $member->memberships()->orderByDesc('valid_to')->first();

        $startDate = $latest && CarbonImmutable::make($latest->valid_to)->greaterThanOrEqualTo($now)
            ? CarbonImmutable::make($latest->valid_to)->addDay()
            : $now;

        $endDate = CarbonImmutable::parse($validated['valid_to']);

        // Pastikan tanggal akhir setelah tanggal mulai
        if ($endDate->lessThanOrEqualTo($startDate)) {
            return back()->withErrors([
                'valid_to' => 'Tanggal akhir harus setelah tanggal mulai membership.',
            ]);
        }

        $membership = new Membership([
            'valid_from' => $startDate->toDateString(),
            'valid_to' => $endDate->toDateString(),
            'status' => 'active',
        ]);

        $member->memberships()->save($membership);

        if ($member->status !== 'active') {
            $member->status = 'active';
            $member->save();
        }

        return back()->with('success', 'Membership berhasil diperpanjang sampai ' . $endDate->toFormattedDateString());
    }

    public function storeVehicle(Request $request, Member $member): RedirectResponse
    {
        Gate::authorize('vehicles.create');

        $packageQuotas = [
            '299k' => 1,
            '499k' => 2,
            '669k' => 3,
        ];

        $quota = $packageQuotas[$member->package] ?? 1;
        $currentVehicleCount = $member->vehicles()->count();

        if ($currentVehicleCount >= $quota) {
            return back()->withErrors([
                'plate' => "Paket {$member->package} hanya memungkinkan maksimal {$quota} kendaraan. Kuota sudah penuh.",
            ])->withInput();
        }

        $validated = $request->validate([
            'plate' => ['required', 'string', 'max:32'],
            'color' => ['nullable', 'string', 'max:32'],
        ]);

        // Check if plate already exists for this member
        $existingVehicle = $member->vehicles()
            ->where('plate', $validated['plate'])
            ->first();

        if ($existingVehicle) {
            return back()->withErrors([
                'plate' => 'Plat nomor ini sudah terdaftar untuk member ini.',
            ])->withInput();
        }

        $member->vehicles()->create($validated);

        return redirect()->route('members.show', $member)->with('success', 'Kendaraan berhasil ditambahkan.');
    }
}
