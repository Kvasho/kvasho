<?php

use App\Enums\CompanyRole;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('shows the current company to any member', function () {
    $user = memberOf(role: CompanyRole::Viewer);

    $this->actingAs($user)
        ->getJson(route('api.v1.invoicer.company.show'))
        ->assertOk()
        ->assertJsonPath('data.id', $user->current_company_id);
});

it('lets the owner update company details', function () {
    $user = memberOf();

    $this->actingAs($user)
        ->patchJson(route('api.v1.invoicer.company.update'), [
            'name' => 'Renamed LLC',
            'tax_id' => '404123456',
            'currency' => 'USD',
            'invoice_prefix' => 'RNM',
        ])
        ->assertOk()
        ->assertJsonPath('data.name', 'Renamed LLC')
        ->assertJsonPath('data.currency', 'USD')
        ->assertJsonPath('data.invoice_prefix', 'RNM');

    expect($user->currentCompany->fresh()->tax_id)->toBe('404123456');
});

it('does not let non-owners update company details', function (CompanyRole $role) {
    $user = memberOf(role: $role);

    $this->actingAs($user)
        ->patchJson(route('api.v1.invoicer.company.update'), ['name' => 'Hijacked'])
        ->assertForbidden();

    expect($user->currentCompany->fresh()->name)->not->toBe('Hijacked');
})->with([CompanyRole::Accountant, CompanyRole::Viewer]);

it('validates the currency and invoice prefix', function () {
    $this->actingAs(memberOf())
        ->patchJson(route('api.v1.invoicer.company.update'), [
            'currency' => 'lari',
            'invoice_prefix' => 'inv-',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['currency', 'invoice_prefix']);
});

it('uploads and replaces the company logo', function () {
    Storage::fake('public');
    $user = memberOf();

    $this->actingAs($user)
        ->postJson(route('api.v1.invoicer.company.logo.store'), [
            'logo' => UploadedFile::fake()->image('first.png'),
        ])
        ->assertOk();

    $firstPath = $user->currentCompany->fresh()->logo_path;
    Storage::disk('public')->assertExists($firstPath);

    $this->actingAs($user)
        ->postJson(route('api.v1.invoicer.company.logo.store'), [
            'logo' => UploadedFile::fake()->image('second.png'),
        ])
        ->assertOk()
        ->assertJsonPath('data.logo_url', fn (string $url) => str_ends_with($url, $user->currentCompany->fresh()->logo_path));

    Storage::disk('public')->assertMissing($firstPath);
});

it('removes the company logo', function () {
    Storage::fake('public');
    $user = memberOf();
    $path = UploadedFile::fake()->image('logo.png')->store('logos', 'public');
    $user->currentCompany->update(['logo_path' => $path]);

    $this->actingAs($user)
        ->deleteJson(route('api.v1.invoicer.company.logo.destroy'))
        ->assertOk()
        ->assertJsonPath('data.logo_url', null);

    Storage::disk('public')->assertMissing($path);
});

it('does not let non-owners change the logo', function () {
    Storage::fake('public');

    $this->actingAs(memberOf(role: CompanyRole::Accountant))
        ->postJson(route('api.v1.invoicer.company.logo.store'), [
            'logo' => UploadedFile::fake()->image('logo.png'),
        ])
        ->assertForbidden();
});
