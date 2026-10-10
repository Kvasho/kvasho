<?php

namespace Database\Factories;

use App\Models\Country;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Country>
 */
class CountryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => fake()->unique()->lexify('??'),
            'name' => fake()->unique()->country(),
            'capital' => fake()->city(),
            'region' => 'Europe',
            'lat' => fake()->latitude(-60, 60),
            'lng' => fake()->longitude(-170, 170),
            'population' => 0,
            'area' => 10000,
            'independent' => true,
            'flag_url' => 'https://flagcdn.com/w320/xx.png',
        ];
    }
}
