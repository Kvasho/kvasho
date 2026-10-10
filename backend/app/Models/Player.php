<?php

namespace App\Models;

use Database\Factories\PlayerFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['statsbomb_id', 'name', 'nickname', 'country'])]
class Player extends Model
{
    /** @use HasFactory<PlayerFactory> */
    use HasFactory;

    /**
     * @return HasMany<LineupPlayer, $this>
     */
    public function lineupPlayers(): HasMany
    {
        return $this->hasMany(LineupPlayer::class);
    }

    /**
     * Keep only players where every word of the search text appears in
     * their full name or nickname.
     *
     * @param  Builder<Player>  $query
     */
    #[Scope]
    protected function search(Builder $query, string $search): void
    {
        $terms = preg_split('/\s+/', trim($search), -1, PREG_SPLIT_NO_EMPTY);

        foreach ($terms as $term) {
            $pattern = '%'.addcslashes($term, '%_\\').'%';

            $query->where(function (Builder $player) use ($pattern): void {
                $player
                    ->where('name', 'like', $pattern)
                    ->orWhere('nickname', 'like', $pattern);
            });
        }
    }
}
