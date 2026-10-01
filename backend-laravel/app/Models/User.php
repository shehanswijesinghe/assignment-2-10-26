<?php

namespace App\Models;

use App\Enums\Role;
use App\Enums\UserStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    use HasUuids;

    protected $table = 'users';
    protected $keyType = 'string';
    public $incrementing = false;
    protected $dateFormat = 'Y-m-d H:i:s.v';
    protected $fillable = ['email', 'password_hash', 'first_name', 'last_name', 'role', 'status', 'avatar_base_url', 'avatar_folder', 'avatar_name'];
    protected $hidden = ['password_hash'];

    protected function casts(): array
    {
        return [
            'role' => Role::class,
            'status' => UserStatus::class,
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function toPublic(): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'firstName' => $this->first_name,
            'lastName' => $this->last_name,
            'role' => $this->role->value,
            'status' => $this->status->value,
            'profileImage' => $this->avatar_name
                ? ['baseUrl' => $this->avatar_base_url, 'folder' => $this->avatar_folder, 'name' => $this->avatar_name]
                : null,
            'createdAt' => $this->created_at->clone()->utc()->format('Y-m-d\TH:i:s.v\Z'),
            'updatedAt' => $this->updated_at->clone()->utc()->format('Y-m-d\TH:i:s.v\Z'),
        ];
    }
}
