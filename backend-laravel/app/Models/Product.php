<?php

namespace App\Models;

use App\Enums\ProductStatus;
use App\Support\Dates;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasUuids;

    protected $table = 'products';
    protected $keyType = 'string';
    public $incrementing = false;
    protected $dateFormat = 'Y-m-d H:i:s.v';
    protected $fillable = [
        'name', 'slug', 'description', 'price', 'category_id', 'status',
        'meta_title', 'meta_description', 'meta_keywords', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'status' => ProductStatus::class,
            'price' => 'decimal:2',
            'rating_avg' => 'decimal:2',
            'rating_count' => 'integer',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('position');
    }

    private function money(): ?float
    {
        return $this->price === null ? null : (float) $this->price;
    }

    private function categoryShape(): ?array
    {
        return $this->category ? ['id' => $this->category->id, 'name' => $this->category->name] : null;
    }

    public function toCard(): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'price' => $this->money(),
            'category' => $this->categoryShape(),
            'ratingAvg' => (float) $this->rating_avg,
            'ratingCount' => $this->rating_count,
            'image' => $this->images->first()?->toPublic(),
        ];
    }

    public function toDetail(): array
    {
        return $this->toCard() + [
            'description' => $this->description,
            'images' => $this->images->map->toPublic()->all(),
            'metaTitle' => $this->meta_title,
            'metaDescription' => $this->meta_description,
            'metaKeywords' => $this->meta_keywords,
            'createdAt' => Dates::iso($this->created_at),
            'updatedAt' => Dates::iso($this->updated_at),
        ];
    }

    public function toAdmin(): array
    {
        return $this->toDetail() + ['status' => $this->status->value];
    }
}
