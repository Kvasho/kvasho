<?php

use App\Enums\CompanyRole;
use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| Class-based tests in Feature/ extend TestCase themselves. Pest closure tests
| are bound here; the Invoicer suite always gets a fresh database and sends
| requests as the SPA frontend, so Sanctum treats them as stateful.
|
*/

pest()->extend(TestCase::class)
    ->in('Feature');

pest()->use(RefreshDatabase::class)
    ->beforeEach(fn () => $this->withHeader('Origin', config('app.frontend_url')))
    ->in('Feature/Invoicer');

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
*/

/**
 * Create a company with a member holding the given role, set as their current company.
 */
function memberOf(?Company $company = null, CompanyRole $role = CompanyRole::Owner): User
{
    $company ??= Company::factory()->create();

    $user = User::factory()->create(['current_company_id' => $company->id]);
    $company->users()->attach($user, ['role' => $role]);

    return $user;
}
