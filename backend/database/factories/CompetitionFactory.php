<?php

namespace Database\Factories;

use App\Models\Competition;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Competition>
 */
class CompetitionFactory extends Factory
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
            'name' => fake()->unique()->words(2, true),
            'country' => fake()->country(),
            'gender' => 'male',
        ];
    }
}
