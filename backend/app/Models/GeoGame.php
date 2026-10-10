<?php

namespace App\Models;

use App\Enums\GeoGameStatus;
use Database\Factories\GeoGameFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['token', 'status', 'current_round', 'total_score', 'total_distance_km'])]
class GeoGame extends Model
{
    /** @use HasFactory<GeoGameFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => GeoGameStatus::class,
        ];
    }

    /**
     * @return HasMany<GeoGameRound, $this>
     */
    public function rounds(): HasMany
    {
        return $this->hasMany(GeoGameRound::class)->orderBy('round_number');
    }

    public function isFinished(): bool
    {
        return $this->status !== GeoGameStatus::InProgress;
    }
}
