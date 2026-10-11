<?php

namespace App\Policies;

use App\Models\Company;
use App\Models\User;

class CompanyPolicy
{
    /**
     * Any member may see their company's details.
     */
    public function view(User $user, Company $company): bool
    {
        return $user->roleIn($company) !== null;
    }

    /**
     * Only the owner may change company details and the logo.
     */
    public function update(User $user, Company $company): bool
    {
        return $user->roleIn($company)?->canManageCompany() ?? false;
    }
}
