<?php

namespace App\Models;

use Database\Factories\FootballMatchFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'statsbomb_id',
    'competition_id',
    'season',
    'home_team_id',
    'away_team_id',
    'match_date',
    'kick_off',
    'home_score',
    'away_score',
    'stage',
    'stadium',
])]
class FootballMatch extends Model
{
    /** @use HasFactory<FootballMatchFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'match_date' => 'date',
        ];
    }

    /**
     * @return BelongsTo<Competition, $this>
     */
    public function competition(): BelongsTo
    {
        return $this->belongsTo(Competition::class);
    }

    /**
     * @return BelongsTo<Team, $this>
     */
    public function homeTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'home_team_id');
    }

    /**
     * @return BelongsTo<Team, $this>
     */
    public function awayTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'away_team_id');
    }

    /**
     * @return HasMany<LineupPlayer, $this>
     */
    public function lineupPlayers(): HasMany
    {
        return $this->hasMany(LineupPlayer::class);
    }

    /**
     * The players of both teams who were on the pitch at kick-off.
     *
     * @return HasMany<LineupPlayer, $this>
     */
    public function starters(): HasMany
    {
        return $this->lineupPlayers()->where('is_starter', true)->orderBy('position_id');
    }

    /**
     * Keep only matches where every word of the search text appears in a
     * team name, the competition name or the season.
     *
     * @param  Builder<FootballMatch>  $query
     */
    #[Scope]
    protected function search(Builder $query, ?string $search): void
    {
        $terms = preg_split('/\s+/', trim((string) $search), -1, PREG_SPLIT_NO_EMPTY);

        foreach ($terms as $term) {
            $pattern = '%'.addcslashes($term, '%_\\').'%';

            $query->where(function (Builder $match) use ($pattern): void {
                $match
                    ->whereHas('homeTeam', fn (Builder $team) => $team->where('name', 'like', $pattern))
                    ->orWhereHas('awayTeam', fn (Builder $team) => $team->where('name', 'like', $pattern))
                    ->orWhereHas('competition', fn (Builder $competition) => $competition->where('name', 'like', $pattern))
                    ->orWhere('season', 'like', $pattern);
            });
        }
    }
}
