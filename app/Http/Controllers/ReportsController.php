<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Visit;
use App\Models\Vehicle;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Lang;
use Inertia\Inertia;
use Inertia\Response;

class ReportsController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('reports.view');

        $today = CarbonImmutable::today();
        $visitsTodayCount = Visit::query()
            ->whereDate('visit_date', $today)
            ->count();

        $activeMembers = Member::query()
            ->where('status', 'active')
            ->count();

        $newMembersMonth = Member::query()
            ->whereDate('created_at', '>=', $today->subDays(30))
            ->count();

        $vehiclesRegistered = Vehicle::query()->count();

        $visitsByDay = collect(range(0, 6))->map(function (int $offset) use ($today) {
            $date = $today->copy()->subDays(6 - $offset);
            $count = Visit::query()
                ->whereDate('visit_date', $date)
                ->count();

            return [
                'day' => $date->format('D'),
                'value' => $count,
            ];
        });

        $monthlyNewMembers = collect(range(0, 5))->map(function (int $offset) use ($today) {
            $monthStart = $today->copy()->startOfMonth()->subMonths(5 - $offset);
            $monthEnd = $monthStart->endOfMonth();

            $count = Member::query()
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->count();

            return [
                'month' => $monthStart->format('M'),
                'value' => $count,
            ];
        });

        $packageTotals = Member::query()
            ->selectRaw('package, COUNT(*) as total')
            ->groupBy('package')
            ->pluck('total', 'package');

        $totalPackages = $packageTotals->sum();
        $packageDistribution = $packageTotals
            ->map(function (int $count, string $package) use ($totalPackages) {
                $percentage = $totalPackages === 0 ? 0 : round(($count / $totalPackages) * 100);

                return [
                    'name' => strtoupper($package),
                    'percentage' => $percentage,
                ];
            })
            ->values();

        $recentVisits = Visit::query()
            ->latest('visit_date')
            ->latest('visit_time')
            ->with(['member', 'vehicle'])
            ->take(10)
            ->get()
            ->map(fn (Visit $visit) => [
                'id' => $visit->id,
                'time' => $visit->visit_time,
                'member' => [
                    'name' => $visit->member?->name ?? '-',
                    'code' => $visit->member?->member_code ?? '-',
                ],
                'plate' => $visit->vehicle?->plate,
                'status' => $visit->status,
            ]);

        return Inertia::render('reports/index', [
            'summary' => [
                'visitsToday' => $visitsTodayCount,
                'activeMembers' => $activeMembers,
                'newMembersMonth' => $newMembersMonth,
                'vehiclesRegistered' => $vehiclesRegistered,
            ],
            'visitsByDay' => $visitsByDay,
            'monthlyNewMembers' => $monthlyNewMembers,
            'packageDistribution' => $packageDistribution,
            'recentVisits' => $recentVisits,
        ]);
    }
}
