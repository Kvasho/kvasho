<?php

namespace App\Models;

use Database\Factories\GeoGameRoundFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'geo_game_id',
    'round_number',
    'country_id',
    'guess_lat',
    'guess_lng',
    'distance_km',
    'score',
    'answered_at',
])]
class GeoGameRound extends Model
{
    /** @use HasFactory<GeoGameRoundFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'guess_lat' => 'float',
            'guess_lng' => 'float',
            'answered_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<GeoGame, $this>
     */
    public function game(): BelongsTo
    {
        return $this->belongsTo(GeoGame::class, 'geo_game_id');
    }

    /**
     * @return BelongsTo<Country, $this>
     */
    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }

    public function isAnswered(): bool
    {
        return $this->answered_at !== null;
    }
}
