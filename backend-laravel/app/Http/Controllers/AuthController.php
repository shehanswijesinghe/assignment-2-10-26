<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\ResendOtpRequest;
use App\Http\Requests\VerifyOtpRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $auth)
    {
    }

    public function register(RegisterRequest $r): JsonResponse
    {
        return $this->auth->register($r->validated());
    }

    public function verifyOtp(VerifyOtpRequest $r): JsonResponse
    {
        return $this->auth->verifyOtp($r->validated('email'), $r->validated('otp'));
    }

    public function resendOtp(ResendOtpRequest $r): JsonResponse
    {
        return $this->auth->resendOtp($r->validated('email'));
    }

    public function login(LoginRequest $r): JsonResponse
    {
        return $this->auth->login($r->validated('email'), $r->validated('password'));
    }
}
