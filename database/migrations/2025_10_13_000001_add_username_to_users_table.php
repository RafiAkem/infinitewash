<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'username')) {
                $table->string('username')->unique()->after('name');
            }
        });

        $existingUsernames = [];

        DB::table('users')->select('id', 'email', 'username')->orderBy('id')->get()->each(function ($user) use (&$existingUsernames) {
            if (! empty($user->username)) {
                $existingUsernames[] = $user->username;
                return;
            }

            $base = Str::slug(Str::before((string) $user->email, '@'), '_');

            if ($base === '') {
                $base = 'user_'.$user->id;
            }

            $candidate = $base;
            $suffix = 1;

            while (in_array($candidate, $existingUsernames, true)) {
                $candidate = $base.'_'.(++$suffix);
            }

            DB::table('users')
                ->where('id', $user->id)
                ->update(['username' => $candidate]);

            $existingUsernames[] = $candidate;
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'username')) {
                $table->dropUnique(['username']);
                $table->dropColumn('username');
            }
        });
    }
};
