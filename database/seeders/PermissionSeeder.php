<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = collect([
            'members.view',
            'members.create',
            'members.update',
            'members.delete',
            'vehicles.create',
            'vehicles.update',
            'vehicles.delete',
            'memberships.create',
            'memberships.extend',
            'memberships.view',
            'scan.use',
            'status.check',
            'reports.view',
            'accounts.manage',
            'roles.manage',
            'permissions.manage',
            'cardRequests.request',
            'cardRequests.approve',
            'backup.manage',
        ]);

        $permissions->each(function (string $name): void {
            Permission::firstOrCreate([
                'name' => $name,
                'guard_name' => 'web',
            ]);
        });

        $this->syncRoles();
    }

    private function syncRoles(): void
    {
        $matrix = [
            'Owner' => [
                'members.*',
                'vehicles.*',
                'memberships.*',
                'scan.use',
                'status.check',
                'reports.view',
                'accounts.manage',
                'roles.manage',
                'permissions.manage',
                'cardRequests.request',
                'cardRequests.approve',
                'backup.manage',
            ],
            'Manager' => [
                'members.view',
                'members.create',
                'members.update',
                'vehicles.create',
                'vehicles.update',
                'vehicles.delete',
                'memberships.create',
                'memberships.extend',
                'memberships.view',
                'scan.use',
                'status.check',
                'reports.view',
                'cardRequests.approve',
            ],
            'Cashier' => [
                'members.view',
                'scan.use',
                'status.check',
                'cardRequests.request',
            ],
        ];

        foreach ($matrix as $roleName => $perms) {
            $role = Role::firstOrCreate([
                'name' => $roleName,
                'guard_name' => 'web',
            ]);

            $flattened = collect($perms)
                ->flatMap(function (string $permission) {
                    if (str_contains($permission, '*')) {
                        $prefix = rtrim($permission, '*');
                        return Permission::query()
                            ->where('guard_name', 'web')
                            ->where('name', 'like', $prefix . '%')
                            ->pluck('name');
                    }

                    return [$permission];
                })
                ->unique()
                ->values();

            $role->syncPermissions($flattened);
        }
    }
}
