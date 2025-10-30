<?php

namespace App\Http\Controllers;

use App\Models\Member;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class StatusCheckController extends Controller
{
    private const PACKAGES = [
        '299k' => ['name' => 'Basic', 'price' => 299000, 'quota' => 1],
        '499k' => ['name' => 'Plus', 'price' => 499000, 'quota' => 2],
        '669k' => ['name' => 'Premium', 'price' => 669000, 'quota' => 3],
    ];

    public function index(): Response
    {
        Gate::authorize('status.check');

        return Inertia::render('status-check/index');
    }

    public function check(Request $request): JsonResponse
    {
        Gate::authorize('status.check');

        $validated = $request->validate([
            'card_uid' => ['nullable', 'string'],
            'phone' => ['nullable', 'string'],
        ]);

        if (empty($validated['card_uid']) && empty($validated['phone'])) {
            return response()->json([
                'success' => false,
                'message' => 'Card UID atau nomor telepon harus diisi.',
            ], 400);
        }

        $memberQuery = Member::query()
            ->with([
                'vehicles' => fn ($query) => $query->orderBy('created_at'),
                'memberships' => fn ($query) => $query->orderByDesc('valid_to')
            ]);

        if (!empty($validated['card_uid'])) {
            $memberQuery->where('card_uid', $validated['card_uid']);
        } else {
            // Normalize phone number
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

            if ($variants !== []) {
                $memberQuery->where(function ($query) use ($variants, $replaceExpression) {
                    foreach ($variants as $index => $variant) {
                        if ($index === 0) {
                            $query->whereRaw("{$replaceExpression} = ?", [$variant]);
                        } else {
                            $query->orWhereRaw("{$replaceExpression} = ?", [$variant]);
                        }
                    }
                });
            } else {
                $memberQuery->where('phone', 'like', '%' . $validated['phone'] . '%');
            }
        }

        $member = $memberQuery->first();

        if (!$member) {
            return response()->json([
                'success' => false,
                'message' => 'Member tidak ditemukan.',
            ], 404);
        }

        $now = CarbonImmutable::now();
        $activeMembership = $member->memberships
            ->first(function ($membership) use ($now) {
                if ($membership->status !== 'active') {
                    return false;
                }

                $validTo = CarbonImmutable::make($membership->valid_to)->endOfDay();

                return $validTo->greaterThanOrEqualTo($now);
            });

        $daysLeft = 0;
        if ($activeMembership) {
            $expiry = CarbonImmutable::make($activeMembership->valid_to)->endOfDay();
            $daysLeft = max(0, $now->diffInDays($expiry, false));
        }

        // Get package info
        $package = self::PACKAGES[$member->package] ?? null;

        // Get vehicles from database - filter out empty plates
        $vehicles = $member->vehicles
            ->map(fn ($vehicle) => [
                'plate' => $vehicle->plate,
                'color' => $vehicle->color ?? '',
            ])
            ->filter(fn ($vehicle) => !empty($vehicle['plate']))
            ->values()
            ->toArray();

        return response()->json([
            'success' => true,
            'member' => [
                'id' => $member->id,
                'member_code' => $member->member_code,
                'name' => $member->name,
                'phone' => $member->phone,
                'package' => $member->package,
                'package_name' => $package['name'] ?? $member->package,
                'package_quota' => $package['quota'] ?? 1,
                'status' => $member->status,
                'expires_at' => $activeMembership 
                    ? $activeMembership->valid_to->setTimezone(config('app.timezone'))->format('d M Y')
                    : null,
                'days_left' => $daysLeft,
                'is_active' => $member->status === 'active' && $activeMembership !== null,
                'vehicles' => $vehicles,
            ],
        ]);
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
