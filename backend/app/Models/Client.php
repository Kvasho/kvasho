<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCompany;
use Database\Factories\ClientFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Someone a company bills. Deleting only archives the client, so invoices
 * issued to them keep pointing at a real record.
 */
#[Fillable(['company_id', 'name', 'email', 'phone', 'address', 'tax_id'])]
class Client extends Model
{
    /** @use HasFactory<ClientFactory> */
    use BelongsToCompany, HasFactory, SoftDeletes;

    /**
     * Clients whose name, email or tax ID contains the search text.
     *
     * @param  Builder<self>  $query
     */
    public function scopeSearch(Builder $query, string $search): void
    {
        $like = '%'.addcslashes($search, '%_\\').'%';

        $query->where(fn (Builder $query) => $query
            ->where('name', 'like', $like)
            ->orWhere('email', 'like', $like)
            ->orWhere('tax_id', 'like', $like));
    }
}
