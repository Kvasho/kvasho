<?php

namespace Tests\Feature;

use App\Enums\GeoGameStatus;
use App\Models\Country;
use App\Models\GeoGame;
use App\Models\GeoGameRound;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class GeoGameTest extends TestCase
{
    use RefreshDatabase;

    public function test_starting_a_game_returns_a_token_and_the_first_question(): void
    {
        Country::factory()->count(10)->create();

        $response = $this->postJson(route('api.v1.geo.games.store'))
            ->assertCreated()
            ->assertJsonPath('data.status', 'in_progress')
            ->assertJsonPath('data.total_rounds', 10)
            ->assertJsonPath('data.current_round', 1)
            ->assertJsonPath('data.total_score', 0)
            ->assertJsonPath('data.total_distance_km', 0)
            ->assertJsonPath('data.question.round', 1)
            ->assertJsonCount(0, 'data.rounds');

        $game = GeoGame::where('token', $response->json('data.token'))->firstOrFail();
        $firstRound = $game->rounds->first();

        $response
            ->assertJsonPath('data.question.country_name', $firstRound->country->name)
            ->assertJsonPath('data.question.flag_url', $firstRound->country->flag_url);

        $this->assertCount(10, $game->rounds);
        $this->assertSame(range(1, 10), $game->rounds->pluck('round_number')->all());
        $this->assertCount(10, $game->rounds->pluck('country_id')->unique());
    }

    public function test_a_game_only_uses_independent_countries(): void
    {
        Country::factory()->count(10)->create();
        Country::factory()->count(15)->create(['independent' => false]);

        $this->postJson(route('api.v1.geo.games.store'))->assertCreated();

        $this->assertSame(
            0,
            GeoGameRound::whereRelation('country', 'independent', false)->count(),
        );
    }

    public function test_a_game_cannot_start_without_enough_countries(): void
    {
        Country::factory()->count(9)->create();

        $this->postJson(route('api.v1.geo.games.store'))->assertServiceUnavailable();

        $this->assertSame(0, GeoGame::count());
    }

    public function test_questions_never_reveal_where_the_country_is(): void
    {
        Country::factory()->count(10)->create();

        $started = $this->postJson(route('api.v1.geo.games.store'))->assertCreated();
        $resumed = $this->getJson(route('api.v1.geo.games.show', $started->json('data.token')))->assertOk();

        $country = GeoGameRound::where('round_number', 1)->firstOrFail()->country;

        foreach ([$started, $resumed] as $response) {
            $response
                ->assertJsonMissingPath('data.question.lat')
                ->assertJsonMissingPath('data.question.lng')
                ->assertJsonMissingPath('data.question.correct');

            $this->assertStringNotContainsString((string) $country->lat, $response->getContent());
            $this->assertStringNotContainsString((string) $country->lng, $response->getContent());
        }
    }

    public function test_a_perfect_guess_scores_the_maximum(): void
    {
        $game = $this->startGame();
        $country = $game->rounds->first()->country;

        $this->guess($game, $country->lat, $country->lng)
            ->assertOk()
            ->assertJsonPath('data.round', 1)
            ->assertJsonPath('data.distance_km', 0)
            ->assertJsonPath('data.score', 1000)
            ->assertJsonPath('data.correct.name', $country->name)
            ->assertJsonPath('data.correct.lat', $country->lat)
            ->assertJsonPath('data.correct.lng', $country->lng)
            ->assertJsonPath('data.total_score', 1000)
            ->assertJsonPath('data.total_distance_km', 0)
            ->assertJsonPath('data.status', 'in_progress')
            ->assertJsonPath('data.next_question.round', 2)
            ->assertJsonPath('data.result', null);
    }

    public function test_a_guess_inside_a_large_country_counts_as_no_distance(): void
    {
        // A circle of this area has a radius of about 1,000 km.
        $game = $this->startGame(['lat' => 0, 'lng' => 0, 'area' => 3_141_593]);

        // Roughly 555 km east of the centre along the equator.
        $this->guess($game, 0, 5)
            ->assertOk()
            ->assertJsonPath('data.distance_km', 0)
            ->assertJsonPath('data.score', 1000);

        // Roughly 2,224 km away, so about 1,224 km outside the circle.
        $response = $this->guess($game, 0, 20)->assertOk();

        $this->assertEqualsWithDelta(1224, $response->json('data.distance_km'), 2);
        $this->assertSame(
            (int) round(1000 * exp(-$response->json('data.distance_km') / 1500)),
            $response->json('data.score'),
        );
    }

    public function test_a_far_guess_scores_next_to_nothing(): void
    {
        $game = $this->startGame(['lat' => 10, 'lng' => 20, 'area' => 0]);

        // The opposite side of the globe: half the Earth's circumference away.
        $response = $this->guess($game, -10, -160)->assertOk();

        $this->assertEqualsWithDelta(20015, $response->json('data.distance_km'), 2);
        $this->assertSame(0, $response->json('data.score'));
        $response->assertJsonPath('data.total_distance_km', $response->json('data.distance_km'));
    }

    public function test_a_game_is_won_when_the_total_distance_stays_within_the_limit(): void
    {
        $game = $this->startGame();

        foreach ($game->rounds as $round) {
            $response = $this->guess($game, $round->country->lat, $round->country->lng)->assertOk();
        }

        $response
            ->assertJsonPath('data.status', 'won')
            ->assertJsonPath('data.next_question', null)
            ->assertJsonPath('data.result.status', 'won')
            ->assertJsonPath('data.result.total_score', 10000)
            ->assertJsonPath('data.result.total_distance_km', 0)
            ->assertJsonPath('data.result.question', null)
            ->assertJsonCount(10, 'data.result.rounds');

        $this->assertSame(GeoGameStatus::Won, $game->refresh()->status);
    }

    public function test_a_game_is_lost_when_the_total_distance_exceeds_the_limit(): void
    {
        $game = $this->startGame(['lat' => 10, 'lng' => 20, 'area' => 0]);

        foreach ($game->rounds as $round) {
            $response = $this->guess($game, -10, -160)->assertOk();
        }

        $response
            ->assertJsonPath('data.status', 'lost')
            ->assertJsonPath('data.result.status', 'lost')
            ->assertJsonPath('data.result.total_score', 0);

        $this->assertGreaterThan(10000, $response->json('data.result.total_distance_km'));
        $this->assertSame(GeoGameStatus::Lost, $game->refresh()->status);
    }

    public function test_a_total_distance_exactly_at_the_limit_still_wins(): void
    {
        config(['geoguess.win_distance_km' => 20015]);
        $game = $this->startGame(['lat' => 10, 'lng' => 20, 'area' => 0]);

        // One guess on the far side of the globe, the rest spot on.
        $this->guess($game, -10, -160)->assertOk()->assertJsonPath('data.distance_km', 20015);
        foreach ($game->rounds->skip(1) as $round) {
            $response = $this->guess($game, 10, 20)->assertOk();
        }

        $response->assertJsonPath('data.status', 'won');
    }

    public function test_a_round_cannot_be_answered_twice(): void
    {
        $game = $this->startGame();
        $country = $game->rounds->first()->country;

        $this->guess($game, $country->lat, $country->lng, round: 1)->assertOk();

        $this->guess($game, 0, 0, round: 1)
            ->assertConflict()
            ->assertJsonPath('message', 'This round has already been answered.');

        $game->refresh();
        $this->assertSame(2, $game->current_round);
        $this->assertSame(1000, $game->total_score);
        $this->assertSame(1, $game->rounds()->whereNotNull('answered_at')->count());
    }

    public function test_a_finished_game_rejects_further_guesses(): void
    {
        $game = $this->startGame();

        foreach ($game->rounds as $round) {
            $this->guess($game, $round->country->lat, $round->country->lng)->assertOk();
        }

        $this->guess($game, 0, 0)
            ->assertConflict()
            ->assertJsonPath('message', 'This game is already finished.');

        $this->assertSame(10000, $game->refresh()->total_score);
    }

    public function test_a_guess_must_be_a_real_point_on_the_globe(): void
    {
        $game = $this->startGame();

        $this->guess($game, 90.1, 0)->assertUnprocessable()->assertJsonValidationErrors('lat');
        $this->guess($game, 0, -180.1)->assertUnprocessable()->assertJsonValidationErrors('lng');
        $this->postJson(route('api.v1.geo.games.guess', $game->token), [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['lat', 'lng']);

        $this->assertSame(1, $game->refresh()->current_round);
    }

    public function test_the_state_of_a_game_can_be_fetched_to_resume_it(): void
    {
        $game = $this->startGame();
        $first = $game->rounds->first()->country;
        $second = $game->rounds->get(1)->country;

        $this->guess($game, $first->lat, $first->lng)->assertOk();

        $this->getJson(route('api.v1.geo.games.show', $game->token))
            ->assertOk()
            ->assertJsonPath('data.status', 'in_progress')
            ->assertJsonPath('data.current_round', 2)
            ->assertJsonPath('data.total_score', 1000)
            ->assertJsonPath('data.question.round', 2)
            ->assertJsonPath('data.question.country_name', $second->name)
            ->assertJsonCount(1, 'data.rounds')
            ->assertJsonPath('data.rounds.0.country_name', $first->name)
            ->assertJsonPath('data.rounds.0.correct.lat', $first->lat)
            ->assertJsonPath('data.rounds.0.score', 1000);
    }

    public function test_an_unknown_game_is_not_found(): void
    {
        $this->getJson(route('api.v1.geo.games.show', 'no-such-token'))->assertNotFound();
        $this->postJson(route('api.v1.geo.games.guess', 'no-such-token'), ['lat' => 0, 'lng' => 0])
            ->assertNotFound();
    }

    /**
     * Start a game over ten countries, optionally all sharing some attributes.
     *
     * @param  array<string, mixed>  $countryAttributes
     */
    private function startGame(array $countryAttributes = []): GeoGame
    {
        Country::factory()->count(10)->create($countryAttributes);

        $token = $this->postJson(route('api.v1.geo.games.store'))->assertCreated()->json('data.token');

        return GeoGame::with('rounds.country')->where('token', $token)->firstOrFail();
    }

    private function guess(GeoGame $game, float $lat, float $lng, ?int $round = null): TestResponse
    {
        return $this->postJson(
            route('api.v1.geo.games.guess', $game->token),
            array_filter(['lat' => $lat, 'lng' => $lng, 'round' => $round], fn ($value) => $value !== null),
        );
    }
}
