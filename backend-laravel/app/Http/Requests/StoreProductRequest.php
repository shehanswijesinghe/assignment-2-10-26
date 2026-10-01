<?php

namespace App\Http\Requests;

class StoreProductRequest extends ProductRequest
{
    protected function allowedStatuses(): array
    {
        return ['draft', 'active'];
    }

    public function rules(): array
    {
        return ['name' => ['bail', 'required', 'string', 'max:150']] + parent::rules();
    }
}
