<?php

use App\Http\Controllers\AccountsController;
use App\Http\Controllers\CardRequestController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\MembershipController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\RolesPermissionsController;
use App\Http\Controllers\ScanController;
use App\Http\Controllers\StatusCheckController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', '/login')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('members', [MemberController::class, 'index'])->name('members.index');
    Route::get('members/create', [MemberController::class, 'create'])->name('members.create');
    Route::post('members/check-phone', [MemberController::class, 'checkPhone'])->name('members.checkPhone');
    Route::post('members/check-card-uid', [MemberController::class, 'checkCardUid'])->name('members.checkCardUid');
    Route::post('members', [MemberController::class, 'store'])->name('members.store');
    Route::delete('members', [MemberController::class, 'destroyMany'])->name('members.destroyMany');
    Route::get('members/{member}', [MemberController::class, 'show'])->name('members.show');
    Route::post('members/{member}/extend', [MemberController::class, 'extend'])->name('members.extend');
    Route::post('members/{member}/vehicles', [MemberController::class, 'storeVehicle'])->name('members.storeVehicle');

    Route::get('membership', [MembershipController::class, 'index'])->name('membership.index');

    Route::get('status-check', [StatusCheckController::class, 'index'])->name('status-check.index');
    Route::post('status-check', [StatusCheckController::class, 'check'])->name('status-check.check');

    Route::get('scan', [ScanController::class, 'index'])->name('scan.index');
    Route::post('scan', [ScanController::class, 'store'])->name('scan.store');
    Route::post('scan/lookup', [ScanController::class, 'lookup'])->name('scan.lookup');

    Route::get('card-replacement', [CardRequestController::class, 'index'])->name('card-replacement.index');
    Route::post('card-replacement/search-member', [CardRequestController::class, 'searchMember'])->name('card-replacement.search-member');
    Route::post('card-replacement', [CardRequestController::class, 'store'])->name('card-replacement.store');
    Route::post('card-replacement/{cardRequest}/approve', [CardRequestController::class, 'approve'])->name('card-replacement.approve');
    Route::post('card-replacement/{cardRequest}/reject', [CardRequestController::class, 'reject'])->name('card-replacement.reject');
    Route::get('card-replacement/{cardRequest}/proof', [CardRequestController::class, 'showProof'])->name('card-replacement.proof');

    Route::get('reports', [ReportsController::class, 'index'])->name('reports.index');

    Route::get('accounts', [AccountsController::class, 'index'])->name('accounts.index');
    Route::post('accounts', [AccountsController::class, 'store'])->name('accounts.store');
    Route::get('accounts/{user}', [AccountsController::class, 'show'])->name('accounts.show');
    Route::put('accounts/{user}/password', [AccountsController::class, 'updatePassword'])->name('accounts.updatePassword');
    Route::delete('accounts/{user}', [AccountsController::class, 'destroy'])->name('accounts.destroy');

    Route::get('roles-permissions', [RolesPermissionsController::class, 'index'])->name('roles-permissions.index');
    Route::put('roles-permissions', [RolesPermissionsController::class, 'update'])->name('roles-permissions.update');
    Route::post('roles-permissions/reset', [RolesPermissionsController::class, 'reset'])->name('roles-permissions.reset');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
