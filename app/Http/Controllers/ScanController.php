<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Membership;
use App\Models\Vehicle;
use App\Models\Visit;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ScanController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('scan.use');

        $today = CarbonImmutable::today();

        $visits = Visit::query()
            ->whereDate('visit_date', $today)
            ->latest('visit_time')
            ->with(['member', 'vehicle'])
            ->take(25)
            ->get()
            ->map(fn (Visit $visit) => [
                'id' => $visit->id,
                'time' => $visit->visit_time,
                'member' => [
                    'id' => $visit->member->id,
                    'name' => $visit->member->name,
                    'package' => $visit->member->package,
                    'status' => $visit->member->status,
                ],
                'plate' => optional($visit->vehicle)->plate,
                'status' => $visit->status,
            ]);

        $lastScan = Visit::query()
            ->latest('created_at')
            ->with('member')
            ->first();

        return Inertia::render('scan/index', [
            'todayVisits' => $visits,
            'lastScan' => $lastScan ? [
                'status' => $lastScan->status,
                'member' => [
                    'id' => $lastScan->member->id,
                    'name' => $lastScan->member->name,
                    'package' => $lastScan->member->package,
                    'status' => $lastScan->member->status,
                ],
            ] : null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('scan.use');

        $validated = $request->validate([
            'card_uid' => ['required', 'string'],
        ]);
        $member = Member::query()
            ->whereRaw('LOWER(card_uid) = ?', [Str::lower($validated['card_uid'])])
            ->with(['vehicles', 'memberships' => fn ($query) => $query->orderByDesc('valid_to')])
            ->first();

        if (! $member) {
            return Redirect::back()->with('scan.result', [
                'status' => 'blocked',
                'reason' => 'Member not found',
            ]);
        }

        $activeMembership = $member->memberships
            ->first(fn (Membership $membership) => $membership->status === 'active' && $membership->valid_to->isFuture());

        $vehicle = $member->vehicles->first();
        $status = $activeMembership ? 'allowed' : 'blocked';

        Visit::create([
            'member_id' => $member->id,
            'vehicle_id' => $vehicle?->id,
            'visit_date' => now()->toDateString(),
            'visit_time' => now()->toTimeString(),
            'status' => $status,
        ]);

        return Redirect::back()->with('scan.result', [
            'status' => $status,
            'member' => [
                'id' => $member->id,
                'name' => $member->name,
                'package' => $member->package,
                'status' => $member->status,
                'vehicle' => $vehicle?->plate,
            ],
            'reason' => $status === 'allowed' ? null : 'Membership inactive',
        ]);
    }
}
