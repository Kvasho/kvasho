<?php

use App\Http\Middleware\EnsureCompanyMember;
use App\Http\Middleware\SetLocaleFromHeader;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(prepend: [SetLocaleFromHeader::class]);

        // Settle the user's current company before route model binding, which
        // already applies the tenant scope to the models it looks up.
        $middleware->prependToPriorityList(
            before: SubstituteBindings::class,
            prepend: EnsureCompanyMember::class,
        );
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        // Framework messages ("Unauthenticated." and the like) are plain English
        // strings; pass them through the translator so lang/ka.json applies.
        $exceptions->respond(function (Response $response): Response {
            if ($response instanceof JsonResponse && is_string($response->getData(true)['message'] ?? null)) {
                $data = $response->getData(true);
                $data['message'] = __($data['message']);
                $response->setData($data);
            }

            return $response;
        });
    })->create();
