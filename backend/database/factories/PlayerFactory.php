<?php

namespace Database\Factories;

use App\Models\Player;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Player>
 */
class PlayerFactory extends Factory
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
            'name' => fake()->name('male'),
            'nickname' => null,
            'country' => fake()->country(),
        ];
    }
}
