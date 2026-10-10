<?php

return [

    /*
    |--------------------------------------------------------------------------
    | GeoGuess Rules
    |--------------------------------------------------------------------------
    |
    | Every number the geography guessing game is played by. A game is a fixed
    | number of rounds; each round is scored by how far the guess landed from
    | the country, and the game is won by keeping the total distance low.
    |
    */

    // Rounds in one game; also how many distinct countries a game needs.
    'rounds' => 10,

    // Points for a guess that lands inside the country.
    'max_round_score' => 1000,

    // How quickly the score falls off: at this distance a guess is worth
    // about 37% (1/e) of the maximum.
    'score_decay_km' => 1500,

    // A finished game is won when all its distances add up to this or less.
    'win_distance_km' => 10000,

    // Mean radius of the Earth, used for great-circle distances.
    'earth_radius_km' => 6371,

];
