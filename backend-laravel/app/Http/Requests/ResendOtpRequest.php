<?php

namespace App\Http\Requests;

class ResendOtpRequest extends ApiRequest
{
    public function rules(): array
    {
        return ['email' => $this->emailRules()];
    }
}
