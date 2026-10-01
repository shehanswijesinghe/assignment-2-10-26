<?php

namespace App\Http\Requests;

use Carbon\Carbon;

class ListProductsRequest extends ApiRequest
{
    protected bool $strict = false;
    protected int $defaultPageSize = 12;
    protected int $maxPageSize = 48;

    public function rules(): array
    {
        return [
            'page' => ['bail', 'sometimes', 'nullable', 'integer', 'min:1'],
            'pageSize' => ['bail', 'sometimes', 'nullable', 'integer', 'min:1', 'max:'.$this->maxPageSize],
            'sortBy' => ['bail', 'sometimes', 'nullable', 'in:'.implode(',', $this->sortColumns())],
            'sortOrder' => ['bail', 'sometimes', 'nullable', 'in:asc,desc'],
            'search' => ['bail', 'sometimes', 'nullable', 'string', 'max:100'],
            'categoryId' => ['bail', 'sometimes', 'nullable', 'string', 'max:36'],
            'minPrice' => ['bail', 'sometimes', 'nullable', 'numeric', 'min:0'],
            'maxPrice' => ['bail', 'sometimes', 'nullable', 'numeric', 'min:0'],
            'minRating' => ['bail', 'sometimes', 'nullable', 'numeric', 'min:0', 'max:5'],
        ];
    }

    /** @return list<string> */
    protected function sortColumns(): array
    {
        return ['createdAt', 'price', 'rating', 'name'];
    }

    public function messages(): array
    {
        return array_merge(parent::messages(), [
            'page.min' => 'validation.number.min',
            'pageSize.min' => 'validation.number.min',
            'pageSize.max' => 'validation.number.max',
            'minPrice.min' => 'validation.number.min',
            'maxPrice.min' => 'validation.number.min',
            'minRating.min' => 'validation.number.min',
            'minRating.max' => 'validation.number.max',
        ]);
    }

    public function params(): array
    {
        $v = $this->validated();
        $num = fn ($k) => isset($v[$k]) ? (float) $v[$k] : null;

        return [
            'page' => (int) ($v['page'] ?? 1),
            'pageSize' => (int) ($v['pageSize'] ?? $this->defaultPageSize),
            'sortBy' => $v['sortBy'] ?? 'createdAt',
            'sortOrder' => $v['sortOrder'] ?? 'desc',
            'search' => $v['search'] ?? null,
            'categoryId' => $v['categoryId'] ?? null,
            'minPrice' => $num('minPrice'),
            'maxPrice' => $num('maxPrice'),
            'minRating' => $num('minRating'),
            'status' => $v['status'] ?? null,
            'createdFrom' => isset($v['createdFrom']) ? Carbon::parse($v['createdFrom'], 'UTC') : null,
            'createdTo' => isset($v['createdTo']) ? Carbon::parse($v['createdTo'], 'UTC') : null,
        ];
    }
}
