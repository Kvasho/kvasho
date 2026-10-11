<?php

namespace App\Http\Controllers\Api\V1\Invoicer;

use App\Http\Controllers\Controller;
use App\Http\Resources\Invoicer\CompanyResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class CompanyLogoController extends Controller
{
    /**
     * Upload a new logo for the current company, replacing the old one. Owner only.
     */
    public function store(Request $request): CompanyResource
    {
        $company = $request->user()->currentCompany;

        Gate::authorize('update', $company);

        $request->validate([
            'logo' => ['required', 'image', 'mimes:png,jpg,jpeg,webp', 'max:2048'],
        ]);

        $oldPath = $company->logo_path;

        $company->update(['logo_path' => $request->file('logo')->store('logos', 'public')]);

        if ($oldPath) {
            Storage::disk('public')->delete($oldPath);
        }

        return new CompanyResource($company);
    }

    /**
     * Remove the current company's logo. Owner only.
     */
    public function destroy(Request $request): CompanyResource
    {
        $company = $request->user()->currentCompany;

        Gate::authorize('update', $company);

        if ($company->logo_path) {
            Storage::disk('public')->delete($company->logo_path);
            $company->update(['logo_path' => null]);
        }

        return new CompanyResource($company);
    }
}
