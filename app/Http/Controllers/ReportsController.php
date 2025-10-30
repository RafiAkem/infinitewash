<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Visit;
use App\Models\Vehicle;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Lang;
use Inertia\Inertia;
use Inertia\Response;

class ReportsController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('reports.view');

        $range = $request->string('range')->toString() ?: 'this-week';
        $startDateStr = $request->string('start_date')->toString();
        $endDateStr = $request->string('end_date')->toString();

        $today = CarbonImmutable::today();
        
        // Tentukan rentang tanggal berdasarkan filter
        if ($range === 'custom' && $startDateStr && $endDateStr) {
            $startDate = CarbonImmutable::parse($startDateStr)->startOfDay();
            $endDate = CarbonImmutable::parse($endDateStr)->endOfDay();
        } elseif ($range === 'today') {
            $startDate = $today->copy()->startOfDay();
            $endDate = $today->copy()->endOfDay();
        } elseif ($range === 'this-week') {
            $startDate = $today->copy()->subDays(6)->startOfDay();
            $endDate = $today->copy()->endOfDay();
        } elseif ($range === 'this-month') {
            $startDate = $today->copy()->subDays(29)->startOfDay();
            $endDate = $today->copy()->endOfDay();
        } else {
            // Default: 7 hari terakhir
            $startDate = $today->copy()->subDays(6)->startOfDay();
            $endDate = $today->copy()->endOfDay();
        }

        $visitsTodayCount = Visit::query()
            ->whereBetween('visit_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->count();

        $activeMembers = Member::query()
            ->where('status', 'active')
            ->count();

        $newMembersMonth = Member::query()
            ->whereDate('created_at', '>=', $today->copy()->subDays(30))
            ->count();

        $vehiclesRegistered = Vehicle::query()->count();

        $dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        
        // Hitung total kunjungan periode saat ini
        $currentPeriodTotal = Visit::query()
            ->whereBetween('visit_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->count();
        
        // Hitung periode sebelumnya (dengan durasi yang sama)
        $periodDuration = $startDate->diffInDays($endDate);
        $previousPeriodStart = $startDate->copy()->subDays($periodDuration + 1);
        $previousPeriodEnd = $startDate->copy()->subDay()->endOfDay();
        
        $previousPeriodTotal = Visit::query()
            ->whereBetween('visit_date', [$previousPeriodStart->toDateString(), $previousPeriodEnd->toDateString()])
            ->count();
        
        // Hitung persentase perubahan
        $trendPercentage = 0;
        $trendDirection = 'equal'; // 'up', 'down', 'equal'
        
        if ($previousPeriodTotal > 0) {
            $trendPercentage = round((($currentPeriodTotal - $previousPeriodTotal) / $previousPeriodTotal) * 100, 1);
            $trendDirection = $trendPercentage > 0 ? 'up' : ($trendPercentage < 0 ? 'down' : 'equal');
        } elseif ($currentPeriodTotal > 0 && $previousPeriodTotal === 0) {
            $trendPercentage = 100;
            $trendDirection = 'up';
        }
        
        // Hitung hari antara start dan end date untuk visitsByDay
        $daysDiff = $startDate->diffInDays($endDate);
        $daysToShow = max(1, min($daysDiff + 1, 7)); // Minimal 1 hari, maksimal 7 hari
        
        // Pastikan range selalu valid (start <= end)
        $visitsByDay = collect();
        if ($daysToShow > 0) {
            for ($offset = 0; $offset < $daysToShow; $offset++) {
                $date = $startDate->copy()->addDays($offset);
                
                // Skip jika melebihi end date
                if ($date->greaterThan($endDate)) {
                    continue;
                }
                
                $count = Visit::query()
                    ->whereDate('visit_date', $date)
                    ->count();

                $visitsByDay->push([
                    'day' => $dayNames[$date->dayOfWeek] ?? $date->format('d M'),
                    'value' => $count,
                ]);
            }
        }

        $monthNames = [
            1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr', 5 => 'Mei', 6 => 'Jun',
            7 => 'Jul', 8 => 'Agu', 9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des',
        ];
        
        $monthlyNewMembers = collect(range(0, 5))->map(function (int $offset) use ($today, $monthNames) {
            $monthStart = $today->copy()->startOfMonth()->subMonths(5 - $offset);
            $monthEnd = $monthStart->endOfMonth();

            $count = Member::query()
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->count();

            return [
                'month' => $monthNames[$monthStart->month] ?? $monthStart->format('M'), // Bulan dalam bahasa Indonesia
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
            ->whereBetween('visit_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->latest('visit_date')
            ->latest('visit_time')
            ->with(['member', 'vehicle'])
            ->paginate(15)
            ->withQueryString()
            ->through(function (Visit $visit) {
                $visitDate = CarbonImmutable::parse($visit->visit_date);
                $time = $visit->visit_time instanceof \DateTimeInterface
                    ? CarbonImmutable::instance($visit->visit_time)
                    : CarbonImmutable::parse((string) $visit->visit_time);

                $timeFormatted = $time->setTimezone(config('app.timezone'))->format('h:i A');
                $dateFormatted = $visitDate->setTimezone(config('app.timezone'))->format('d M Y');

                return [
                    'id' => $visit->id,
                    'time' => $timeFormatted,
                    'date' => $dateFormatted,
                    'member' => [
                        'name' => $visit->member?->name ?? '-',
                        'code' => $visit->member?->member_code ?? '-',
                    ],
                    'plate' => $visit->vehicle?->plate,
                    'status' => $visit->status,
                ];
            });

        return Inertia::render('reports/index', [
            'summary' => [
                'visitsToday' => $visitsTodayCount,
                'activeMembers' => $activeMembers,
                'newMembersMonth' => $newMembersMonth,
                'vehiclesRegistered' => $vehiclesRegistered,
            ],
            'visitsByDay' => $visitsByDay,
            'visitsTrend' => [
                'percentage' => abs($trendPercentage),
                'direction' => $trendDirection,
            ],
            'monthlyNewMembers' => $monthlyNewMembers,
            'packageDistribution' => $packageDistribution,
            'recentVisits' => $recentVisits,
        ]);
    }
}
