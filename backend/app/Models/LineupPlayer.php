<?php

namespace App\Models;

use Database\Factories\LineupPlayerFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'football_match_id',
    'team_id',
    'player_id',
    'jersey_number',
    'is_starter',
    'position_id',
    'position',
])]
class LineupPlayer extends Model
{
    /** @use HasFactory<LineupPlayerFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_starter' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<FootballMatch, $this>
     */
    public function footballMatch(): BelongsTo
    {
        return $this->belongsTo(FootballMatch::class);
    }

    /**
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * @return BelongsTo<Player, $this>
     */
    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class);
    }
}
