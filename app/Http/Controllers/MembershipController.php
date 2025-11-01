<?php

namespace App\Http\Controllers;

use App\Models\Member;
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
}

