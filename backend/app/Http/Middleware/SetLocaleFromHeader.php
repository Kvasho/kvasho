<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Answers in the language the frontend asks for with Accept-Language, so
 * validation and other messages match the page the user is on.
 */
class SetLocaleFromHeader
{
    /**
     * Languages the API has translations for; the first one is the default.
     *
     * @var list<string>
     */
    public const array SUPPORTED = ['en', 'ka'];

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        app()->setLocale($request->getPreferredLanguage(self::SUPPORTED) ?? self::SUPPORTED[0]);

        return $next($request);
    }
}
