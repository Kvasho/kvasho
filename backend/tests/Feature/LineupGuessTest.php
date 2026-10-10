<?php

namespace Tests\Feature;

use App\Models\FootballMatch;
use App\Models\LineupPlayer;
use App\Models\Player;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LineupGuessTest extends TestCase
{
    use RefreshDatabase;

    public function test_guessing_the_player_who_started_there_is_correct(): void
    {
        $slot = LineupPlayer::factory()->create();

        $this->postJson($this->guessUrl($slot), ['player_id' => $slot->player_id])
            ->assertOk()
            ->assertExactJson(['data' => ['correct' => true]]);
    }

    public function test_guessing_another_player_is_wrong(): void
    {
        $slot = LineupPlayer::factory()->create();
        $otherPlayer = Player::factory()->create();

        $this->postJson($this->guessUrl($slot), ['player_id' => $otherPlayer->id])
            ->assertOk()
            ->assertExactJson(['data' => ['correct' => false]]);
    }

    public function test_a_teammate_from_another_position_is_wrong(): void
    {
        $match = FootballMatch::factory()->create();
        $keeper = LineupPlayer::factory()->for($match)->create(['team_id' => $match->home_team_id]);
        $striker = LineupPlayer::factory()->for($match)->create([
            'team_id' => $match->home_team_id,
            'position_id' => 23,
            'position' => 'Center Forward',
        ]);

        $this->postJson($this->guessUrl($keeper), ['player_id' => $striker->player_id])
            ->assertOk()
            ->assertExactJson(['data' => ['correct' => false]]);
    }

    public function test_a_wrong_guess_does_not_reveal_the_answer(): void
    {
        $slot = LineupPlayer::factory()
            ->for(Player::factory()->state(['name' => 'Lionel Messi']))
            ->create();
        $otherPlayer = Player::factory()->create();

        $response = $this->postJson($this->guessUrl($slot), ['player_id' => $otherPlayer->id]);

        $this->assertStringNotContainsString('Messi', $response->getContent());
        $this->assertStringNotContainsString((string) $slot->player_id, $response->getContent());
    }

    public function test_the_position_must_belong_to_the_match(): void
    {
        $slot = LineupPlayer::factory()->create();
        $otherMatch = FootballMatch::factory()->create();

        $this->postJson(
            route('api.v1.matches.lineups.guesses.store', [$otherMatch, $slot]),
            ['player_id' => $slot->player_id],
        )->assertNotFound();
    }

    public function test_substitutes_cannot_be_guessed(): void
    {
        $substitute = LineupPlayer::factory()->substitute()->create();

        $this->postJson($this->guessUrl($substitute), ['player_id' => $substitute->player_id])
            ->assertNotFound();
    }

    public function test_it_requires_an_existing_player(): void
    {
        $slot = LineupPlayer::factory()->create();

        $this->postJson($this->guessUrl($slot), [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('player_id');

        $this->postJson($this->guessUrl($slot), ['player_id' => 999_999])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('player_id');
    }

    private function guessUrl(LineupPlayer $slot): string
    {
        return route('api.v1.matches.lineups.guesses.store', [$slot->football_match_id, $slot]);
    }
}
