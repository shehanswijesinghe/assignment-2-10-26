<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateProfileRequest;
use App\Services\ProfileService;
use App\Support\ApiResponse;
use App\Support\ResponseCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return ApiResponse::ok(ResponseCode::USER_FETCH_SUCCESS, $request->user()->toPublic());
    }

    public function update(UpdateProfileRequest $request, ProfileService $profile): JsonResponse
    {
        $touchImage = $request->has('profileImage');
        $image = $request->input('profileImage');

        $user = $profile->update(
            $request->user(),
            $request->validated('firstName'),
            $request->validated('lastName'),
            $touchImage,
            $touchImage && is_array($image) ? ['folder' => $image['folder'], 'name' => $image['name']] : null,
        );

        return ApiResponse::ok(ResponseCode::USER_UPDATE_SUCCESS, $user->toPublic());
    }
}
