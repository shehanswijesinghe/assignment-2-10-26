<?php

namespace App\Http\Controllers;

use App\Http\Requests\ListProductsRequest;
use App\Http\Requests\RateProductRequest;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShopController extends Controller
{
    public function __construct(private readonly ProductService $products)
    {
    }

    public function index(ListProductsRequest $request): JsonResponse
    {
        return $this->products->publicList($request->params());
    }

    public function show(string $slug): JsonResponse
    {
        return $this->products->publicDetail($slug);
    }

    public function categories(): JsonResponse
    {
        return $this->products->publicCategories();
    }

    public function sitemap(): JsonResponse
    {
        return $this->products->sitemap();
    }

    public function myRating(Request $request, string $id): JsonResponse
    {
        return $this->products->myRating($request->user(), $id);
    }

    public function rate(RateProductRequest $request, string $id): JsonResponse
    {
        return $this->products->rate($request->user(), $id, (int) $request->validated('rating'));
    }
}
