<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PlayerResource;
use App\Models\Player;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PlayerController extends Controller
{
    /**
     * Suggest players whose name matches the search text, the ones with the
     * most appearances first.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'search' => ['required', 'string', 'min:3', 'max:100'],
        ]);

        $players = Player::query()
            ->search($validated['search'])
            ->withCount('lineupPlayers')
            ->orderByDesc('lineup_players_count')
            ->orderBy('name')
            ->limit(10)
            ->get();

        return PlayerResource::collection($players);
    }
}
