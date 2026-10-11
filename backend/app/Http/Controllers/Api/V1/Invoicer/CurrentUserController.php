<?php

namespace App\Http\Controllers\Api\V1\Invoicer;

use App\Http\Controllers\Controller;
use App\Http\Resources\Invoicer\CurrentUserResource;
use Illuminate\Http\Request;

class CurrentUserController extends Controller
{
    /**
     * The signed-in user with their current company and role.
     */
    public function show(Request $request): CurrentUserResource
    {
        return new CurrentUserResource($request->user()->load('currentCompany'));
    }
}
