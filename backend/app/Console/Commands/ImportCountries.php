<?php

namespace App\Console\Commands;

use App\Models\Country;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class ImportCountries extends Command
{
    protected $signature = 'countries:import';

    protected $description = 'Import countries from REST Countries API';

    public function handle(): int
    {
        $response = Http::timeout(60)->get(
            'https://raw.githubusercontent.com/mledoze/countries/master/countries.json'
        );

        $countries = $response->json();

        if ($response->failed() || ! is_array($countries) || ! array_is_list($countries)) {
            $this->error('Could not load countries: '.$response->status());

            return self::FAILURE;
        }

        foreach ($countries as $item) {
            if (empty($item['cca2']) || empty($item['latlng'])) {
                continue;
            }

            Country::updateOrCreate(
                ['code' => $item['cca2']],
                [
                    'name' => $item['name']['common'],
                    'capital' => $item['capital'][0] ?? null,
                    'region' => $item['region'] ?? null,
                    'lat' => $item['latlng'][0],
                    'lng' => $item['latlng'][1],
                    // The source uses -1 where the area is unknown.
                    'area' => ($item['area'] ?? 0) > 0 ? (int) round($item['area']) : null,
                    'independent' => (bool) ($item['independent'] ?? false),
                    'flag_url' => 'https://flagcdn.com/w320/'.strtolower($item['cca2']).'.png',
                ]
            );
        }

        $this->info('Imported: '.Country::count());

        return self::SUCCESS;
    }
}
