<?php

namespace App\Http\Middleware;

use App\Exceptions\ApiException;
use App\Support\ResponseCode;
use Closure;
use Illuminate\Http\Request;

class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles)
    {
        $user = $request->user();
        if (! $user || ! in_array($user->role->value, $roles, true)) {
            throw new ApiException(ResponseCode::AUTH_FORBIDDEN, 403);
        }

        return $next($request);
    }
}
