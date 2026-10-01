<?php

namespace App\Http\Requests;

class UpdateProductStatusRequest extends ApiRequest
{
    public function rules(): array
    {
        return ['status' => ['bail', 'required', 'string', 'in:active,draft,deactivated,deleted']];
    }
}
