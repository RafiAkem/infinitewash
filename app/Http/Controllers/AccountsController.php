<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class AccountsController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('accounts.manage');

        $search = trim((string) $request->string('search'));
        $roleFilter = $request->string('role')->toString();
        $statusFilter = $request->string('status')->toString();

        $usersQuery = User::query()
            ->with('roles')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%");
                });
            })
            ->when($roleFilter !== '' && $roleFilter !== 'all', function ($query) use ($roleFilter) {
                $query->whereHas('roles', function ($q) use ($roleFilter) {
                    $q->where('name', $roleFilter);
                });
            })
            ->latest();

        $users = $usersQuery
            ->get()
            ->map(function (User $user) {
                // Get last activity from sessions table
                $lastActivity = DB::table('sessions')
                    ->where('user_id', $user->id)
                    ->max('last_activity');

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'roles' => $user->roles->pluck('name')->toArray(),
                    'status' => $user->email_verified_at ? 'Active' : 'Suspended',
                    'last_login' => $lastActivity 
                        ? \Carbon\Carbon::createFromTimestamp($lastActivity)
                            ->setTimezone(config('app.timezone'))
                            ->format('d M Y H:i')
                        : '—',
                ];
            });

        $roles = Role::query()
            ->whereIn('name', ['Owner', 'Cashier'])
            ->get()
            ->map(fn (Role $role) => [
                'name' => $role->name,
            ]);

        return Inertia::render('accounts/index', [
            'users' => $users,
            'roles' => $roles,
            'filters' => [
                'search' => $search,
                'role' => $roleFilter !== '' ? $roleFilter : 'all',
                'status' => $statusFilter !== '' ? $statusFilter : 'all',
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('accounts.manage');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', 'unique:users,username'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => ['required', 'string', 'exists:roles,name'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'email_verified_at' => now(),
        ]);

        $role = Role::findByName($validated['role'], 'web');
        $user->assignRole($role);

        return redirect()->route('accounts.index')->with('success', 'Akun berhasil ditambahkan.');
    }

    public function show(User $user): \Illuminate\Http\JsonResponse
    {
        Gate::authorize('accounts.manage');

        $lastActivity = DB::table('sessions')
            ->where('user_id', $user->id)
            ->max('last_activity');

        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'roles' => $user->roles->pluck('name')->toArray(),
            'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
            'status' => $user->email_verified_at ? 'Active' : 'Suspended',
            'email_verified_at' => $user->email_verified_at 
                ? \Carbon\Carbon::parse($user->email_verified_at)
                    ->setTimezone(config('app.timezone'))
                    ->format('d M Y H:i')
                : null,
            'created_at' => $user->created_at
                ->setTimezone(config('app.timezone'))
                ->format('d M Y H:i'),
            'last_login' => $lastActivity 
                ? \Carbon\Carbon::createFromTimestamp($lastActivity)
                    ->setTimezone(config('app.timezone'))
                    ->format('d M Y H:i')
                : '—',
        ];

        return response()->json($userData);
    }

    public function updatePassword(Request $request, User $user): RedirectResponse
    {
        Gate::authorize('accounts.manage');
        
        // Only Owner can change passwords
        if (!$request->user()->hasRole('Owner')) {
            abort(403, 'Hanya Owner yang dapat mengubah password akun.');
        }

        $validated = $request->validate([
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user->password = Hash::make($validated['password']);
        $user->save();

        return redirect()->route('accounts.index')->with('success', 'Password akun berhasil diubah.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        Gate::authorize('accounts.manage');
        
        // Only Owner can delete accounts
        if (!$request->user()->hasRole('Owner')) {
            abort(403, 'Hanya Owner yang dapat menghapus akun.');
        }

        // Prevent deleting own account
        if ($user->id === $request->user()->id) {
            return redirect()->route('accounts.index')->withErrors([
                'user' => 'Tidak dapat menghapus akun sendiri.',
            ]);
        }

        // Prevent deleting Owner account
        if ($user->hasRole('Owner')) {
            return redirect()->route('accounts.index')->withErrors([
                'user' => 'Tidak dapat menghapus akun Owner.',
            ]);
        }

        $user->delete();

        return redirect()->route('accounts.index')->with('success', 'Akun berhasil dihapus.');
    }
}

