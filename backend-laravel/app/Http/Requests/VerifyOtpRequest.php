<?php

namespace App\Http\Requests;

class VerifyOtpRequest extends ApiRequest
{
    public function rules(): array
    {
        return ['email' => $this->emailRules(), 'otp' => ['bail', 'required', 'string', 'regex:/^\d{6}$/']];
    }

    public function messages(): array
    {
        return array_merge(parent::messages(), ['otp.regex' => 'validation.otp.format']);
    }
}
