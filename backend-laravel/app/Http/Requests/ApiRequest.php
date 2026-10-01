<?php

namespace App\Http\Requests;

use App\Exceptions\ApiException;
use App\Support\ApiResponse;
use App\Support\ResponseCode;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

abstract class ApiRequest extends FormRequest
{
    protected bool $strict = true;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('email'))) {
            $this->merge(['email' => Str::lower(trim($this->input('email')))]);
        }
    }

    public function messages(): array
    {
        return [
            'required' => 'validation.required',
            'string' => 'validation.type.invalid',
            'integer' => 'validation.type.invalid',
            'email' => 'validation.email.invalid',
            'date' => 'validation.date.invalid',
            'in' => 'validation.enum.invalid',
            'array' => 'validation.type.invalid',
            'numeric' => 'validation.type.invalid',
            'decimal' => 'validation.number.decimals',
            'exists' => 'validation.reference.invalid',
            'required_with' => 'validation.required',
            'file' => 'validation.file.invalid',
            'mimetypes' => 'validation.file.type',
            'min' => 'validation.string.min',
            'max' => 'validation.string.max',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        if (! $this->strict) {
            return;
        }
        $validator->after(function (Validator $v) {
            foreach (array_diff(array_keys($this->all()), array_keys($this->rules())) as $key) {
                $v->errors()->add((string) $key, 'validation.key.unrecognized');
            }
        });
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new ApiException(ResponseCode::VALIDATION_FAILED, 400, ApiResponse::details($validator->errors(), $validator->failed()));
    }

    /** @return array<int, mixed> */
    protected function emailRules(): array
    {
        return ['bail', 'required', 'string', 'email:rfc', 'max:255'];
    }

    /** @return array<int, mixed> */
    protected function nameRules(): array
    {
        return ['bail', 'required', 'string', 'max:100'];
    }

    /** @return array<int, mixed> */
    protected function newPasswordRules(): array
    {
        return [
            'bail', 'required', 'string', 'min:8', 'max:72',
            function (string $attribute, mixed $value, \Closure $fail) {
                if (! preg_match('/[a-z]/', $value)) {
                    $fail('validation.password.lowercase');
                } elseif (! preg_match('/[A-Z]/', $value)) {
                    $fail('validation.password.uppercase');
                } elseif (! preg_match('/\d/', $value)) {
                    $fail('validation.password.number');
                }
            },
        ];
    }
}
