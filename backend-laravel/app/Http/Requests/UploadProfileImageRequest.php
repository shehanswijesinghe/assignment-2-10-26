<?php

namespace App\Http\Requests;

class UploadProfileImageRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'file' => ['bail', 'required', 'file', 'mimetypes:image/jpeg,image/png,image/webp', 'max:'.config('assignment.storage.avatar_max_kb')],
        ];
    }

    public function messages(): array
    {
        return array_merge(parent::messages(), ['file.max' => 'validation.file.max']);
    }
}
