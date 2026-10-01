<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AdminProductController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\UserController;
use App\Support\ApiResponse;
use App\Support\ResponseCode;
use Illuminate\Support\Facades\Route;

Route::get('health', fn () => ApiResponse::ok(ResponseCode::HEALTH_OK, ['status' => 'ok']));

Route::middleware('throttle:api')->group(function () {
    Route::get('files/{path}', [FileController::class, 'show'])->where('path', '.+');

    Route::get('categories', [ShopController::class, 'categories']);
    Route::get('products', [ShopController::class, 'index']);
    Route::get('sitemap/products', [ShopController::class, 'sitemap']);
    Route::get('products/{slug}', [ShopController::class, 'show'])->where('slug', '[a-z0-9-]+');

    Route::prefix('auth')->middleware('throttle:auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('verify-otp', [AuthController::class, 'verifyOtp']);
        Route::post('resend-otp', [AuthController::class, 'resendOtp']);
        Route::post('login', [AuthController::class, 'login']);
    });

    Route::middleware('jwt')->group(function () {
        Route::get('users/me', [UserController::class, 'show']);
        Route::patch('users/me', [UserController::class, 'update']);

        Route::post('files/profile-images', [FileController::class, 'uploadProfileImage'])->middleware('throttle:uploads');
        Route::delete('files/profile-images/{name}', [FileController::class, 'destroyProfileImage']);

        Route::get('products/{id}/my-rating', [ShopController::class, 'myRating']);
        Route::put('products/{id}/rating', [ShopController::class, 'rate']);

        Route::post('files/product-images', [FileController::class, 'uploadProductImage'])->middleware(['role:ADMIN', 'throttle:uploads']);
        Route::delete('files/product-images/{name}', [FileController::class, 'destroyProductImage'])->middleware('role:ADMIN');

        Route::prefix('admin')->middleware('role:ADMIN')->group(function () {
            Route::get('products/stats', [AdminProductController::class, 'stats']);
            Route::get('products', [AdminProductController::class, 'index']);
            Route::post('products', [AdminProductController::class, 'store']);
            Route::get('products/{id}', [AdminProductController::class, 'show']);
            Route::put('products/{id}', [AdminProductController::class, 'update']);
            Route::patch('products/{id}/status', [AdminProductController::class, 'updateStatus']);
            Route::get('categories', [AdminProductController::class, 'categories']);
            Route::post('categories', [AdminProductController::class, 'addCategory']);

            Route::get('stats', [AdminController::class, 'stats']);
            Route::get('users', [AdminController::class, 'users']);
            Route::patch('users/{id}/status', [AdminController::class, 'updateStatus']);
        });
    });
});
