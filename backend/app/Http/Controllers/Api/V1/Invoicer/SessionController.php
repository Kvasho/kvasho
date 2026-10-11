<?php

namespace App\Http\Controllers\Api\V1\Invoicer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Invoicer\LoginRequest;
use App\Http\Resources\Invoicer\CurrentUserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class SessionController extends Controller
{
    /**
     * Sign in with email and password, starting a cookie session for the SPA.
     */
    public function store(LoginRequest $request): CurrentUserResource
    {
        $credentials = $request->safe()->only(['email', 'password']);

        if (! Auth::guard('web')->attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        return new CurrentUserResource(Auth::guard('web')->user()->load('currentCompany'));
    }

    /**
     * Sign out and throw the session away.
     */
    public function destroy(Request $request): Response
    {
        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->noContent();
    }
}
