<?php

namespace Database\Factories;

use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Team>
 */
class TeamFactory extends Factory
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
            'name' => fake()->unique()->city(),
            'country' => fake()->country(),
            'gender' => 'male',
        ];
    }
}
