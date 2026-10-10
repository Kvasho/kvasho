<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\FootballMatch;
use App\Models\LineupPlayer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LineupGuessController extends Controller
{
    /**
     * Check whether the guessed player started the match in the given position.
     */
    public function store(Request $request, FootballMatch $match, LineupPlayer $lineupPlayer): JsonResponse
    {
        abort_unless($lineupPlayer->is_starter, 404);

        $validated = $request->validate([
            'player_id' => ['required', 'integer', 'exists:players,id'],
        ]);

        return response()->json([
            'data' => [
                'correct' => $lineupPlayer->player_id === (int) $validated['player_id'],
            ],
        ]);
    }
}
