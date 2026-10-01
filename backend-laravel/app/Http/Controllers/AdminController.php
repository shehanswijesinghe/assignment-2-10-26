<?php

namespace App\Http\Controllers;

use App\Enums\UserStatus;
use App\Http\Requests\ListUsersRequest;
use App\Http\Requests\UpdateStatusRequest;
use App\Services\AdminService;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    public function __construct(private readonly AdminService $admin)
    {
    }

    public function stats(): JsonResponse
    {
        return $this->admin->stats();
    }

    public function users(ListUsersRequest $request): JsonResponse
    {
        return $this->admin->listUsers($request->params());
    }

    public function updateStatus(string $id, UpdateStatusRequest $request): JsonResponse
    {
        return $this->admin->updateStatus($id, UserStatus::from($request->validated('status')));
    }
}
