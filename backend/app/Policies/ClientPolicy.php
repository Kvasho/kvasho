<?php

namespace App\Policies;

use App\Models\Client;
use App\Models\User;

/**
 * Every member may see their company's clients; owners and accountants may
 * change them. Each check also confirms the client belongs to a company the
 * user is a member of, on top of the tenant scope.
 */
class ClientPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->currentRole() !== null;
    }

    public function view(User $user, Client $client): bool
    {
        return $user->roleIn($client->company_id) !== null;
    }

    public function create(User $user): bool
    {
        return $user->currentRole()?->canManageInvoices() ?? false;
    }

    public function update(User $user, Client $client): bool
    {
        return $user->roleIn($client->company_id)?->canManageInvoices() ?? false;
    }

    public function delete(User $user, Client $client): bool
    {
        return $this->update($user, $client);
    }
}
