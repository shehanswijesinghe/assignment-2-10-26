<?php

namespace App\Http\Requests;

class UpdateStatusRequest extends ApiRequest
{
    public function rules(): array
    {
        return ['status' => ['bail', 'required', 'string', 'in:activated,deactivated,deleted']];
    }
}
