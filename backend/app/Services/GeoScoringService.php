<?php

namespace App\Services;

use App\Enums\GeoGameStatus;
use App\Models\Country;

class GeoScoringService
{
    /**
     * How far a guess is from a country, in whole kilometres.
     *
     * The distance is measured to the country's centre and then shortened by
     * the radius of a circle with the country's area, so a click anywhere
     * inside a large country is not punished for missing its centre.
     */
    public function distanceKm(Country $country, float $guessLat, float $guessLng): int
    {
        $rawDistance = $this->haversineKm((float) $country->lat, (float) $country->lng, $guessLat, $guessLng);
        $radius = sqrt(max(0, (int) $country->area) / M_PI);

        return (int) round(max(0, $rawDistance - $radius));
    }

    /**
     * Points for a round: the maximum at no distance, falling off exponentially.
     */
    public function score(int $distanceKm): int
    {
        return (int) round(
            config('geoguess.max_round_score') * exp(-$distanceKm / config('geoguess.score_decay_km'))
        );
    }

    /**
     * Whether a finished game with this total distance was won or lost.
     */
    public function outcome(int $totalDistanceKm): GeoGameStatus
    {
        return $totalDistanceKm <= config('geoguess.win_distance_km')
            ? GeoGameStatus::Won
            : GeoGameStatus::Lost;
    }

    /**
     * Great-circle distance between two points, in kilometres.
     */
    public function haversineKm(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $latDelta = deg2rad($lat2 - $lat1);
        $lngDelta = deg2rad($lng2 - $lng1);

        $a = sin($latDelta / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($lngDelta / 2) ** 2;

        return 2 * config('geoguess.earth_radius_km') * asin(min(1, sqrt($a)));
    }
}
