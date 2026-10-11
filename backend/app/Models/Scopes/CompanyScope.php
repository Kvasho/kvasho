<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

/**
 * Limits tenant models to the signed-in user's current company.
 *
 * Without a signed-in user (queued jobs, the scheduler, the public invoice
 * page, Stripe webhooks) nothing is filtered; that code looks records up by
 * an explicit key and must stay system-wide.
 */
class CompanyScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        if (! Auth::hasUser()) {
            return;
        }

        $builder->where($model->qualifyColumn('company_id'), Auth::user()->current_company_id ?? 0);
    }
}
