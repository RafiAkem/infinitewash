<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('members')
            ->select('id', 'phone')
            ->orderBy('id')
            ->lazyById()
            ->each(function ($member): void {
                $normalized = $this->normalizePhone($member->phone);

                if ($normalized === null) {
                    return;
                }

                DB::table('members')
                    ->where('id', $member->id)
                    ->update(['phone' => $normalized]);
            });
    }

    public function down(): void
    {
        // Phone normalization is irreversible.
    }

    private function normalizePhone(?string $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        $digits = preg_replace('/\D+/', '', $value);

        if ($digits === '') {
            return null;
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
};
