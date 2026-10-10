<?php

namespace App\Http\Resources;

use App\Models\LineupPlayer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A starting position on the pitch. Who played there is deliberately left
 * out: that is what the user has to guess.
 *
 * @mixin LineupPlayer
 */
class LineupSlotResource extends JsonResource
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
            'position_id' => $this->position_id,
            'position' => $this->position,
        ];
    }
}
