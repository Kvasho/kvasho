<?php

use App\Http\Controllers\Api\V1\LineupGuessController;
use App\Http\Controllers\Api\V1\MatchController;
use App\Http\Controllers\Api\V1\MatchLineupController;
use App\Http\Controllers\Api\V1\PlayerController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

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
});
