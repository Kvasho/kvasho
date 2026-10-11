<?php

namespace App\Http\Controllers\Api\V1\Invoicer;

use App\Enums\CompanyRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Invoicer\RegisterRequest;
use App\Http\Resources\Invoicer\CurrentUserResource;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class RegisterController extends Controller
{
    /**
     * Sign a new user up together with their company, which they own, and sign them in.
     */
    public function store(RegisterRequest $request): JsonResponse
    {
        $user = DB::transaction(function () use ($request): User {
            $company = Company::create(['name' => $request->validated('company_name')]);

            $user = User::create([
                ...$request->safe()->only(['name', 'email', 'password']),
                'current_company_id' => $company->id,
            ]);

            $company->users()->attach($user, ['role' => CompanyRole::Owner]);

            return $user;
        });

        Auth::login($user);

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        return (new CurrentUserResource($user->load('currentCompany')))
            ->response()
            ->setStatusCode(201);
    }
}
