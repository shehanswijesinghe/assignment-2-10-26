<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ProductImage extends Model
{
    use HasUuids;

    public const UPDATED_AT = null;

    protected $table = 'product_images';
    protected $keyType = 'string';
    public $incrementing = false;
    protected $dateFormat = 'Y-m-d H:i:s.v';
    protected $fillable = ['product_id', 'base_url', 'folder', 'name', 'position'];

    public function toPublic(): array
    {
        return ['baseUrl' => $this->base_url, 'folder' => $this->folder, 'name' => $this->name];
    }
}
