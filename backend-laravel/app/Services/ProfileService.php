<?php

namespace App\Services;

use App\Models\User;

class ProfileService
{
    public function __construct(private readonly ObjectStorage $storage)
    {
    }

    /**
    * @param bool $touchImage
    * @param array{folder:string,name:string}|null $image
     */
    public function update(User $user, string $firstName, string $lastName, bool $touchImage, ?array $image): User
    {
        $previous = $user->avatar_name ? ['folder' => $user->avatar_folder, 'name' => $user->avatar_name] : null;
        $attributes = ['first_name' => $firstName, 'last_name' => $lastName];

        if ($touchImage) {
            $attributes += $image === null
                ? ['avatar_base_url' => null, 'avatar_folder' => null, 'avatar_name' => null]
                : ['avatar_base_url' => $this->storage->baseUrl(), 'avatar_folder' => $image['folder'], 'avatar_name' => $image['name']];
        }

        $user->update($attributes);

        if ($touchImage && $previous && ($image === null || $previous['name'] !== $image['name'])) {
            $this->storage->deleteQuietly($previous['folder'], $previous['name']);
        }

        return $user->fresh();
    }
}
