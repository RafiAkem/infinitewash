<?php

namespace App\Http\Controllers;

use App\Models\CardRequest;
use App\Models\Member;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CardRequestController extends Controller
{
    public function index(): Response
    {
        // Bisa dilihat oleh yang punya permission request atau approve
        if (! Gate::any(['cardRequests.request', 'cardRequests.approve'])) {
            abort(403);
        }

        $pending = CardRequest::query()
            ->with('member')
            ->where('request_status', 'pending')
            ->latest('requested_at')
            ->get()
            ->map(fn (CardRequest $request) => [
                'id' => $request->id,
                'memberId' => $request->member->member_code,
                'memberName' => $request->member->name,
                'oldUid' => $request->old_uid,
                'newUid' => $request->new_uid,
                'reason' => ucfirst($request->reason),
                'reasonNote' => $request->reason_note,
                'proofPath' => $request->proof_path,
                'requestedAt' => $request->requested_at->setTimezone(config('app.timezone'))->format('d M Y H:i'),
            ]);

        $history = CardRequest::query()
            ->with(['member', 'decider'])
            ->whereIn('request_status', ['approved', 'rejected'])
            ->latest('decided_at')
            ->get()
            ->map(fn (CardRequest $request) => [
                'id' => 'REQ-' . str_pad($request->id, 4, '0', STR_PAD_LEFT),
                'memberName' => $request->member->name,
                'oldUid' => $request->old_uid,
                'newUid' => $request->new_uid,
                'status' => $request->request_status,
                'decidedAt' => $request->decided_at?->setTimezone(config('app.timezone'))->format('d M Y H:i'),
                'decidedBy' => $request->decider?->name ?? '-',
            ]);

        return Inertia::render('card-replacement/index', [
            'pending' => $pending,
            'history' => $history,
        ]);
    }

    public function searchMember(Request $request): JsonResponse
    {
        Gate::authorize('cardRequests.request');

        $validated = $request->validate([
            'query' => ['required', 'string', 'min:2'],
        ]);

        $query = trim($validated['query']);

        $members = Member::query()
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('phone', 'like', "%{$query}%")
                    ->orWhere('member_code', 'like', "%{$query}%");
            })
            ->limit(10)
            ->get()
            ->map(fn (Member $member) => [
                'id' => $member->id,
                'name' => $member->name,
                'memberCode' => $member->member_code,
                'phone' => $member->phone,
                'cardUid' => $member->card_uid,
                'status' => $member->status,
            ]);

        return response()->json($members);
    }

    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('cardRequests.request');

        $validated = $request->validate([
            'member_id' => ['required', 'uuid', 'exists:members,id'],
            'old_uid' => ['required', 'string', 'digits:10'],
            'new_uid' => ['required', 'string', 'digits:10', 'unique:card_requests,new_uid'],
            'reason' => ['required', 'in:hilang,rusak,dicuri,lainnya'],
            'reason_note' => ['nullable', 'string', 'max:500'],
            'proof' => ['nullable', 'file', 'mimes:jpeg,jpg,png,pdf', 'max:5120'], // 5MB max
        ]);

        // Validasi member harus aktif
        $member = Member::findOrFail($validated['member_id']);
        if ($member->status !== 'active') {
            return back()->withErrors([
                'member_id' => 'Member harus dalam status aktif untuk dapat mengajukan penggantian kartu.',
            ]);
        }

        // Validasi old_uid harus sama dengan card_uid member
        if ($member->card_uid !== $validated['old_uid']) {
            return back()->withErrors([
                'old_uid' => 'UID lama tidak sesuai dengan kartu member saat ini.',
            ]);
        }

        // Validasi new_uid tidak boleh sudah digunakan oleh member lain
        $existingMember = Member::where('card_uid', $validated['new_uid'])->first();
        if ($existingMember && $existingMember->id !== $member->id) {
            return back()->withErrors([
                'new_uid' => 'UID baru sudah digunakan oleh member lain.',
            ]);
        }

        // Upload proof file jika ada
        $proofPath = null;
        if ($request->hasFile('proof')) {
            $proofPath = $request->file('proof')->store('card-requests/proofs', 'public');
        }

        CardRequest::create([
            'member_id' => $validated['member_id'],
            'old_uid' => $validated['old_uid'],
            'new_uid' => $validated['new_uid'],
            'reason' => $validated['reason'],
            'reason_note' => $validated['reason_note'] ?? null,
            'proof_path' => $proofPath,
            'request_status' => 'pending',
            'requested_at' => CarbonImmutable::now(),
        ]);

        return back()->with('success', 'Request penggantian kartu berhasil diajukan.');
    }

    public function approve(Request $request, CardRequest $cardRequest): RedirectResponse
    {
        Gate::authorize('cardRequests.approve');

        if ($cardRequest->request_status !== 'pending') {
            return back()->withErrors([
                'error' => 'Request ini sudah diproses sebelumnya.',
            ]);
        }

        // Validasi new_uid tidak boleh sudah digunakan
        $existingMember = Member::where('card_uid', $cardRequest->new_uid)->first();
        if ($existingMember && $existingMember->id !== $cardRequest->member_id) {
            return back()->withErrors([
                'error' => 'UID baru sudah digunakan oleh member lain.',
            ]);
        }

        \DB::transaction(function () use ($cardRequest) {
            // Update member card_uid
            $cardRequest->member->update([
                'card_uid' => $cardRequest->new_uid,
            ]);

            // Update request status
            $cardRequest->update([
                'request_status' => 'approved',
                'decided_at' => CarbonImmutable::now(),
                'decided_by' => auth()->id(),
            ]);
        });

        return back()->with('success', 'Request penggantian kartu berhasil disetujui.');
    }

    public function reject(Request $request, CardRequest $cardRequest): RedirectResponse
    {
        Gate::authorize('cardRequests.approve');

        if ($cardRequest->request_status !== 'pending') {
            return back()->withErrors([
                'error' => 'Request ini sudah diproses sebelumnya.',
            ]);
        }

        $cardRequest->update([
            'request_status' => 'rejected',
            'decided_at' => CarbonImmutable::now(),
            'decided_by' => auth()->id(),
        ]);

        return back()->with('success', 'Request penggantian kartu ditolak.');
    }

    public function showProof(CardRequest $cardRequest)
    {
        if (! Gate::any(['cardRequests.request', 'cardRequests.approve'])) {
            abort(403);
        }

        if (! $cardRequest->proof_path) {
            abort(404);
        }

        $path = Storage::disk('public')->path($cardRequest->proof_path);

        if (! file_exists($path)) {
            abort(404);
        }

        return response()->file($path);
    }
}

