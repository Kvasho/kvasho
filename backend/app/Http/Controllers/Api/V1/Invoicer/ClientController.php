<?php

namespace App\Http\Controllers\Api\V1\Invoicer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Invoicer\ClientRequest;
use App\Http\Resources\Invoicer\ClientResource;
use App\Models\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

/**
 * Clients of the current company. The tenant scope on Client keeps every
 * query, including route model binding, inside that company.
 */
class ClientController extends Controller
{
    /**
     * List clients alphabetically, optionally filtered by a search text.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', Client::class);

        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $clients = Client::query()
            ->when($validated['search'] ?? null, fn ($query, string $search) => $query->search($search))
            ->orderBy('name')
            ->paginate($validated['per_page'] ?? 15)
            ->withQueryString();

        return ClientResource::collection($clients);
    }

    public function store(ClientRequest $request): JsonResponse
    {
        Gate::authorize('create', Client::class);

        $client = Client::create($request->validated());

        return (new ClientResource($client))->response()->setStatusCode(201);
    }

    public function show(Client $client): ClientResource
    {
        Gate::authorize('view', $client);

        return new ClientResource($client);
    }

    public function update(ClientRequest $request, Client $client): ClientResource
    {
        Gate::authorize('update', $client);

        $client->update($request->validated());

        return new ClientResource($client);
    }

    /**
     * Archive the client. Their invoices keep their own copy of the client's details.
     */
    public function destroy(Client $client): Response
    {
        Gate::authorize('delete', $client);

        $client->delete();

        return response()->noContent();
    }
}
