<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class EmailOtp extends Model
{
    use HasUuids;

    public const UPDATED_AT = null;

    protected $table = 'email_otps';
    protected $keyType = 'string';
    public $incrementing = false;
    protected $dateFormat = 'Y-m-d H:i:s.v';
    protected $fillable = ['user_id', 'code_hash', 'expires_at', 'consumed_at'];

    protected function casts(): array
    {
        return ['expires_at' => 'datetime', 'consumed_at' => 'datetime', 'created_at' => 'datetime'];
    }
}
