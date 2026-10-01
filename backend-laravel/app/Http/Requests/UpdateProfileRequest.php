<?php

namespace App\Http\Requests;

use App\Services\ObjectStorage;
use Illuminate\Contracts\Validation\Validator;

class UpdateProfileRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'firstName' => $this->nameRules(),
            'lastName' => $this->nameRules(),
            'profileImage' => ['bail', 'sometimes', 'nullable', 'array'],
            'profileImage.folder' => ['bail', 'required_with:profileImage', 'string', 'max:255'],
            'profileImage.name' => ['bail', 'required_with:profileImage', 'string', 'max:255'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        parent::withValidator($validator);

        $validator->after(function (Validator $v) {
            $image = $this->input('profileImage');
            if (! is_array($image) || $v->errors()->hasAny(['profileImage', 'profileImage.folder', 'profileImage.name'])) {
                return;
            }
            $storage = app(ObjectStorage::class);
            $folder = $image['folder'] ?? null;
            $name = $image['name'] ?? null;
            $valid = is_string($folder) && is_string($name)
                && $folder === $storage->profileFolder($this->user()->id)
                && $storage->isValidName($name)
                && $storage->exists($folder, $name);
            if (! $valid) {
                $v->errors()->add('profileImage', 'validation.image.invalid');
            }
        });
    }
}
