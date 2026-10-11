<?php

use App\Enums\CompanyRole;
use App\Models\Company;
use App\Models\User;

it('registers a user together with a company they own', function () {
    $this->postJson(route('api.v1.invoicer.register'), [
        'name' => 'Nino Beridze',
        'email' => 'nino@example.com',
        'password' => 'secret-password',
        'password_confirmation' => 'secret-password',
        'company_name' => 'Nino Studio',
    ])
        ->assertCreated()
        ->assertJsonPath('data.email', 'nino@example.com')
        ->assertJsonPath('data.role', 'owner')
        ->assertJsonPath('data.company.name', 'Nino Studio')
        ->assertJsonPath('data.company.currency', 'GEL')
        ->assertJsonPath('data.company.invoice_prefix', 'INV');

    $user = User::firstWhere('email', 'nino@example.com');

    expect($user->currentCompany->name)->toBe('Nino Studio')
        ->and($user->currentRole())->toBe(CompanyRole::Owner);

    $this->assertAuthenticatedAs($user);
});

it('rejects a registration with an email that is taken', function () {
    User::factory()->create(['email' => 'taken@example.com']);

    $this->postJson(route('api.v1.invoicer.register'), [
        'name' => 'Someone',
        'email' => 'taken@example.com',
        'password' => 'secret-password',
        'password_confirmation' => 'secret-password',
        'company_name' => 'Anything',
    ])->assertUnprocessable()->assertJsonValidationErrors('email');

    expect(Company::count())->toBe(0);
});

it('signs in with valid credentials', function () {
    $user = memberOf();

    $this->postJson(route('api.v1.invoicer.login'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertOk()->assertJsonPath('data.id', $user->id);

    $this->assertAuthenticatedAs($user);
});

it('refuses a wrong password', function () {
    $user = memberOf();

    $this->postJson(route('api.v1.invoicer.login'), [
        'email' => $user->email,
        'password' => 'wrong',
    ])->assertUnprocessable()->assertJsonValidationErrors('email');

    $this->assertGuest();
});

it('signs out', function () {
    $user = memberOf();

    $this->actingAs($user)
        ->postJson(route('api.v1.invoicer.logout'))
        ->assertNoContent();

    $this->assertGuest('web');
});

it('requires authentication for the current user', function () {
    $this->getJson(route('api.v1.invoicer.me'))->assertUnauthorized();
});

it('returns the current user with their role and permissions', function () {
    $user = memberOf(role: CompanyRole::Accountant);

    $this->actingAs($user)
        ->getJson(route('api.v1.invoicer.me'))
        ->assertOk()
        ->assertJsonPath('data.role', 'accountant')
        ->assertJsonPath('data.can.manage_company', false)
        ->assertJsonPath('data.can.manage_invoices', true)
        ->assertJsonPath('data.company.id', $user->current_company_id);
});

it('moves a user removed from their current company to another one they belong to', function () {
    $user = memberOf();
    $other = Company::factory()->create();
    $other->users()->attach($user, ['role' => CompanyRole::Viewer]);

    $user->currentCompany->users()->detach($user);

    $this->actingAs($user)
        ->getJson(route('api.v1.invoicer.me'))
        ->assertOk()
        ->assertJsonPath('data.company.id', $other->id)
        ->assertJsonPath('data.role', 'viewer');
});

it('refuses a user who belongs to no company', function () {
    $user = memberOf();
    $user->currentCompany->users()->detach($user);

    $this->actingAs($user)->getJson(route('api.v1.invoicer.me'))->assertForbidden();
});
