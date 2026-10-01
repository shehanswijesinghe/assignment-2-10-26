<?php

namespace App\Http\Controllers;

use App\Enums\ProductStatus;
use App\Http\Requests\AdminListProductsRequest;
use App\Http\Requests\CategoryRequest;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Requests\UpdateProductStatusRequest;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminProductController extends Controller
{
    public function __construct(private readonly ProductService $products)
    {
    }

    public function stats(): JsonResponse
    {
        return $this->products->stats();
    }

    public function index(AdminListProductsRequest $request): JsonResponse
    {
        return $this->products->adminList($request->params());
    }

    public function show(string $id): JsonResponse
    {
        return $this->products->adminShow($id);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        return $this->products->create($request->validated(), $request->user());
    }

    public function update(UpdateProductRequest $request, string $id): JsonResponse
    {
        return $this->products->update($id, $request->validated());
    }

    public function updateStatus(UpdateProductStatusRequest $request, string $id): JsonResponse
    {
        return $this->products->setStatus($id, ProductStatus::from($request->validated('status')));
    }

    public function categories(Request $request): JsonResponse
    {
        $search = $request->query('search');

        return $this->products->adminCategories(is_string($search) ? trim($search) : null, (int) $request->query('limit', 20));
    }

    public function addCategory(CategoryRequest $request): JsonResponse
    {
        return $this->products->addCategory($request->validated('name'));
    }
}
