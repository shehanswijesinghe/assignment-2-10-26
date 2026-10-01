<?php

namespace App\Services;

use App\Enums\ProductStatus;
use App\Exceptions\ApiException;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductRating;
use App\Models\User;
use App\Support\ApiResponse;
use App\Support\Dates;
use App\Support\ResponseCode as C;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ProductService
{
    private const SORT = [
        'createdAt' => 'created_at', 'updatedAt' => 'updated_at', 'price' => 'price',
        'rating' => 'rating_avg', 'name' => 'name', 'status' => 'status',
    ];

    public function __construct(private readonly ObjectStorage $storage)
    {
    }


    public function publicList(array $q): JsonResponse
    {
        $query = Product::query()->where('status', ProductStatus::Active->value);

        return $this->page($query, $q, fn (Product $p) => $p->toCard(), C::PRODUCT_LIST_SUCCESS);
    }

    public function publicDetail(string $slug): JsonResponse
    {
        $product = Product::with(['category', 'images'])->where('slug', $slug)
            ->where('status', ProductStatus::Active->value)->first();
        if (! $product) {
            throw new ApiException(C::PRODUCT_NOT_FOUND, 404);
        }

        return ApiResponse::ok(C::PRODUCT_FETCH_SUCCESS, $product->toDetail());
    }

    public function publicCategories(): JsonResponse
    {
        $active = fn ($q) => $q->where('status', ProductStatus::Active->value);
        $rows = Category::query()->whereHas('products', $active)->withCount(['products as products_count' => $active])
            ->orderBy('name')->get();

        return ApiResponse::ok(C::CATEGORY_LIST_SUCCESS, $rows->map(fn ($c) => [
            'id' => $c->id, 'name' => $c->name, 'productCount' => (int) $c->products_count,
        ])->all());
    }

    public function sitemap(): JsonResponse
    {
        $rows = Product::where('status', ProductStatus::Active->value)->orderByDesc('updated_at')->limit(5000)->get(['slug', 'updated_at']);

        return ApiResponse::ok(C::PRODUCT_SITEMAP_SUCCESS, $rows->map(fn ($p) => [
            'slug' => $p->slug, 'updatedAt' => Dates::iso($p->updated_at),
        ])->all());
    }

    public function myRating(User $user, string $productId): JsonResponse
    {
        $this->activeProduct($productId);
        $rating = ProductRating::where('product_id', $productId)->where('user_id', $user->id)->value('rating');

        return ApiResponse::ok(C::PRODUCT_RATING_FETCH_SUCCESS, ['myRating' => $rating === null ? null : (int) $rating]);
    }

    public function rate(User $user, string $productId, int $rating): JsonResponse
    {
        $result = DB::transaction(function () use ($user, $productId, $rating) {
            $product = Product::whereKey($productId)->where('status', ProductStatus::Active->value)->lockForUpdate()->first();
            if (! $product) {
                throw new ApiException(C::PRODUCT_NOT_FOUND, 404);
            }
            ProductRating::updateOrCreate(['product_id' => $productId, 'user_id' => $user->id], ['rating' => $rating]);
            $agg = ProductRating::where('product_id', $productId)->selectRaw('AVG(rating) as avg_rating, COUNT(*) as total')->first();
            DB::table('products')->where('id', $productId)->update([
                'rating_avg' => round((float) $agg->avg_rating, 2), 'rating_count' => (int) $agg->total,
            ]);

            return ['ratingAvg' => round((float) $agg->avg_rating, 2), 'ratingCount' => (int) $agg->total, 'myRating' => $rating];
        });
        Log::info('Product rated', ['productId' => $productId, 'userId' => $user->id, 'rating' => $rating]);

        return ApiResponse::ok(C::PRODUCT_RATE_SUCCESS, $result);
    }


    public function adminList(array $q): JsonResponse
    {
        $query = Product::query();
        $q['status'] ? $query->where('status', $q['status']) : $query->where('status', '!=', ProductStatus::Deleted->value);

        return $this->page($query, $q, fn (Product $p) => $p->toAdmin(), C::PRODUCT_LIST_SUCCESS);
    }

    public function adminShow(string $id): JsonResponse
    {
        return ApiResponse::ok(C::PRODUCT_FETCH_SUCCESS, $this->findForAdmin($id)->toAdmin());
    }

    public function create(array $d, User $admin): JsonResponse
    {
        $product = DB::transaction(function () use ($d, $admin) {
            $p = Product::create($this->attributes($d) + [
                'name' => $d['name'], 'slug' => $this->uniqueSlug($d['name']), 'created_by' => $admin->id,
            ]);
            $this->syncImages($p, $d['images'] ?? []);

            return $p;
        });
        Log::info('Product created', ['productId' => $product->id, 'status' => $product->status->value, 'by' => $admin->id]);

        return ApiResponse::ok(C::PRODUCT_CREATE_SUCCESS, $this->findForAdmin($product->id)->toAdmin(), null, 201);
    }

    public function update(string $id, array $d): JsonResponse
    {
        $product = $this->findForAdmin($id);
        $next = ProductStatus::from($d['status']);
        if ($product->status === ProductStatus::Deleted) {
            throw new ApiException(C::PRODUCT_NOT_FOUND, 404);
        }
        if ($next !== $product->status && ! $product->status->canMoveTo($next)) {
            throw new ApiException(C::PRODUCT_STATUS_TRANSITION_INVALID, 409);
        }

        $removed = [];
        DB::transaction(function () use ($product, $d, &$removed) {
            $product->update($this->attributes($d));
            $removed = $this->syncImages($product, $d['images'] ?? []);
        });
        foreach ($removed as $image) {
            $this->storage->deleteQuietly($image->folder, $image->name);
        }
        Log::info('Product updated', ['productId' => $id, 'status' => $next->value]);

        return ApiResponse::ok(C::PRODUCT_UPDATE_SUCCESS, $this->findForAdmin($id)->toAdmin());
    }

    public function setStatus(string $id, ProductStatus $next): JsonResponse
    {
        $product = $this->findForAdmin($id);
        if (! $product->status->canMoveTo($next)) {
            throw new ApiException(C::PRODUCT_STATUS_TRANSITION_INVALID, 409);
        }
        if ($next !== ProductStatus::Draft && $next !== ProductStatus::Deleted && ($product->price === null || $product->images->isEmpty())) {
            throw new ApiException(C::PRODUCT_INCOMPLETE, 409);
        }

        $previous = $product->status;
        $product->update(['status' => $next]);
        Log::info('Product status changed', ['productId' => $id, 'from' => $previous->value, 'to' => $next->value]);

        return ApiResponse::ok(C::PRODUCT_STATUS_UPDATE_SUCCESS, $this->findForAdmin($id)->toAdmin());
    }

    public function stats(): JsonResponse
    {
        $notDeleted = fn () => Product::where('status', '!=', ProductStatus::Deleted->value);
        $byStatus = [];
        foreach (ProductStatus::cases() as $s) {
            $byStatus[$s->value] = 0;
        }
        foreach (Product::selectRaw('status, COUNT(*) as c')->groupBy('status')->get() as $row) {
            $byStatus[$row->status->value] = (int) $row->c;
        }

        $names = Category::pluck('name', 'id');
        $byCategory = $notDeleted()->selectRaw('category_id, COUNT(*) as c')->groupBy('category_id')->orderByDesc('c')->limit(5)->get()
            ->map(fn ($r) => ['category' => $r->category_id ? ($names[$r->category_id] ?? null) : null, 'count' => (int) $r->c])->all();

        $with = ['category', 'images'];

        return ApiResponse::ok(C::PRODUCT_STATS_SUCCESS, [
            'totalProducts' => $notDeleted()->count(),
            'byStatus' => $byStatus,
            'createdLast7Days' => $notDeleted()->where('created_at', '>=', now()->subDays(7))->count(),
            'createdLast30Days' => $notDeleted()->where('created_at', '>=', now()->subDays(30))->count(),
            'totalRatings' => ProductRating::count(),
            'averageRating' => round((float) ProductRating::avg('rating'), 2),
            'byCategory' => $byCategory,
            'topRated' => Product::with($with)->where('status', ProductStatus::Active->value)->where('rating_count', '>', 0)
                ->orderByDesc('rating_avg')->orderByDesc('rating_count')->limit(5)->get()->map->toAdmin()->all(),
            'recent' => $notDeleted()->with($with)->orderByDesc('created_at')->limit(5)->get()->map->toAdmin()->all(),
        ]);
    }


    public function adminCategories(?string $search, int $limit): JsonResponse
    {
        $query = Category::query()->orderBy('name')->limit(min(max($limit, 1), 50));
        if ($search) {
            $query->where('name', 'like', $this->like($search));
        }

        return ApiResponse::ok(C::CATEGORY_LIST_SUCCESS, $query->get()->map(fn ($c) => ['id' => $c->id, 'name' => $c->name])->all());
    }

    public function addCategory(string $name): JsonResponse
    {
        $existing = Category::where('name', $name)->first();
        $category = $existing ?? Category::create(['name' => $name]);
        if (! $existing) {
            Log::info('Category created', ['categoryId' => $category->id]);
        }

        return ApiResponse::ok(C::CATEGORY_CREATE_SUCCESS, ['id' => $category->id, 'name' => $category->name], null, $existing ? 200 : 201);
    }


    private function findForAdmin(string $id): Product
    {
        $product = Product::with(['category', 'images'])->find($id);
        if (! $product) {
            throw new ApiException(C::PRODUCT_NOT_FOUND, 404);
        }

        return $product;
    }

    private function activeProduct(string $id): Product
    {
        $product = Product::whereKey($id)->where('status', ProductStatus::Active->value)->first();
        if (! $product) {
            throw new ApiException(C::PRODUCT_NOT_FOUND, 404);
        }

        return $product;
    }

    private function page(Builder $query, array $q, callable $map, string $code): JsonResponse
    {
        if ($q['search']) {
            $query->where('name', 'like', $this->like($q['search']));
        }
        if ($q['categoryId']) {
            $query->where('category_id', $q['categoryId']);
        }
        if ($q['minPrice'] !== null) {
            $query->where('price', '>=', $q['minPrice']);
        }
        if ($q['maxPrice'] !== null) {
            $query->where('price', '<=', $q['maxPrice']);
        }
        if ($q['minRating'] !== null) {
            $query->where('rating_avg', '>=', $q['minRating']);
        }
        if ($q['createdFrom']) {
            $query->where('created_at', '>=', $q['createdFrom']);
        }
        if ($q['createdTo']) {
            $query->where('created_at', '<=', $q['createdTo']);
        }

        $total = (clone $query)->count();
        $column = self::SORT[$q['sortBy']];
        $query->orderBy($column, $q['sortOrder']);
        if ($column === 'rating_avg') {
            $query->orderBy('rating_count', $q['sortOrder']);
        }
        $rows = $query->orderBy('id')->with(['category', 'images'])
            ->skip(($q['page'] - 1) * $q['pageSize'])->take($q['pageSize'])->get();

        return ApiResponse::ok($code, $rows->map($map)->all(), [
            'page' => $q['page'], 'pageSize' => $q['pageSize'], 'total' => $total,
            'totalPages' => max(1, (int) ceil($total / $q['pageSize'])),
        ]);
    }

    private function attributes(array $d): array
    {
        return [
            'description' => $d['description'] ?? null,
            'price' => $d['price'] ?? null,
            'category_id' => $d['categoryId'] ?? null,
            'status' => ProductStatus::from($d['status']),
            'meta_title' => $d['metaTitle'] ?? null,
            'meta_description' => $d['metaDescription'] ?? null,
            'meta_keywords' => $d['metaKeywords'] ?? null,
        ];
    }

    /** @return list<ProductImage> */
    private function syncImages(Product $product, array $images): array
    {
        $existing = ProductImage::where('product_id', $product->id)->get()->keyBy('name');
        $keep = [];
        foreach (array_values($images) as $position => $image) {
            $keep[$image['name']] = true;
            if ($row = $existing->get($image['name'])) {
                if ((int) $row->position !== $position) {
                    $row->update(['position' => $position]);
                }
            } else {
                ProductImage::create([
                    'product_id' => $product->id, 'base_url' => $this->storage->baseUrl(),
                    'folder' => $image['folder'], 'name' => $image['name'], 'position' => $position,
                ]);
            }
        }
        $removed = $existing->reject(fn ($row, $name) => isset($keep[$name]))->values();
        foreach ($removed as $row) {
            $row->delete();
        }

        return $removed->all();
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::of(Str::ascii($name))->slug('-')->limit(80, '')->trim('-')->toString() ?: 'product';
        do {
            $slug = $base.'-'.Str::lower(Str::random(6));
        } while (Product::where('slug', $slug)->exists());

        return $slug;
    }

    private function like(string $term): string
    {
        return '%'.addcslashes($term, '\\%_').'%';
    }
}
