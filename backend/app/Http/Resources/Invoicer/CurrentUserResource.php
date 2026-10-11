<?php

namespace App\Http\Resources\Invoicer;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The signed-in user, their current company and what they may do in it.
 *
 * @mixin User
 */
class CurrentUserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $role = $this->currentRole();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $role?->value,
            'can' => [
                'manage_company' => $role?->canManageCompany() ?? false,
                'manage_invoices' => $role?->canManageInvoices() ?? false,
            ],
            'company' => $this->currentCompany ? new CompanyResource($this->currentCompany) : null,
        ];
    }
}
