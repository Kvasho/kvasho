<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\GeoGameStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\GeoGameResource;
use App\Models\Country;
use App\Models\GeoGame;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class GeoGameController extends Controller
{
    /**
     * Start a game: pick its countries, one per round, and return the first question.
     */
    public function store(): GeoGameResource
    {
        $roundCount = config('geoguess.rounds');

        $countryIds = Country::query()
            ->where('independent', true)
            ->inRandomOrder()
            ->limit($roundCount)
            ->pluck('id');

        abort_if($countryIds->count() < $roundCount, 503, 'Not enough countries to start a game.');

        $game = DB::transaction(function () use ($countryIds): GeoGame {
            $game = GeoGame::create([
                'token' => (string) Str::uuid(),
                'status' => GeoGameStatus::InProgress,
                'current_round' => 1,
            ]);

            $game->rounds()->createMany(
                $countryIds->values()->map(fn (int $countryId, int $index): array => [
                    'round_number' => $index + 1,
                    'country_id' => $countryId,
                ])->all(),
            );

            return $game;
        });

        return new GeoGameResource($game->refresh()->load('rounds.country'));
    }

    /**
     * Show the current state of a game, so the player can pick it up again.
     */
    public function show(GeoGame $game): GeoGameResource
    {
        return new GeoGameResource($game->load('rounds.country'));
    }
}
