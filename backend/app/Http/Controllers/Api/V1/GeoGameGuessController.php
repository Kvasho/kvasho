<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\GeoGameResource;
use App\Models\GeoGame;
use App\Models\GeoGameRound;
use App\Services\GeoScoringService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GeoGameGuessController extends Controller
{
    /**
     * Score the player's guess for the round being played.
     *
     * Responds with how the guess did and where the country really is, plus
     * the next question, or the final result once the last round is answered.
     */
    public function store(Request $request, GeoGame $game, GeoScoringService $scoring): JsonResponse
    {
        $validated = $request->validate([
            'lat' => ['required', 'numeric', 'between:-90,90'],
            'lng' => ['required', 'numeric', 'between:-180,180'],
            // The round the player believes they are answering. Sending it
            // lets a repeated request be told apart from a new guess.
            'round' => ['sometimes', 'integer', 'min:1'],
        ]);

        $round = DB::transaction(function () use ($validated, $game, $scoring): GeoGameRound {
            // Lock the game so two guesses sent at once cannot both be scored.
            $game = GeoGame::whereKey($game->getKey())->lockForUpdate()->firstOrFail();

            abort_if($game->isFinished(), 409, 'This game is already finished.');
            abort_if(
                isset($validated['round']) && (int) $validated['round'] !== $game->current_round,
                409,
                'This round has already been answered.',
            );

            $round = $game->rounds()->with('country')->where('round_number', $game->current_round)->firstOrFail();
            abort_if($round->isAnswered(), 409, 'This round has already been answered.');

            $distanceKm = $scoring->distanceKm($round->country, (float) $validated['lat'], (float) $validated['lng']);
            $score = $scoring->score($distanceKm);

            $round->update([
                'guess_lat' => $validated['lat'],
                'guess_lng' => $validated['lng'],
                'distance_km' => $distanceKm,
                'score' => $score,
                'answered_at' => now(),
            ]);

            $game->total_score += $score;
            $game->total_distance_km += $distanceKm;

            if ($game->current_round >= $game->rounds()->count()) {
                $game->status = $scoring->outcome($game->total_distance_km);
            } else {
                $game->current_round++;
            }
            $game->save();

            return $round;
        });

        $game->refresh()->load('rounds.country');
        $nextRound = $game->isFinished() ? null : $game->rounds->firstWhere('round_number', $game->current_round);

        return response()->json([
            'data' => [
                'round' => $round->round_number,
                'distance_km' => $round->distance_km,
                'score' => $round->score,
                'correct' => [
                    'lat' => $round->country->lat,
                    'lng' => $round->country->lng,
                    'name' => $round->country->name,
                ],
                'total_score' => $game->total_score,
                'total_distance_km' => $game->total_distance_km,
                'status' => $game->status->value,
                'next_question' => $nextRound ? GeoGameResource::question($nextRound) : null,
                'result' => $game->isFinished() ? (new GeoGameResource($game))->resolve($request) : null,
            ],
        ]);
    }
}
