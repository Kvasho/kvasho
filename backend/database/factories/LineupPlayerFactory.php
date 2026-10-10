<?php

namespace Database\Factories;

use App\Models\FootballMatch;
use App\Models\LineupPlayer;
use App\Models\Player;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LineupPlayer>
 */
class LineupPlayerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'football_match_id' => FootballMatch::factory(),
            'team_id' => Team::factory(),
            'player_id' => Player::factory(),
            'jersey_number' => fake()->numberBetween(1, 99),
            'is_starter' => true,
            'position_id' => 1,
            'position' => 'Goalkeeper',
        ];
    }

    /**
     * Indicate that the player started the match on the bench.
     */
    public function substitute(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_starter' => false,
            'position_id' => null,
            'position' => null,
        ]);
    }
}
