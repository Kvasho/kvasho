<?php

namespace Database\Factories;

use App\Models\Competition;
use App\Models\FootballMatch;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FootballMatch>
 */
class FootballMatchFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'statsbomb_id' => fake()->unique()->numberBetween(1, 1_000_000),
            'competition_id' => Competition::factory(),
            'season' => '2020/2021',
            'home_team_id' => Team::factory(),
            'away_team_id' => Team::factory(),
            'match_date' => fake()->date(),
            'kick_off' => '20:00:00',
            'home_score' => fake()->numberBetween(0, 5),
            'away_score' => fake()->numberBetween(0, 5),
            'stage' => 'Regular Season',
            'stadium' => fake()->city().' Stadium',
        ];
    }
}
