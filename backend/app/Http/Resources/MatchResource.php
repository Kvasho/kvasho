<?php

namespace App\Http\Resources;

use App\Models\FootballMatch;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin FootballMatch
 */
class MatchResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'date' => $this->match_date->toDateString(),
            'kick_off' => $this->kick_off,
            'season' => $this->season,
            'stage' => $this->stage,
            'stadium' => $this->stadium,
            'competition' => [
                'id' => $this->competition->id,
                'name' => $this->competition->name,
                'country' => $this->competition->country,
                'gender' => $this->competition->gender,
            ],
            'home_team' => [
                'id' => $this->homeTeam->id,
                'name' => $this->homeTeam->name,
            ],
            'away_team' => [
                'id' => $this->awayTeam->id,
                'name' => $this->awayTeam->name,
            ],
            'home_score' => $this->home_score,
            'away_score' => $this->away_score,
        ];
    }
}
