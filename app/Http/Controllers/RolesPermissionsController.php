<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesPermissionsController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('permissions.manage');

        $roles = Role::query()
            ->whereIn('name', ['Owner', 'Cashier'])
            ->with('permissions')
            ->get()
            ->map(fn (Role $role) => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name')->toArray(),
            ]);

        $permissions = Permission::query()
            ->orderBy('name')
            ->get()
            ->map(fn (Permission $permission) => [
                'name' => $permission->name,
                'label' => $this->getPermissionLabel($permission->name),
                'icon' => $this->getPermissionIcon($permission->name),
            ]);

        return Inertia::render('roles-permissions/index', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        Gate::authorize('permissions.manage');

        $validated = $request->validate([
            'role' => ['required', 'string', 'in:Owner,Cashier'],
            'permissions' => ['required', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        // Prevent updating Owner permissions
        if ($validated['role'] === 'Owner') {
            return back()->withErrors([
                'role' => 'Tidak dapat mengubah permissions untuk role Owner.',
            ]);
        }

        $role = Role::findByName($validated['role'], 'web');
        $permissions = Permission::query()
            ->whereIn('name', $validated['permissions'])
            ->get();

        $role->syncPermissions($permissions);

        return back()->with('success', 'Permissions untuk ' . $validated['role'] . ' berhasil diperbarui.');
    }

    public function reset(): RedirectResponse
    {
        Gate::authorize('permissions.manage');

        $cashierRole = Role::findByName('Cashier', 'web');
        
        // Reset to default Cashier permissions
        $defaultPermissions = [
            'members.view',
            'scan.use',
            'status.check',
            'cardRequests.request',
        ];

        $permissions = Permission::query()
            ->whereIn('name', $defaultPermissions)
            ->get();

        $cashierRole->syncPermissions($permissions);

        return back()->with('success', 'Permissions untuk Cashier telah direset ke default.');
    }

    private function getPermissionLabel(string $name): string
    {
        return match ($name) {
            'members.view' => 'Daftar Member',
            'members.create' => 'Tambah Member',
            'members.update' => 'Edit Member',
            'members.delete' => 'Hapus Member',
            'vehicles.create' => 'Tambah Kendaraan',
            'vehicles.update' => 'Edit Kendaraan',
            'vehicles.delete' => 'Hapus Kendaraan',
            'memberships.create' => 'Tambah Membership',
            'memberships.extend' => 'Perpanjang Membership',
            'memberships.view' => 'Daftar Membership',
            'scan.use' => 'Scan Kartu Member',
            'status.check' => 'Cek Masa Berlaku',
            'reports.view' => 'Laporan',
            'accounts.manage' => 'Manajemen Akun',
            'roles.manage' => 'Kelola Roles',
            'permissions.manage' => 'Kelola Permissions',
            'cardRequests.request' => 'Request Ganti Kartu',
            'cardRequests.approve' => 'Approval Ganti Kartu',
            default => $name,
        };
    }

    private function getPermissionIcon(string $name): string
    {
        return match ($name) {
            'members.view', 'members.create', 'members.update', 'members.delete' => 'Users',
            'vehicles.create', 'vehicles.update', 'vehicles.delete' => 'Users',
            'memberships.create', 'memberships.extend', 'memberships.view' => 'CreditCard',
            'scan.use' => 'Scan',
            'status.check' => 'Search',
            'reports.view' => 'BarChart3',
            'accounts.manage' => 'UserCog',
            'roles.manage', 'permissions.manage' => 'ShieldCheck',
            'cardRequests.request', 'cardRequests.approve' => 'IdCard',
            default => 'Circle',
        };
    }
}

