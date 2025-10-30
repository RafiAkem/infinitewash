<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class SeedUserAccounts extends Seeder
{
    public function run(): void
    {
        $user = User::updateOrCreate(
            ['username' => 'Infinitewash'],
            [
                'name' => 'Owner Account',
                'email' => 'owner@infinitewash.local',
                'password' => Hash::make('GetRekt22'),
                'email_verified_at' => now(),
            ]
        );

        $role = Role::where('name', 'Owner')->first();

        if ($role) {
            $user->assignRole($role);
        }
    }
}
