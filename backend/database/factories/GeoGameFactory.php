<?php

namespace Database\Factories;

use App\Enums\GeoGameStatus;
use App\Models\GeoGame;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GeoGame>
 */
class GeoGameFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'token' => fake()->uuid(),
            'status' => GeoGameStatus::InProgress,
            'current_round' => 1,
            'total_score' => 0,
            'total_distance_km' => 0,
        ];
    }
}
