<?php

namespace App\Http\Resources\Invoicer;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Company
 */
class CompanyResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'logo_url' => $this->logoUrl(),
            'tax_id' => $this->tax_id,
            'address' => $this->address,
            'email' => $this->email,
            'phone' => $this->phone,
            'bank_account' => $this->bank_account,
            'currency' => $this->currency,
            'invoice_prefix' => $this->invoice_prefix,
        ];
    }
}
