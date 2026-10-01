<?php

namespace App\Services;

use App\Models\User;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use RuntimeException;

class JwtService
{
    public function issue(User $user): string
    {
        $now = time();

        return JWT::encode(
            ['sub' => $user->id, 'role' => $user->role->value, 'iat' => $now, 'exp' => $now + $this->ttl()],
            $this->secret(),
            'HS256',
        );
    }

    public function decode(string $token): object
    {
        return JWT::decode($token, new Key($this->secret(), 'HS256'));
    }

    public function secret(): string
    {
        $secret = (string) config('assignment.jwt_secret');
        if (strlen($secret) < 16) {
            throw new RuntimeException('JWT_SECRET must be at least 16 characters.');
        }

        return $secret;
    }

    private function ttl(): int
    {
        $raw = trim((string) config('assignment.jwt_expires_in', '1d'));
        if (! preg_match('/^(\d+)\s*([smhd]?)$/i', $raw, $m)) {
            throw new RuntimeException('JWT_EXPIRES_IN must look like 1d, 12h, 30m, 45s or a number of seconds.');
        }

        return (int) $m[1] * match (strtolower($m[2])) {
            'm' => 60, 'h' => 3600, 'd' => 86400, default => 1,
        };
    }
}
