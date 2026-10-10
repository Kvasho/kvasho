<?php

namespace App\Http\Resources;

use App\Models\GeoGame;
use App\Models\GeoGameRound;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The state of a game as the player may see it: the question of the round
 * being played, and full details of the rounds already answered. Coordinates
 * of countries that are still to be guessed are never included.
 *
 * @mixin GeoGame
 */
class GeoGameResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $currentRound = $this->isFinished()
            ? null
            : $this->rounds->firstWhere('round_number', $this->current_round);

        return [
            'token' => $this->token,
            'status' => $this->status->value,
            'total_rounds' => $this->rounds->count(),
            'current_round' => $this->current_round,
            'total_score' => $this->total_score,
            'total_distance_km' => $this->total_distance_km,
            'win_distance_km' => config('geoguess.win_distance_km'),
            'max_score' => $this->rounds->count() * config('geoguess.max_round_score'),
            'question' => $currentRound ? self::question($currentRound) : null,
            'rounds' => $this->rounds
                ->filter(fn (GeoGameRound $round): bool => $round->isAnswered())
                ->map(fn (GeoGameRound $round): array => [
                    'round' => $round->round_number,
                    'country_name' => $round->country->name,
                    'flag_url' => $round->country->flag_url,
                    'guess' => ['lat' => $round->guess_lat, 'lng' => $round->guess_lng],
                    'correct' => ['lat' => $round->country->lat, 'lng' => $round->country->lng],
                    'distance_km' => $round->distance_km,
                    'score' => $round->score,
                ])
                ->values(),
        ];
    }

    /**
     * What the player is shown for a round they have not answered yet.
     *
     * @return array{round: int, country_name: string, flag_url: string|null}
     */
    public static function question(GeoGameRound $round): array
    {
        return [
            'round' => $round->round_number,
            'country_name' => $round->country->name,
            'flag_url' => $round->country->flag_url,
        ];
    }
}
