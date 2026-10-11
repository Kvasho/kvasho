<?php

use App\Enums\CompanyRole;

it('answers validation errors in Georgian when asked', function () {
    $this->withHeader('Accept-Language', 'ka')
        ->postJson(route('api.v1.invoicer.register'), ['email' => 'nope'])
        ->assertUnprocessable()
        ->assertJsonPath('errors.name.0', 'ველი „სახელი" სავალდებულოა.')
        ->assertJsonPath('errors.email.0', 'ველი „ელფოსტა" უნდა იყოს სწორი ელფოსტის მისამართი.');
});

it('answers in English by default and for unsupported languages', function (?string $language) {
    $request = $language ? $this->withHeader('Accept-Language', $language) : $this;

    $request->postJson(route('api.v1.invoicer.register'), [])
        ->assertJsonPath('errors.name.0', 'The name field is required.');
})->with([null, 'fr-FR', 'en-US,en;q=0.9']);

it('picks Georgian from a full browser language list', function () {
    $this->withHeader('Accept-Language', 'ka-GE,ka;q=0.9,en;q=0.8')
        ->postJson(route('api.v1.invoicer.login'), [])
        ->assertJsonPath('errors.email.0', 'ველი „ელფოსტა" სავალდებულოა.');
});

it('translates a failed sign-in', function () {
    $user = memberOf();

    $this->withHeader('Accept-Language', 'ka')
        ->postJson(route('api.v1.invoicer.login'), ['email' => $user->email, 'password' => 'wrong'])
        ->assertJsonPath('errors.email.0', 'ელფოსტა ან პაროლი არასწორია.');
});

it('translates framework messages such as unauthenticated and forbidden', function () {
    $this->withHeader('Accept-Language', 'ka')
        ->getJson(route('api.v1.invoicer.me'))
        ->assertUnauthorized()
        ->assertJsonPath('message', 'გთხოვთ, შეხვიდეთ სისტემაში.');

    $this->withHeader('Accept-Language', 'ka')
        ->actingAs(memberOf(role: CompanyRole::Viewer))
        ->patchJson(route('api.v1.invoicer.company.update'), ['name' => 'X'])
        ->assertForbidden()
        ->assertJsonPath('message', 'ამ მოქმედების უფლება არ გაქვთ.');
});
