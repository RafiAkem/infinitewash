<?php

namespace App\Http\Controllers;

use App\Models\CardRequest;
use App\Models\Member;
use App\Models\Visit;
use App\Models\Vehicle;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $today = CarbonImmutable::today();
        $yesterday = $today->copy()->subDay();
        $sevenDaysAgo = $today->copy()->subDays(6);
        $thirtyDaysAgo = $today->copy()->subDays(29);

        // Summary statistics
        $totalMembers = Member::query()->count();
        $activeMembers = Member::query()->where('status', 'active')->count();
        $newMembersToday = Member::query()
            ->whereDate('created_at', $today)
            ->count();
        $newMembers30Days = Member::query()
            ->where('created_at', '>=', $thirtyDaysAgo->startOfDay())
            ->count();

        // Visit statistics
        $visitsToday = Visit::query()
            ->whereDate('visit_date', $today)
            ->count();
        $visitsYesterday = Visit::query()
            ->whereDate('visit_date', $yesterday)
            ->count();

        // Calculate visit growth percentage
        $visitGrowth = 0;
        if ($visitsYesterday > 0) {
            $visitGrowth = round((($visitsToday - $visitsYesterday) / $visitsYesterday) * 100);
        } elseif ($visitsToday > 0) {
            $visitGrowth = 100;
        }

        $totalVehicles = Vehicle::query()->count();
        $avgVehiclesPerMember = $totalMembers > 0 ? round($totalVehicles / $totalMembers, 1) : 0;

        // Visits by day for last 7 days
        $dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        $visitsByDay = collect();
        
        for ($i = 6; $i >= 0; $i--) {
            $date = $today->copy()->subDays($i);
            $dayName = $dayNames[$date->dayOfWeek];
            $count = Visit::query()
                ->whereDate('visit_date', $date)
                ->count();

            $visitsByDay->push([
                'day' => $dayName,
                'value' => $count,
                'date' => $date->format('Y-m-d'),
            ]);
        }

        // Get max value for chart scaling (find the highest visit count)
        $maxVisits = $visitsByDay->max('value') ?? 1;

        // Pending card replacement requests
        $pendingCardRequests = CardRequest::query()
            ->with('member')
            ->where('request_status', 'pending')
            ->latest('requested_at')
            ->limit(5)
            ->get()
            ->map(fn (CardRequest $request) => [
                'id' => $request->id,
                'memberId' => $request->member->member_code,
                'memberName' => $request->member->name,
                'oldUid' => $request->old_uid,
                'newUid' => $request->new_uid,
                'reason' => ucfirst($request->reason),
                'reasonNote' => $request->reason_note,
                'requestedAt' => $request->requested_at
                    ->setTimezone(config('app.timezone'))
                    ->format('d M Y H:i'),
            ]);

        // Today's visits table
        $todayVisits = Visit::query()
            ->whereDate('visit_date', $today)
            ->with(['member', 'vehicle'])
            ->latest('visit_time')
            ->limit(10)
            ->get()
            ->map(function (Visit $visit) {
                $time = $visit->visit_time instanceof \DateTimeInterface
                    ? CarbonImmutable::instance($visit->visit_time)
                    : CarbonImmutable::parse((string) $visit->visit_time);

                return [
                    'id' => $visit->id,
                    'time' => $time->setTimezone(config('app.timezone'))->format('h:i A'),
                    'memberName' => $visit->member->name ?? '-',
                    'memberId' => $visit->member->member_code ?? '-',
                    'plate' => $visit->vehicle?->plate ?? null,
                    'status' => $visit->status,
                ];
            });

        return Inertia::render('dashboard', [
            'summary' => [
                'totalMembers' => $totalMembers,
                'activeMembers' => $activeMembers,
                'visitsToday' => $visitsToday,
                'totalVehicles' => $totalVehicles,
                'newMembersToday' => $newMembersToday,
                'visitGrowth' => $visitGrowth,
                'avgVehiclesPerMember' => $avgVehiclesPerMember,
            ],
            'visitsByDay' => $visitsByDay->values()->all(),
            'maxVisits' => $maxVisits,
            'pendingCardRequests' => $pendingCardRequests,
            'todayVisits' => $todayVisits,
        ]);
    }
}

