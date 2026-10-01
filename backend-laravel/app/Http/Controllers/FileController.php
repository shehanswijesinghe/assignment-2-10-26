<?php

namespace App\Http\Controllers;

use App\Exceptions\ApiException;
use App\Http\Requests\UploadProductImageRequest;
use App\Http\Requests\UploadProfileImageRequest;
use App\Models\ProductImage;
use App\Services\ObjectStorage;
use App\Support\ApiResponse;
use App\Support\ResponseCode as C;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FileController extends Controller
{
    private const EXTENSIONS = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];

    public function __construct(private readonly ObjectStorage $storage)
    {
    }

    public function uploadProfileImage(UploadProfileImageRequest $request): JsonResponse
    {
        $user = $request->user();
        $file = $request->file('file');
        $mime = $file->getMimeType();

        $folder = $this->storage->profileFolder($user->id);
        $name = $this->storage->newProfileName(self::EXTENSIONS[$mime]);

        $this->storage->putObject($folder, $name, $file);
        Log::info('Profile image uploaded', ['userId' => $user->id, 'name' => $name, 'bytes' => $file->getSize()]);

        return ApiResponse::ok(C::FILE_UPLOAD_SUCCESS, [
            'baseUrl' => $this->storage->baseUrl(),
            'folder' => $folder,
            'name' => $name,
            'url' => $this->storage->url($folder, $name),
            'size' => $file->getSize(),
            'contentType' => $mime,
        ], null, 201);
    }

    public function show(string $path): StreamedResponse
    {
        if (! $this->storage->isValidKey($path) || ! $this->storage->keyExists($path)) {
            throw new ApiException(C::FILE_NOT_FOUND, 404);
        }

        return $this->storage->getObject($path);
    }

    public function destroyProfileImage(Request $request, string $name): JsonResponse
    {
        $user = $request->user();
        $folder = $this->storage->profileFolder($user->id);
        if (! $this->storage->isValidName($name) || ! $this->storage->exists($folder, $name)) {
            throw new ApiException(C::FILE_NOT_FOUND, 404);
        }

        $this->storage->deleteObject($folder, $name);
        if ($user->avatar_name === $name) {
            $user->update(['avatar_base_url' => null, 'avatar_folder' => null, 'avatar_name' => null]);
        }
        Log::info('Profile image deleted', ['userId' => $user->id, 'name' => $name]);

        return ApiResponse::ok(C::FILE_DELETE_SUCCESS, $user->fresh()->toPublic());
    }

    public function uploadProductImage(UploadProductImageRequest $request): JsonResponse
    {
        $file = $request->file('file');
        $mime = $file->getMimeType();
        $folder = ObjectStorage::PRODUCT_FOLDER;
        $name = $this->storage->newProductName($request->validated('productName'), self::EXTENSIONS[$mime]);

        $this->storage->putObject($folder, $name, $file);
        Log::info('Product image uploaded', ['userId' => $request->user()->id, 'name' => $name, 'bytes' => $file->getSize()]);

        return ApiResponse::ok(C::FILE_UPLOAD_SUCCESS, [
            'baseUrl' => $this->storage->baseUrl(),
            'folder' => $folder,
            'name' => $name,
            'url' => $this->storage->url($folder, $name),
            'size' => $file->getSize(),
            'contentType' => $mime,
        ], null, 201);
    }

    public function destroyProductImage(Request $request, string $name): JsonResponse
    {
        $folder = ObjectStorage::PRODUCT_FOLDER;
        if (! $this->storage->isValidProductName($name) || ! $this->storage->exists($folder, $name)) {
            throw new ApiException(C::FILE_NOT_FOUND, 404);
        }
        if (ProductImage::where('name', $name)->exists()) {
            throw new ApiException(C::FILE_IN_USE, 409);
        }

        $this->storage->deleteObject($folder, $name);
        Log::info('Product image deleted', ['userId' => $request->user()->id, 'name' => $name]);

        return ApiResponse::ok(C::FILE_DELETE_SUCCESS);
    }
}
