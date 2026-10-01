<?php

namespace App\Services;

use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Filesystem\FilesystemManager;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class ObjectStorage
{
    public const PROFILE_ROOT = 'profile-images';
    public const PRODUCT_FOLDER = 'product-images';

    private const PROFILE_NAME = '/^(profile_\d{8}_\d{14}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.(jpg|png|webp)$/i';
    private const PRODUCT_NAME = '/^product_[a-z0-9-]{1,40}_\d{8}_\d{14}\.(jpg|png|webp)$/';

    public function __construct(private readonly FilesystemManager $manager)
    {
    }

    private function disk(): FilesystemAdapter
    {
        return $this->manager->disk(config('assignment.storage.disk'));
    }

    public function baseUrl(): string
    {
        return rtrim((string) config('assignment.storage.base_url'), '/');
    }

    public function url(string $folder, string $name): string
    {
        return "{$this->baseUrl()}/{$folder}/{$name}";
    }

    public function profileFolder(string $userId): string
    {
        return self::PROFILE_ROOT.'/'.$userId;
    }

    public function isValidName(string $name): bool
    {
        return (bool) preg_match(self::PROFILE_NAME, $name);
    }

    public function isValidProductName(string $name): bool
    {
        return (bool) preg_match(self::PRODUCT_NAME, $name);
    }

    public function isValidKey(string $key): bool
    {
        $parts = explode('/', $key);
        if (count($parts) === 3 && $parts[0] === self::PROFILE_ROOT) {
            return (bool) preg_match('/^[0-9a-f-]{36}$/i', $parts[1]) && $this->isValidName($parts[2]);
        }

        return count($parts) === 2 && $parts[0] === self::PRODUCT_FOLDER && $this->isValidProductName($parts[1]);
    }

    public function newProfileName(string $extension): string
    {
        return "profile_{$this->stamp()}.{$extension}";
    }

    public function newProductName(string $productName, string $extension): string
    {
        $slug = Str::of(Str::ascii($productName))->slug('-')->limit(40, '')->trim('-')->toString();

        return 'product_'.($slug !== '' ? $slug : 'item')."_{$this->stamp()}.{$extension}";
    }

    private function stamp(): string
    {
        return random_int(10000000, 99999999).'_'.now()->utc()->format('YmdHis');
    }

    public function putObject(string $folder, string $name, UploadedFile $file): void
    {
        $this->disk()->putFileAs($folder, $file, $name, ['CacheControl' => 'public, max-age=31536000, immutable']);
    }

    public function exists(string $folder, string $name): bool
    {
        return $this->disk()->exists("{$folder}/{$name}");
    }

    public function deleteObject(string $folder, string $name): void
    {
        $this->disk()->delete("{$folder}/{$name}");
    }

    public function deleteQuietly(string $folder, string $name): void
    {
        try {
            $this->deleteObject($folder, $name);
        } catch (Throwable $e) {
            Log::warning('Could not delete storage object', ['key' => "{$folder}/{$name}", 'error' => $e->getMessage()]);
        }
    }

    public function getObject(string $key): StreamedResponse
    {
        return $this->disk()->response($key, null, [
            'Cache-Control' => 'public, max-age=31536000, immutable',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public function keyExists(string $key): bool
    {
        return $this->disk()->exists($key);
    }
}
