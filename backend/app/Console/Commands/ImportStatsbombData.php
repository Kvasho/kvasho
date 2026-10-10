<?php

namespace App\Console\Commands;

use App\Models\Competition;
use App\Models\FootballMatch;
use App\Models\LineupPlayer;
use App\Models\Player;
use App\Models\Team;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use JsonException;

#[Signature('statsbomb:import {--path= : Directory holding the StatsBomb "matches" and "lineups" folders}')]
#[Description('Import StatsBomb competitions, teams, matches and lineups into the database')]
class ImportStatsbombData extends Command
{
    /**
     * Execute the console command.
     *
     * @throws JsonException
     */
    public function handle(): int
    {
        $path = $this->option('path') ?: base_path('../storage/app/statsbomb/data');
        $files = File::glob($path.'/matches/*/*.json');

        if ($files === []) {
            $this->error("No match files found in [{$path}/matches].");

            return self::FAILURE;
        }

        $matches = [];
        foreach ($files as $file) {
            array_push($matches, ...json_decode(File::get($file), true, flags: JSON_THROW_ON_ERROR));
        }

        $competitionIds = $this->importCompetitions($matches);
        $teamIds = $this->importTeams($matches);
        $this->importMatches($matches, $competitionIds, $teamIds);
        $this->importLineups($path, $teamIds);

        $this->info(sprintf(
            'Imported %d matches, %d teams, %d competitions and %d players.',
            count($matches),
            count($teamIds),
            count($competitionIds),
            Player::count(),
        ));

        return self::SUCCESS;
    }

    /**
     * @param  list<array<string, mixed>>  $matches
     * @return array<int, int> Database ids keyed by StatsBomb id.
     */
    private function importCompetitions(array $matches): array
    {
        $competitions = [];
        foreach ($matches as $match) {
            $competitions[$match['competition']['competition_id']] = [
                'statsbomb_id' => $match['competition']['competition_id'],
                'name' => $match['competition']['competition_name'],
                'country' => $match['competition']['country_name'] ?? null,
                'gender' => $match['home_team']['home_team_gender'] ?? null,
            ];
        }

        Competition::upsert(array_values($competitions), ['statsbomb_id'], ['name', 'country', 'gender']);

        return Competition::pluck('id', 'statsbomb_id')->all();
    }

    /**
     * @param  list<array<string, mixed>>  $matches
     * @return array<int, int> Database ids keyed by StatsBomb id.
     */
    private function importTeams(array $matches): array
    {
        $teams = [];
        foreach ($matches as $match) {
            foreach (['home', 'away'] as $side) {
                $team = $match["{$side}_team"];

                $teams[$team["{$side}_team_id"]] = [
                    'statsbomb_id' => $team["{$side}_team_id"],
                    'name' => $team["{$side}_team_name"],
                    'country' => $team['country']['name'] ?? null,
                    'gender' => $team["{$side}_team_gender"] ?? null,
                ];
            }
        }

        Team::upsert(array_values($teams), ['statsbomb_id'], ['name', 'country', 'gender']);

        return Team::pluck('id', 'statsbomb_id')->all();
    }

    /**
     * @param  list<array<string, mixed>>  $matches
     * @param  array<int, int>  $competitionIds
     * @param  array<int, int>  $teamIds
     */
    private function importMatches(array $matches, array $competitionIds, array $teamIds): void
    {
        $rows = array_map(fn (array $match): array => [
            'statsbomb_id' => $match['match_id'],
            'competition_id' => $competitionIds[$match['competition']['competition_id']],
            'season' => $match['season']['season_name'],
            'home_team_id' => $teamIds[$match['home_team']['home_team_id']],
            'away_team_id' => $teamIds[$match['away_team']['away_team_id']],
            'match_date' => $match['match_date'],
            'kick_off' => isset($match['kick_off']) ? substr($match['kick_off'], 0, 8) : null,
            'home_score' => $match['home_score'] ?? null,
            'away_score' => $match['away_score'] ?? null,
            'stage' => $match['competition_stage']['name'] ?? null,
            'stadium' => $match['stadium']['name'] ?? null,
        ], $matches);

        $this->withProgressBar(array_chunk($rows, 500), function (array $chunk): void {
            FootballMatch::upsert($chunk, ['statsbomb_id'], [
                'competition_id', 'season', 'home_team_id', 'away_team_id', 'match_date',
                'kick_off', 'home_score', 'away_score', 'stage', 'stadium',
            ]);
        });
        $this->newLine(2);
    }

    /**
     * Import the players of every imported match from its lineup file.
     *
     * @param  array<int, int>  $teamIds
     *
     * @throws JsonException
     */
    private function importLineups(string $path, array $teamIds): void
    {
        $matchIds = FootballMatch::pluck('id', 'statsbomb_id')->all();

        $this->withProgressBar(array_chunk($matchIds, 200, true), function (array $chunk) use ($path, $teamIds): void {
            $players = [];
            $lineupPlayers = [];

            foreach ($chunk as $statsbombMatchId => $matchId) {
                $file = "{$path}/lineups/{$statsbombMatchId}.json";
                if (! File::exists($file)) {
                    continue;
                }

                foreach (json_decode(File::get($file), true, flags: JSON_THROW_ON_ERROR) as $team) {
                    foreach ($team['lineup'] as $player) {
                        $players[$player['player_id']] = [
                            'statsbomb_id' => $player['player_id'],
                            'name' => $player['player_name'],
                            'nickname' => $player['player_nickname'] ?? null,
                            'country' => $player['country']['name'] ?? null,
                        ];

                        $startingPosition = collect($player['positions'])
                            ->firstWhere('start_reason', 'Starting XI');

                        $lineupPlayers[] = [
                            'football_match_id' => $matchId,
                            'team_id' => $teamIds[$team['team_id']],
                            'player_id' => $player['player_id'],
                            'jersey_number' => $player['jersey_number'] ?? null,
                            'is_starter' => $startingPosition !== null,
                            'position_id' => $startingPosition['position_id'] ?? null,
                            'position' => $startingPosition['position'] ?? null,
                        ];
                    }
                }
            }

            Player::upsert(array_values($players), ['statsbomb_id'], ['name', 'nickname', 'country']);
            $playerIds = Player::whereIn('statsbomb_id', array_keys($players))->pluck('id', 'statsbomb_id');

            foreach ($lineupPlayers as &$lineupPlayer) {
                $lineupPlayer['player_id'] = $playerIds[$lineupPlayer['player_id']];
            }
            unset($lineupPlayer);

            foreach (array_chunk($lineupPlayers, 1000) as $rows) {
                LineupPlayer::upsert($rows, ['football_match_id', 'player_id'], [
                    'team_id', 'jersey_number', 'is_starter', 'position_id', 'position',
                ]);
            }
        });
        $this->newLine(2);
    }
}
