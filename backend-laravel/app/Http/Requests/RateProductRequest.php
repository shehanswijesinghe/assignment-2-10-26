<?php

namespace App\Http\Requests;

class RateProductRequest extends ApiRequest
{
    public function rules(): array
    {
        return ['rating' => ['bail', 'required', 'integer', 'min:1', 'max:5']];
    }

    public function messages(): array
    {
        return array_merge(parent::messages(), ['rating.min' => 'validation.number.min', 'rating.max' => 'validation.number.max']);
    }
}
