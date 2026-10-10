<?php

namespace Tests\Feature;

use App\Models\Competition;
use App\Models\FootballMatch;
use App\Models\Team;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MatchIndexTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_lists_matches_newest_first(): void
    {
        $older = FootballMatch::factory()->create(['match_date' => '2015-05-01']);
        $newer = FootballMatch::factory()->create(['match_date' => '2020-05-01']);

        $response = $this->getJson(route('api.v1.matches.index'));

        $response
            ->assertOk()
            ->assertJsonPath('meta.total', 2)
            ->assertJsonPath('data.0.id', $newer->id)
            ->assertJsonPath('data.1.id', $older->id)
            ->assertJsonPath('data.0.home_team.name', $newer->homeTeam->name)
            ->assertJsonPath('data.0.away_team.name', $newer->awayTeam->name)
            ->assertJsonPath('data.0.date', '2020-05-01');
    }

    public function test_it_paginates_fifty_matches_per_page(): void
    {
        FootballMatch::factory()
            ->count(51)
            ->for(Competition::factory())
            ->for(Team::factory(), 'homeTeam')
            ->for(Team::factory(), 'awayTeam')
            ->create();

        $this->getJson(route('api.v1.matches.index'))
            ->assertOk()
            ->assertJsonCount(50, 'data')
            ->assertJsonPath('meta.last_page', 2);

        $this->getJson(route('api.v1.matches.index', ['page' => 2]))
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_it_searches_by_team_name_on_either_side(): void
    {
        $realMadrid = Team::factory()->create(['name' => 'Real Madrid']);
        $chelsea = Team::factory()->create(['name' => 'Chelsea']);

        $home = FootballMatch::factory()->for($realMadrid, 'homeTeam')->create();
        $away = FootballMatch::factory()->for($realMadrid, 'awayTeam')->create();
        FootballMatch::factory()->for($chelsea, 'homeTeam')->create();

        $response = $this->getJson(route('api.v1.matches.index', ['search' => 'madrid']));

        $response->assertOk()->assertJsonPath('meta.total', 2);
        $this->assertEqualsCanonicalizing(
            [$home->id, $away->id],
            $response->json('data.*.id'),
        );
    }

    public function test_every_search_word_must_match(): void
    {
        $realMadrid = Team::factory()->create(['name' => 'Real Madrid']);
        $chelsea = Team::factory()->create(['name' => 'Chelsea']);

        $wanted = FootballMatch::factory()
            ->for($realMadrid, 'homeTeam')
            ->for($chelsea, 'awayTeam')
            ->create();
        FootballMatch::factory()->for($realMadrid, 'homeTeam')->create();

        $this->getJson(route('api.v1.matches.index', ['search' => 'real chelsea']))
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $wanted->id);
    }

    public function test_it_searches_by_competition_and_season(): void
    {
        $championsLeague = Competition::factory()->create(['name' => 'Champions League']);

        $wanted = FootballMatch::factory()->for($championsLeague)->create(['season' => '2018/2019']);
        FootballMatch::factory()->for($championsLeague)->create(['season' => '2010/2011']);
        FootballMatch::factory()->create(['season' => '2018/2019']);

        $this->getJson(route('api.v1.matches.index', ['search' => 'champions 2018']))
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $wanted->id);
    }

    public function test_search_wildcards_are_treated_literally(): void
    {
        FootballMatch::factory()->create();

        $this->getJson(route('api.v1.matches.index', ['search' => '%']))
            ->assertOk()
            ->assertJsonPath('meta.total', 0);
    }

    public function test_it_rejects_an_overlong_search(): void
    {
        $this->getJson(route('api.v1.matches.index', ['search' => str_repeat('a', 101)]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('search');
    }
}
