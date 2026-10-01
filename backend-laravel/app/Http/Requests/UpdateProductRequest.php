<?php

namespace App\Http\Requests;

class UpdateProductRequest extends ProductRequest
{
    protected function allowedStatuses(): array
    {
        return ['draft', 'active', 'deactivated'];
    }
}
