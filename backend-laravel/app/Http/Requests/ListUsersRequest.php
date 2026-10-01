<?php

namespace App\Http\Requests;

use Carbon\Carbon;

class ListUsersRequest extends ApiRequest
{
    protected bool $strict = false;

    public function rules(): array
    {
        return [
            'page' => ['bail', 'sometimes', 'nullable', 'integer', 'min:1'],
            'pageSize' => ['bail', 'sometimes', 'nullable', 'integer', 'min:1', 'max:100'],
            'sortBy' => ['bail', 'sometimes', 'nullable', 'in:firstName,lastName,email,createdAt,updatedAt,status'],
            'sortOrder' => ['bail', 'sometimes', 'nullable', 'in:asc,desc'],
            'status' => ['bail', 'sometimes', 'nullable', 'in:email_approval_pending,email_approved,admin_pending,activated,deactivated,deleted'],
            'role' => ['bail', 'sometimes', 'nullable', 'in:USER,ADMIN'],
            'search' => ['bail', 'sometimes', 'nullable', 'string', 'max:100'],
            'createdFrom' => ['bail', 'sometimes', 'nullable', 'date'],
            'createdTo' => ['bail', 'sometimes', 'nullable', 'date'],
        ];
    }

    public function messages(): array
    {
        return array_merge(parent::messages(), [
            'page.min' => 'validation.number.min',
            'pageSize.min' => 'validation.number.min',
            'pageSize.max' => 'validation.number.max',
        ]);
    }

    public function params(): array
    {
        $v = $this->validated();

        return [
            'page' => (int) ($v['page'] ?? 1),
            'pageSize' => (int) ($v['pageSize'] ?? 10),
            'sortBy' => $v['sortBy'] ?? 'createdAt',
            'sortOrder' => $v['sortOrder'] ?? 'desc',
            'status' => $v['status'] ?? null,
            'role' => $v['role'] ?? null,
            'search' => $v['search'] ?? null,
            'createdFrom' => isset($v['createdFrom']) ? Carbon::parse($v['createdFrom'], 'UTC') : null,
            'createdTo' => isset($v['createdTo']) ? Carbon::parse($v['createdTo'], 'UTC') : null,
        ];
    }
}
