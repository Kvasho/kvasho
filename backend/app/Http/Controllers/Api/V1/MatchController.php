<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\MatchResource;
use App\Models\FootballMatch;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MatchController extends Controller
{
    /**
     * List matches, newest first, optionally filtered by a search text.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
        ]);

        $matches = FootballMatch::query()
            ->with(['competition', 'homeTeam', 'awayTeam'])
            ->search($validated['search'] ?? null)
            ->orderByDesc('match_date')
            ->orderByDesc('id')
            ->paginate(50);

        return MatchResource::collection($matches);
    }
}
