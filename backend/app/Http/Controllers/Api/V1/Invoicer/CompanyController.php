<?php

namespace App\Http\Controllers\Api\V1\Invoicer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Invoicer\UpdateCompanyRequest;
use App\Http\Resources\Invoicer\CompanyResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class CompanyController extends Controller
{
    /**
     * The current company's details.
     */
    public function show(Request $request): CompanyResource
    {
        $company = $request->user()->currentCompany;

        Gate::authorize('view', $company);

        return new CompanyResource($company);
    }

    /**
     * Change the current company's details. Owner only.
     */
    public function update(UpdateCompanyRequest $request): CompanyResource
    {
        $company = $request->user()->currentCompany;

        Gate::authorize('update', $company);

        $company->update($request->validated());

        return new CompanyResource($company);
    }
}
