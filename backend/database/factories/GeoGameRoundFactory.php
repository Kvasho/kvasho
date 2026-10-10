<?php

namespace Database\Factories;

use App\Models\Country;
use App\Models\GeoGame;
use App\Models\GeoGameRound;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GeoGameRound>
 */
class GeoGameRoundFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'geo_game_id' => GeoGame::factory(),
            'round_number' => 1,
            'country_id' => Country::factory(),
        ];
    }
}
