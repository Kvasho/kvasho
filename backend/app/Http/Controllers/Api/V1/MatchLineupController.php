<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\MatchLineupResource;
use App\Models\FootballMatch;

class MatchLineupController extends Controller
{
    /**
     * Show the starting positions of both teams in a match.
     */
    public function show(FootballMatch $match): MatchLineupResource
    {
        return new MatchLineupResource($match->load('starters'));
    }
}
