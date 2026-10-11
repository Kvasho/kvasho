<?php

use App\Enums\CompanyRole;
use App\Models\Client;
use App\Models\Company;

function clientPayload(array $overrides = []): array
{
    return [
        'name' => 'Acme LLC',
        'email' => 'billing@acme.test',
        'phone' => '+995 555 12 34 56',
        'address' => '1 Rustaveli Ave, Tbilisi',
        'tax_id' => '404999888',
        ...$overrides,
    ];
}

describe('managing clients', function () {
    it('creates a client in the current company', function () {
        $user = memberOf();

        $this->actingAs($user)
            ->postJson(route('api.v1.invoicer.clients.store'), clientPayload())
            ->assertCreated()
            ->assertJsonPath('data.name', 'Acme LLC')
            ->assertJsonPath('data.email', 'billing@acme.test');

        expect(Client::sole()->company_id)->toBe($user->current_company_id);
    });

    it('ignores a company_id sent by the client', function () {
        $user = memberOf();
        $other = Company::factory()->create();

        $this->actingAs($user)
            ->postJson(route('api.v1.invoicer.clients.store'), clientPayload(['company_id' => $other->id]))
            ->assertCreated();

        expect(Client::withoutGlobalScopes()->sole()->company_id)->toBe($user->current_company_id);
    });

    it('validates the client', function () {
        $this->actingAs(memberOf())
            ->postJson(route('api.v1.invoicer.clients.store'), ['email' => 'not-an-email'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email']);
    });

    it('lists clients alphabetically and paginated', function () {
        $user = memberOf();
        foreach (['Zeta', 'Alpha', 'Mike'] as $name) {
            Client::factory()->for($user->currentCompany)->create(['name' => $name]);
        }

        $this->actingAs($user)
            ->getJson(route('api.v1.invoicer.clients.index', ['per_page' => 2]))
            ->assertOk()
            ->assertJsonPath('data.*.name', ['Alpha', 'Mike'])
            ->assertJsonPath('meta.total', 3)
            ->assertJsonPath('meta.last_page', 2);
    });

    it('searches by name, email and tax ID', function () {
        $user = memberOf();
        $company = $user->currentCompany;
        Client::factory()->for($company)->create(['name' => 'Gorgia', 'email' => 'a@x.test', 'tax_id' => '111']);
        Client::factory()->for($company)->create(['name' => 'Other', 'email' => 'gorgia@y.test', 'tax_id' => '222']);
        Client::factory()->for($company)->create(['name' => 'Third', 'email' => 'c@z.test', 'tax_id' => '333']);

        $this->actingAs($user)
            ->getJson(route('api.v1.invoicer.clients.index', ['search' => 'gorgia']))
            ->assertJsonCount(2, 'data');

        $this->actingAs($user)
            ->getJson(route('api.v1.invoicer.clients.index', ['search' => '333']))
            ->assertJsonPath('data.*.name', ['Third']);
    });

    it('treats search wildcards literally', function () {
        $user = memberOf();
        Client::factory()->for($user->currentCompany)->create(['name' => 'Plain']);

        $this->actingAs($user)
            ->getJson(route('api.v1.invoicer.clients.index', ['search' => '%']))
            ->assertJsonCount(0, 'data');
    });

    it('updates a client', function () {
        $user = memberOf();
        $client = Client::factory()->for($user->currentCompany)->create();

        $this->actingAs($user)
            ->putJson(route('api.v1.invoicer.clients.update', $client), clientPayload(['name' => 'Renamed']))
            ->assertOk()
            ->assertJsonPath('data.name', 'Renamed');
    });

    it('archives a deleted client instead of removing it', function () {
        $user = memberOf();
        $client = Client::factory()->for($user->currentCompany)->create();

        $this->actingAs($user)
            ->deleteJson(route('api.v1.invoicer.clients.destroy', $client))
            ->assertNoContent();

        expect($client->fresh()->trashed())->toBeTrue();

        $this->actingAs($user)
            ->getJson(route('api.v1.invoicer.clients.index'))
            ->assertJsonCount(0, 'data');
    });
});

describe('roles', function () {
    it('lets an accountant manage clients', function () {
        $this->actingAs(memberOf(role: CompanyRole::Accountant))
            ->postJson(route('api.v1.invoicer.clients.store'), clientPayload())
            ->assertCreated();
    });

    it('lets a viewer see clients but not change them', function () {
        $user = memberOf(role: CompanyRole::Viewer);
        $client = Client::factory()->for($user->currentCompany)->create();

        $this->actingAs($user)->getJson(route('api.v1.invoicer.clients.index'))->assertOk();
        $this->actingAs($user)->getJson(route('api.v1.invoicer.clients.show', $client))->assertOk();

        $this->actingAs($user)
            ->postJson(route('api.v1.invoicer.clients.store'), clientPayload())
            ->assertForbidden();
        $this->actingAs($user)
            ->putJson(route('api.v1.invoicer.clients.update', $client), clientPayload())
            ->assertForbidden();
        $this->actingAs($user)
            ->deleteJson(route('api.v1.invoicer.clients.destroy', $client))
            ->assertForbidden();
    });
});

describe('tenant isolation', function () {
    beforeEach(function () {
        $this->user = memberOf();
        $this->ownClient = Client::factory()->for($this->user->currentCompany)->create(['name' => 'Mine']);
        $this->foreignClient = Client::factory()->create(['name' => 'Theirs']);
    });

    it('lists only clients of the current company', function () {
        $this->actingAs($this->user)
            ->getJson(route('api.v1.invoicer.clients.index'))
            ->assertJsonPath('data.*.name', ['Mine']);
    });

    it('does not find another company\'s client in search', function () {
        $this->actingAs($this->user)
            ->getJson(route('api.v1.invoicer.clients.index', ['search' => 'Theirs']))
            ->assertJsonCount(0, 'data');
    });

    it('hides another company\'s client as if it did not exist', function (string $method, string $route) {
        $this->actingAs($this->user)
            ->json($method, route($route, $this->foreignClient), clientPayload())
            ->assertNotFound();

        expect($this->foreignClient->fresh())
            ->name->toBe('Theirs')
            ->trashed()->toBeFalse();
    })->with([
        'show' => ['GET', 'api.v1.invoicer.clients.show'],
        'update' => ['PUT', 'api.v1.invoicer.clients.update'],
        'delete' => ['DELETE', 'api.v1.invoicer.clients.destroy'],
    ]);

    it('follows the user when they switch company', function () {
        $this->foreignClient->company->users()->attach($this->user, ['role' => CompanyRole::Viewer]);
        $this->user->update(['current_company_id' => $this->foreignClient->company_id]);

        $this->actingAs($this->user)
            ->getJson(route('api.v1.invoicer.clients.index'))
            ->assertJsonPath('data.*.name', ['Theirs']);
    });

    it('does not leak clients of a company the user was removed from', function () {
        $formerCompany = $this->user->currentCompany;
        $newHome = Company::factory()->create();
        $newHome->users()->attach($this->user, ['role' => CompanyRole::Owner]);
        $formerCompany->users()->detach($this->user);

        $this->actingAs($this->user)
            ->getJson(route('api.v1.invoicer.clients.show', $this->ownClient))
            ->assertNotFound();

        $this->actingAs($this->user)
            ->getJson(route('api.v1.invoicer.clients.index'))
            ->assertJsonCount(0, 'data');
    });
});
