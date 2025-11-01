<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountIsActive
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = Auth::user();

            // Check if user account is suspended (email_verified_at is null)
            if ($user->email_verified_at === null) {
                Auth::logout();

                $request->session()->invalidate();
                $request->session()->regenerateToken();

                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => 'Akun Anda telah ditangguhkan. Silakan hubungi administrator untuk bantuan.',
                    ], 403);
                }

                return redirect()->route('login')->withErrors([
                    'username' => 'Akun Anda telah ditangguhkan. Silakan hubungi administrator untuk bantuan.',
                ]);
            }
        }

        return $next($request);
    }
}

