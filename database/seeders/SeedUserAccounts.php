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
        $accounts = [
            [
                'name' => 'Owner Account',
                'username' => 'owner',
                'email' => 'owner@infinitewash.local',
                'password' => 'password',
                'role' => 'Owner',
            ],
            [
                'name' => 'Manager Account',
                'username' => 'manager',
                'email' => 'manager@infinitewash.local',
                'password' => 'password',
                'role' => 'Manager',
            ],
            [
                'name' => 'Cashier Account',
                'username' => 'cashier',
                'email' => 'cashier@infinitewash.local',
                'password' => 'password',
                'role' => 'Cashier',
            ],
        ];

        foreach ($accounts as $account) {
            $user = User::updateOrCreate(
                ['username' => $account['username']],
                [
                    'name' => $account['name'],
                    'email' => $account['email'],
                    'password' => Hash::make($account['password']),
                    'email_verified_at' => now(),
                ]
            );

            $role = Role::where('name', $account['role'])->first();

            if ($role) {
                $user->assignRole($role);
            }
        }
    }
}
