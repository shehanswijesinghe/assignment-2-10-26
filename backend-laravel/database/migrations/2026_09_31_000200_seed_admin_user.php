<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

return new class extends Migration
{
    private const EMAIL = 'admin@assignment.local';

    public function up(): void
    {
        if (DB::table('users')->where('email', self::EMAIL)->exists()) {
            return;
        }
        $now = now()->utc()->format('Y-m-d H:i:s.v');
        DB::table('users')->insert([
            'id' => (string) Str::uuid(),
            'email' => self::EMAIL,
            'password_hash' => Hash::make('Admin@12345'),
            'first_name' => 'System',
            'last_name' => 'Admin',
            'role' => 'ADMIN',
            'status' => 'activated',
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }

    public function down(): void
    {
        DB::table('users')->where('email', self::EMAIL)->delete();
    }
};
