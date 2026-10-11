<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Makes sure the signed-in user really belongs to their current company
 * before any tenant data is touched. If they were removed from it, they are
 * moved to another company they belong to, or refused when there is none.
 */
class EnsureCompanyMember
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user->currentRole() === null) {
            $fallback = $user->companies->first();

            abort_if($fallback === null, Response::HTTP_FORBIDDEN, 'You do not belong to any company.');

            $user->update(['current_company_id' => $fallback->id]);
        }

        return $next($request);
    }
}
