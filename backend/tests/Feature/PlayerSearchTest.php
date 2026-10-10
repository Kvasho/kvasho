<?php

namespace Tests\Feature;

use App\Models\LineupPlayer;
use App\Models\Player;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlayerSearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_finds_players_by_full_name(): void
    {
        $messi = Player::factory()->create([
            'name' => 'Lionel Andrés Messi Cuccittini',
            'nickname' => 'Lionel Messi',
            'country' => 'Argentina',
        ]);
        Player::factory()->create(['name' => 'Sergio Busquets i Burgos']);

        $this->getJson(route('api.v1.players.index', ['search' => 'cuccittini']))
            ->assertOk()
            ->assertExactJson([
                'data' => [[
                    'id' => $messi->id,
                    'name' => 'Lionel Messi',
                    'full_name' => 'Lionel Andrés Messi Cuccittini',
                    'country' => 'Argentina',
                ]],
            ]);
    }

    public function test_it_finds_players_by_nickname(): void
    {
        $pedri = Player::factory()->create([
            'name' => 'Pedro González López',
            'nickname' => 'Pedri',
        ]);

        $this->getJson(route('api.v1.players.index', ['search' => 'pedri']))
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $pedri->id);
    }

    public function test_it_falls_back_to_the_full_name_without_a_nickname(): void
    {
        Player::factory()->create(['name' => 'Marc Bartra Aregall', 'nickname' => null]);

        $this->getJson(route('api.v1.players.index', ['search' => 'bartra']))
            ->assertOk()
            ->assertJsonPath('data.0.name', 'Marc Bartra Aregall');
    }

    public function test_every_search_word_must_match(): void
    {
        $wanted = Player::factory()->create(['name' => 'Luis Alberto Suárez Díaz']);
        Player::factory()->create(['name' => 'Luis Enrique Martínez']);

        $this->getJson(route('api.v1.players.index', ['search' => 'luis suárez']))
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $wanted->id);
    }

    public function test_players_with_more_appearances_come_first(): void
    {
        $rarelyPlayed = Player::factory()->create(['name' => 'Aaron Silva']);
        $oftenPlayed = Player::factory()->create(['name' => 'David Silva']);

        LineupPlayer::factory()->for($rarelyPlayed)->create();
        LineupPlayer::factory()->count(3)->for($oftenPlayed)->create();

        $response = $this->getJson(route('api.v1.players.index', ['search' => 'silva']))->assertOk();

        $this->assertSame([$oftenPlayed->id, $rarelyPlayed->id], $response->json('data.*.id'));
    }

    public function test_it_suggests_at_most_ten_players(): void
    {
        Player::factory()->count(12)->sequence(
            fn ($sequence) => ['name' => "Silva Number {$sequence->index}"],
        )->create();

        $this->getJson(route('api.v1.players.index', ['search' => 'silva']))
            ->assertOk()
            ->assertJsonCount(10, 'data');
    }

    public function test_it_requires_at_least_three_characters(): void
    {
        $this->getJson(route('api.v1.players.index', ['search' => 'me']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('search');

        $this->getJson(route('api.v1.players.index'))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('search');
    }
}
