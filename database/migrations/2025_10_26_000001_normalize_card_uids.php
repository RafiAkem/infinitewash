<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private array $memberUidUsed = [];

    private array $cardRequestUidUsed = [];

    public function up(): void
    {
        $this->normalizeMemberUids();
        $this->normalizeCardRequestUids();
    }

    public function down(): void
    {
        // No rollback required; historical values are not preserved.
    }

    private function normalizeMemberUids(): void
    {
        foreach (DB::table('members')->select('id', 'card_uid')->orderBy('id')->cursor() as $member) {
            $normalized = $this->generateUniqueDigits($member->card_uid, $this->memberUidUsed);

            if ($normalized === null) {
                continue;
            }

            DB::table('members')
                ->where('id', $member->id)
                ->update(['card_uid' => $normalized]);
        }
    }

    private function normalizeCardRequestUids(): void
    {
        foreach (DB::table('card_requests')->select('id', 'old_uid', 'new_uid')->orderBy('id')->cursor() as $request) {
            $updates = [];

            $normalizedOld = $this->normalizeDigits($request->old_uid);
            if ($normalizedOld !== null) {
                $updates['old_uid'] = $normalizedOld;
            }

            $normalizedNew = $this->generateUniqueDigits($request->new_uid, $this->cardRequestUidUsed);
            if ($normalizedNew !== null) {
                $updates['new_uid'] = $normalizedNew;
            }

            if ($updates !== []) {
                DB::table('card_requests')
                    ->where('id', $request->id)
                    ->update($updates);
            }
        }
    }

    private function generateUniqueDigits(?string $value, array &$used): ?string
    {
        $normalized = $this->normalizeDigits($value);

        if ($normalized === null) {
            return null;
        }

        while (in_array($normalized, $used, true)) {
            $normalized = str_pad((string) random_int(0, 999_999_999), 9, '0', STR_PAD_LEFT);
        }

        $used[] = $normalized;

        return $normalized;
    }

    private function normalizeDigits(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $digits = preg_replace('/\D+/', '', $value);

        if ($digits === '') {
            $digits = str_pad((string) random_int(0, 999_999_999), 9, '0', STR_PAD_LEFT);
        }

        $digits = substr($digits, -9);

        return str_pad($digits, 9, '0', STR_PAD_LEFT);
    }
};
