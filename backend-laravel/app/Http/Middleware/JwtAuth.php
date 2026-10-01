<?php

namespace App\Http\Middleware;

use App\Enums\UserStatus;
use App\Exceptions\ApiException;
use App\Models\User;
use App\Services\JwtService;
use App\Support\ResponseCode;
use Closure;
use Illuminate\Http\Request;
use Throwable;

class JwtAuth
{
    public function __construct(private readonly JwtService $jwt)
    {
    }

    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();
        if (! $token) {
            throw $this->unauthorized();
        }

        try {
            $payload = $this->jwt->decode($token);
        } catch (Throwable) {
            throw $this->unauthorized();
        }

        $user = User::find($payload->sub ?? null);
        if (! $user || $user->status !== UserStatus::Activated) {
            throw $this->unauthorized();
        }

        $request->setUserResolver(fn () => $user);

        return $next($request);
    }

    private function unauthorized(): ApiException
    {
        return new ApiException(ResponseCode::AUTH_UNAUTHORIZED, 401);
    }
}
