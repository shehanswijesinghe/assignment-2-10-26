<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class LogRequests
{
    public function handle(Request $request, Closure $next)
    {
        $incoming = $request->header('X-Request-Id');
        $id = is_string($incoming) && preg_match('/^[\w-]{8,64}$/', $incoming) ? $incoming : (string) Str::uuid();
        Log::shareContext(['request_id' => $id]);
        $start = microtime(true);

        $response = $next($request);
        $response->headers->set('X-Request-Id', $id);

        $status = $response->getStatusCode();
        $path = '/'.ltrim($request->path(), '/');
        $level = $status >= 500 ? 'error' : ($status >= 400 ? 'warning' : ($path === '/api/health' ? 'debug' : 'info'));
        Log::log($level, sprintf('%s %s %d %.1fms', $request->method(), $path, $status, (microtime(true) - $start) * 1000), [
            'ip' => $request->ip(),
        ]);

        return $response;
    }
}
