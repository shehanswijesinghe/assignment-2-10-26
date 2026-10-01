<?php

namespace App\Http\Requests;

use App\Services\ObjectStorage;
use Illuminate\Contracts\Validation\Validator;

/**
 * Shared rules for creating/updating a product. The body is the FULL state of the editable fields (PUT semantics).
 *  - status `draft` only needs a name (create) - price/images may be missing
 *  - any other status also needs a price and at least one image
 * Unknown keys are rejected, which is how the product name is made immutable on update (it is not a rule there).
 */
abstract class ProductRequest extends ApiRequest
{
    /** @return list<string> */
    abstract protected function allowedStatuses(): array;

    public function rules(): array
    {
        return [
            'status' => ['bail', 'required', 'string', 'in:'.implode(',', $this->allowedStatuses())],
            'price' => ['bail', 'nullable', 'numeric', 'min:0.01', 'max:99999999.99', 'decimal:0,2'],
            'categoryId' => ['bail', 'nullable', 'string', 'exists:categories,id'],
            'description' => ['bail', 'nullable', 'string', 'max:5000'],
            'metaTitle' => ['bail', 'nullable', 'string', 'max:70'],
            'metaDescription' => ['bail', 'nullable', 'string', 'max:160'],
            'metaKeywords' => ['bail', 'nullable', 'string', 'max:255'],
            'images' => ['bail', 'nullable', 'array', 'max:5'],
            'images.*.folder' => ['bail', 'required', 'string', 'max:255'],
            'images.*.name' => ['bail', 'required', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return array_merge(parent::messages(), [
            'price.min' => 'validation.number.min',
            'price.max' => 'validation.number.max',
            'images.max' => 'validation.images.max',
        ]);
    }

    public function withValidator(Validator $validator): void
    {
        parent::withValidator($validator);

        $validator->after(function (Validator $v) {
            if ($v->errors()->isNotEmpty()) {
                return;
            }
            $storage = app(ObjectStorage::class);
            $images = $this->input('images') ?? [];

            $seen = [];
            foreach (array_values($images) as $i => $image) {
                $ok = ($image['folder'] ?? null) === ObjectStorage::PRODUCT_FOLDER
                    && $storage->isValidProductName($image['name'])
                    && ! isset($seen[$image['name']])
                    && $storage->exists(ObjectStorage::PRODUCT_FOLDER, $image['name']);
                $seen[$image['name']] = true;
                if (! $ok) {
                    $v->errors()->add("images.{$i}", 'validation.image.invalid');
                }
            }

            if ($this->input('status') !== 'draft') {
                if ($this->input('price') === null) {
                    $v->errors()->add('price', 'validation.required');
                }
                if (count($images) < 1) {
                    $v->errors()->add('images', 'validation.images.required');
                }
            }
        });
    }
}
