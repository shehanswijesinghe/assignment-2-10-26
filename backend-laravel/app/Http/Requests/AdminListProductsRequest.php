<?php

namespace App\Http\Requests;

class AdminListProductsRequest extends ListProductsRequest
{
    protected int $defaultPageSize = 10;
    protected int $maxPageSize = 100;

    public function rules(): array
    {
        return parent::rules() + [
            'status' => ['bail', 'sometimes', 'nullable', 'in:active,draft,deactivated,deleted'],
            'createdFrom' => ['bail', 'sometimes', 'nullable', 'date'],
            'createdTo' => ['bail', 'sometimes', 'nullable', 'date'],
        ];
    }

    protected function sortColumns(): array
    {
        return ['name', 'price', 'rating', 'status', 'createdAt', 'updatedAt'];
    }
}
