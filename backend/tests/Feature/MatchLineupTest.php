<?php

namespace Tests\Feature;

use App\Models\FootballMatch;
use App\Models\LineupPlayer;
use App\Models\Player;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MatchLineupTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_returns_the_starting_positions_of_each_team(): void
    {
        $match = FootballMatch::factory()->create();

        $homeKeeper = LineupPlayer::factory()->for($match)->create([
            'team_id' => $match->home_team_id,
            'position_id' => 1,
            'position' => 'Goalkeeper',
        ]);
        $homeStriker = LineupPlayer::factory()->for($match)->create([
            'team_id' => $match->home_team_id,
            'position_id' => 23,
            'position' => 'Center Forward',
        ]);
        $awayKeeper = LineupPlayer::factory()->for($match)->create([
            'team_id' => $match->away_team_id,
            'position_id' => 1,
            'position' => 'Goalkeeper',
        ]);

        $this->getJson(route('api.v1.matches.lineups.show', $match))
            ->assertOk()
            ->assertExactJson([
                'data' => [
                    'home_team' => [
                        ['id' => $homeKeeper->id, 'position_id' => 1, 'position' => 'Goalkeeper'],
                        ['id' => $homeStriker->id, 'position_id' => 23, 'position' => 'Center Forward'],
                    ],
                    'away_team' => [
                        ['id' => $awayKeeper->id, 'position_id' => 1, 'position' => 'Goalkeeper'],
                    ],
                ],
            ]);
    }

    public function test_it_leaves_out_substitutes(): void
    {
        $match = FootballMatch::factory()->create();

        LineupPlayer::factory()->for($match)->create(['team_id' => $match->home_team_id]);
        LineupPlayer::factory()->for($match)->substitute()->create(['team_id' => $match->home_team_id]);

        $this->getJson(route('api.v1.matches.lineups.show', $match))
            ->assertOk()
            ->assertJsonCount(1, 'data.home_team')
            ->assertJsonCount(0, 'data.away_team');
    }

    public function test_it_leaves_out_players_of_other_matches(): void
    {
        $match = FootballMatch::factory()->create();
        $otherMatch = FootballMatch::factory()->create();

        LineupPlayer::factory()->for($otherMatch)->create(['team_id' => $match->home_team_id]);

        $this->getJson(route('api.v1.matches.lineups.show', $match))
            ->assertOk()
            ->assertJsonCount(0, 'data.home_team');
    }

    public function test_it_does_not_reveal_who_played(): void
    {
        $match = FootballMatch::factory()->create();
        $player = Player::factory()->create(['name' => 'Lionel Messi']);

        LineupPlayer::factory()->for($match)->for($player)->create([
            'team_id' => $match->home_team_id,
            'jersey_number' => 10,
        ]);

        $response = $this->getJson(route('api.v1.matches.lineups.show', $match))->assertOk();

        $this->assertStringNotContainsString('Messi', $response->getContent());
        $response->assertJsonMissingPath('data.home_team.0.jersey_number');
        $response->assertJsonMissingPath('data.home_team.0.player_id');
    }

    public function test_it_returns_not_found_for_an_unknown_match(): void
    {
        $this->getJson(route('api.v1.matches.lineups.show', 999))->assertNotFound();
    }
}
