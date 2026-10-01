<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        RateLimiter::for('api', fn (Request $r) => Limit::perMinute(120)->by('api|'.$r->ip()));
        RateLimiter::for('uploads', fn (Request $r) => Limit::perMinute(10)->by('upload|'.($r->user()?->id ?? $r->ip())));
        RateLimiter::for('auth', fn (Request $r) => Limit::perMinute(10)->by('auth|'.$r->ip()));
    }
}
