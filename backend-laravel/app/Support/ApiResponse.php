<?php

namespace App\Support;

use App\Exceptions\ApiException;
use Illuminate\Contracts\Support\MessageProvider;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

final class ApiResponse
{
    public static function ok(string $code, mixed $data = null, ?array $meta = null, int $status = 200): JsonResponse
    {
        $body = ['success' => true, 'code' => $code, 'data' => $data];
        if ($meta !== null) {
            $body['meta'] = $meta;
        }

        return response()->json($body, $status);
    }

    /**
    * @param array<string, array<string, array<int, mixed>>> $failed
     * @return list<array{field:string,code:string,params?:array<string,int>}>
     */
    public static function details(MessageProvider $errors, array $failed = []): array
    {
        $out = [];
        foreach ($errors->getMessageBag()->messages() as $field => $messages) {
            $code = (string) $messages[0];
            if (! str_starts_with($code, 'validation.')) {
                $code = 'validation.invalid';
            }
            $detail = ['field' => (string) $field, 'code' => $code];
            if ($params = self::params($code, $failed[$field] ?? [])) {
                $detail['params'] = $params;
            }
            $out[] = $detail;
        }

        return $out;
    }

    /** @param array<string, array<int, mixed>> $failedRules */
    private static function params(string $code, array $failedRules): array
    {
        $key = match ($code) {
            'validation.string.min', 'validation.number.min' => 'min',
            'validation.string.max', 'validation.number.max', 'validation.file.max', 'validation.images.max' => 'max',
            default => null,
        };
        $args = reset($failedRules);

        return $key && isset($args[0]) && is_numeric($args[0]) ? [$key => $args[0] + 0] : [];
    }

    public static function fromThrowable(Throwable $e): JsonResponse
    {
        $status = 500;
        $code = ResponseCode::INTERNAL_ERROR;
        $details = null;
        $headers = [];

        if ($e instanceof ApiException) {
            [$status, $code, $details] = [$e->status, $e->errorCode, $e->details];
        } elseif ($e instanceof ValidationException) {
            [$status, $code, $details] = [400, ResponseCode::VALIDATION_FAILED, self::details($e->validator->errors(), $e->validator->failed())];
        } elseif ($e instanceof ModelNotFoundException) {
            [$status, $code] = [404, ResponseCode::RESOURCE_NOT_FOUND];
        } elseif ($e instanceof HttpExceptionInterface) {
            $status = $e->getStatusCode();
            $headers = $e->getHeaders();
            $code = match (true) {
                $status === 401 => ResponseCode::AUTH_UNAUTHORIZED,
                $status === 403 => ResponseCode::AUTH_FORBIDDEN,
                $status === 404 => ResponseCode::RESOURCE_NOT_FOUND,
                $status === 413 => ResponseCode::PAYLOAD_TOO_LARGE,
                $status === 429 => ResponseCode::REQUEST_TOO_MANY,
                $status < 500 => ResponseCode::BAD_REQUEST,
                default => ResponseCode::INTERNAL_ERROR,
            };
        }

        if ($status < 500) {
            Log::warning("{$code} status={$status}", array_filter([
                'fields' => $details ? implode(',', array_map(fn ($d) => $d['field'].':'.$d['code'], $details)) : null,
            ]));
        }

        $body = ['success' => false, 'code' => $code, 'data' => null];
        if ($details) {
            $body['details'] = $details;
        }

        return response()->json($body, $status, $headers);
    }
}
