<?php

use App\Http\Controllers\MemberController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\ScanController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', '/login')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('members', [MemberController::class, 'index'])->name('members.index');
    Route::get('members/create', [MemberController::class, 'create'])->name('members.create');
    Route::post('members', [MemberController::class, 'store'])->name('members.store');
    Route::delete('members', [MemberController::class, 'destroyMany'])->name('members.destroyMany');
    Route::get('members/{member}', [MemberController::class, 'show'])->name('members.show');

    Route::get('membership', function () {
        return Inertia::render('membership/index');
    })->name('membership.index');

    Route::get('status-check', function () {
        return Inertia::render('status-check/index');
    })->name('status-check.index');

    Route::get('scan', [ScanController::class, 'index'])->name('scan.index');
    Route::post('scan', [ScanController::class, 'store'])->name('scan.store');

    Route::get('card-replacement', function () {
        return Inertia::render('card-replacement/index');
    })->name('card-replacement.index');

    Route::get('reports', [ReportsController::class, 'index'])->name('reports.index');

    Route::get('accounts', function () {
        return Inertia::render('accounts/index');
    })->name('accounts.index');

    Route::get('roles-permissions', function () {
        return Inertia::render('roles-permissions/index');
    })->name('roles-permissions.index');

    Route::get('backup', function () {
        return Inertia::render('backup/index');
    })->name('backup.index');

    Route::get('admin-settings', function () {
        return Inertia::render('settings/admin');
    })->name('settings.admin');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
