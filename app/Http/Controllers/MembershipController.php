<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Membership;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class MembershipController extends Controller
{
    private const PACKAGES = [
        '299k' => ['id' => '299k', 'name' => 'Basic', 'price' => 299000, 'quota' => 1, 'description' => 'Cuci mobil 1 kendaraan, kedatangan tanpa batas selama aktif.'],
        '499k' => ['id' => '499k', 'name' => 'Plus', 'price' => 499000, 'quota' => 2, 'description' => 'Untuk keluarga dengan 2 kendaraan, prioritas antrian.'],
        '669k' => ['id' => '669k', 'name' => 'Premium', 'price' => 669000, 'quota' => 3, 'description' => 'Termasuk interior detailing ringan untuk 3 kendaraan.'],
    ];

    public function index(): Response
    {
        Gate::authorize('members.view');

        // Get packages data
        $packages = array_values(self::PACKAGES);

        // Get members with vehicles
        $members = Member::query()
            ->with('vehicles')
            ->get()
            ->map(function (Member $member) {
                $packageInfo = self::PACKAGES[$member->package] ?? null;
                
                return [
                    'id' => $member->member_code,
                    'name' => $member->name,
                    'packageId' => $member->package,
                    'vehicles' => $member->vehicles->map(fn ($vehicle) => [
                        'plate' => $vehicle->plate,
                        'color' => $vehicle->color ?? '',
                    ])->toArray(),
                ];
            })
            ->toArray();

        // Calculate statistics
        $totalMembers = Member::query()->count();
        $totalVehicles = Member::query()->withCount('vehicles')->get()->sum('vehicles_count');
        $activePackages = count($packages);

        return Inertia::render('membership/index', [
            'packages' => $packages,
            'members' => $members,
            'statistics' => [
                'totalMembers' => $totalMembers,
                'totalVehicles' => $totalVehicles,
                'activePackages' => $activePackages,
            ],
        ]);
    }

    public function searchByUid(Request $request): JsonResponse
    {
        Gate::authorize('members.view');

        $validated = $request->validate([
            'card_uid' => ['required', 'string', 'digits:10'],
        ]);

        $normalizedUid = preg_replace('/\D+/', '', $validated['card_uid']);

        $member = Member::query()
            ->with(['vehicles', 'memberships' => fn ($query) => $query->orderByDesc('valid_to')])
            ->where('card_uid', $normalizedUid)
            ->first();

        if (!$member) {
            return response()->json([
                'success' => false,
                'message' => 'Member tidak ditemukan dengan UID tersebut.',
            ], 404);
        }

        $latestMembership = $member->memberships->first();
        $now = CarbonImmutable::now();
        $expiresAt = $latestMembership ? CarbonImmutable::make($latestMembership->valid_to)->endOfDay() : null;
        $daysLeft = $expiresAt && $expiresAt->greaterThanOrEqualTo($now) 
            ? max(0, $now->diffInDays($expiresAt, false)) 
            : 0;

        $packageInfo = self::PACKAGES[$member->package] ?? null;

        return response()->json([
            'success' => true,
            'member' => [
                'id' => $member->id,
                'member_code' => $member->member_code,
                'name' => $member->name,
                'phone' => $member->phone,
                'package' => $member->package,
                'package_name' => $packageInfo['name'] ?? $member->package,
                'status' => $member->status,
                'expires_at' => $expiresAt ? $expiresAt->format('d M Y') : null,
                'days_left' => $daysLeft,
                'vehicles' => $member->vehicles->map(fn ($vehicle) => [
                    'plate' => $vehicle->plate,
                    'color' => $vehicle->color ?? '',
                ])->toArray(),
            ],
        ]);
    }

    public function extendMembership(Request $request): RedirectResponse
    {
        Gate::authorize('members.view');

        $validated = $request->validate([
            'card_uid' => ['required', 'string', 'digits:10'],
            'months' => ['required', 'integer', 'min:1', 'max:12'],
        ]);

        $normalizedUid = preg_replace('/\D+/', '', $validated['card_uid']);

        $member = Member::query()
            ->with(['memberships' => fn ($query) => $query->orderByDesc('valid_to')])
            ->where('card_uid', $normalizedUid)
            ->first();

        if (!$member) {
            return back()->withErrors([
                'card_uid' => 'Member tidak ditemukan dengan UID tersebut.',
            ]);
        }

        $now = CarbonImmutable::today();
        $latest = $member->memberships->first();

        $startDate = $latest && CarbonImmutable::make($latest->valid_to)->greaterThanOrEqualTo($now)
            ? CarbonImmutable::make($latest->valid_to)->addDay()
            : $now;

        $endDate = $startDate->addMonths((int) $validated['months']);

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

        return back()->with('success', 'Membership berhasil diperpanjang ' . $validated['months'] . ' bulan sampai ' . $endDate->format('d M Y'));
    }
}

