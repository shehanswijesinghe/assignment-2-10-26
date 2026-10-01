<?php

namespace App\Http\Requests;

class RegisterRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'firstName' => $this->nameRules(),
            'lastName' => $this->nameRules(),
            'email' => $this->emailRules(),
            'password' => $this->newPasswordRules(),
        ];
    }
}
