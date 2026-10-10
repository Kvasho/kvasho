<?php

namespace App\Http\Resources;

use App\Models\FootballMatch;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin FootballMatch
 */
class MatchLineupResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'home_team' => LineupSlotResource::collection(
                $this->starters->where('team_id', $this->home_team_id)->values(),
            ),
            'away_team' => LineupSlotResource::collection(
                $this->starters->where('team_id', $this->away_team_id)->values(),
            ),
        ];
    }
}
