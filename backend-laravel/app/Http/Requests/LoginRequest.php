<?php

namespace App\Http\Requests;

class LoginRequest extends ApiRequest
{
    public function rules(): array
    {
        return ['email' => $this->emailRules(), 'password' => ['bail', 'required', 'string', 'max:72']];
    }
}
