<?php

use App\Http\Controllers\Api\V1\GeoGameController;
use App\Http\Controllers\Api\V1\GeoGameGuessController;
use App\Http\Controllers\Api\V1\Invoicer\ClientController;
use App\Http\Controllers\Api\V1\Invoicer\CompanyController;
use App\Http\Controllers\Api\V1\Invoicer\CompanyLogoController;
use App\Http\Controllers\Api\V1\Invoicer\CurrentUserController;
use App\Http\Controllers\Api\V1\Invoicer\RegisterController;
use App\Http\Controllers\Api\V1\Invoicer\SessionController;
use App\Http\Controllers\Api\V1\LineupGuessController;
use App\Http\Controllers\Api\V1\MatchController;
use App\Http\Controllers\Api\V1\MatchLineupController;
use App\Http\Controllers\Api\V1\PlayerController;
use App\Http\Middleware\EnsureCompanyMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('v1')->name('api.v1.')->group(function () {
    Route::get('/matches', [MatchController::class, 'index'])->name('matches.index');
    Route::get('/matches/{match}/lineups', [MatchLineupController::class, 'show'])->name('matches.lineups.show');
    Route::post('/matches/{match}/lineups/{lineupPlayer}/guesses', [LineupGuessController::class, 'store'])
        ->scopeBindings()
        ->name('matches.lineups.guesses.store');
    Route::get('/players', [PlayerController::class, 'index'])->name('players.index');

    Route::post('/geo/games', [GeoGameController::class, 'store'])->name('geo.games.store');
    Route::get('/geo/games/{game:token}', [GeoGameController::class, 'show'])->name('geo.games.show');
    Route::post('/geo/games/{game:token}/guess', [GeoGameGuessController::class, 'store'])->name('geo.games.guess');

    // Invoicer: cookie-session SPA auth, so only this group is stateful (and CSRF-protected).
    Route::prefix('invoicer')->name('invoicer.')->middleware(EnsureFrontendRequestsAreStateful::class)->group(function () {
        Route::middleware('throttle:10,1')->group(function () {
            Route::post('/register', [RegisterController::class, 'store'])->name('register');
            Route::post('/login', [SessionController::class, 'store'])->name('login');
        });

        Route::middleware(['auth:sanctum', EnsureCompanyMember::class])->group(function () {
            Route::post('/logout', [SessionController::class, 'destroy'])->name('logout');
            Route::get('/me', [CurrentUserController::class, 'show'])->name('me');

            Route::get('/company', [CompanyController::class, 'show'])->name('company.show');
            Route::patch('/company', [CompanyController::class, 'update'])->name('company.update');
            Route::post('/company/logo', [CompanyLogoController::class, 'store'])->name('company.logo.store');
            Route::delete('/company/logo', [CompanyLogoController::class, 'destroy'])->name('company.logo.destroy');

            Route::apiResource('clients', ClientController::class);
        });
    });
});
