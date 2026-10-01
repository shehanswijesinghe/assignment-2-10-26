<?php

namespace App\Services;

use App\Enums\Role;
use App\Enums\UserStatus;
use App\Exceptions\ApiException;
use App\Models\EmailOtp;
use App\Models\User;
use App\Support\ApiResponse;
use App\Support\ResponseCode as C;
use Carbon\CarbonInterface;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthService
{
    public function __construct(private readonly JwtService $jwt, private readonly MailService $mail)
    {
    }

    public function register(array $d): JsonResponse
    {
        if (User::where('email', $d['email'])->exists()) {
            throw new ApiException(C::USER_EMAIL_EXISTS, 409);
        }

        try {
            $user = User::create([
                'email' => $d['email'],
                'first_name' => $d['firstName'],
                'last_name' => $d['lastName'],
                'password_hash' => Hash::make($d['password']),
                'role' => Role::User,
                'status' => UserStatus::EmailApprovalPending,
            ]);
        } catch (UniqueConstraintViolationException) {
            throw new ApiException(C::USER_EMAIL_EXISTS, 409);
        }

        $this->issueOtp($user);
        Log::info('User registered', ['userId' => $user->id]);

        return ApiResponse::ok(C::AUTH_REGISTER_SUCCESS, ['email' => $user->email], null, 201);
    }

    public function verifyOtp(string $email, string $otp): JsonResponse
    {
        $user = User::where('email', $email)->first();
        if (! $user) {
            throw new ApiException(C::AUTH_OTP_INVALID, 400);
        }
        if ($user->status !== UserStatus::EmailApprovalPending) {
            throw new ApiException(C::AUTH_EMAIL_ALREADY_VERIFIED, 409);
        }

        $record = EmailOtp::where('user_id', $user->id)->whereNull('consumed_at')
            ->orderByDesc('created_at')->orderByDesc('id')->first();
        if (! $record) {
            throw new ApiException(C::AUTH_OTP_INVALID, 400);
        }
        if ($record->expires_at->isPast()) {
            throw new ApiException(C::AUTH_OTP_EXPIRED, 400);
        }
        if (! hash_equals($record->code_hash, $this->hashOtp($user->id, $otp))) {
            throw new ApiException(C::AUTH_OTP_INVALID, 400);
        }

        DB::transaction(function () use ($record, $user) {
            $record->update(['consumed_at' => now()]);
            $user->update(['status' => UserStatus::EmailApproved]);
            $user->update(['status' => UserStatus::AdminPending]);
        });
        $this->mail->sendEmailApproved($user->email, $user->first_name);
        Log::info('Email verified, awaiting admin approval', ['userId' => $user->id]);

        return ApiResponse::ok(C::AUTH_EMAIL_VERIFIED);
    }

    public function resendOtp(string $email): JsonResponse
    {
        $user = User::where('email', $email)->first();
        if (! $user) {
            return ApiResponse::ok(C::AUTH_OTP_SENT);
        }
        if ($user->status !== UserStatus::EmailApprovalPending) {
            throw new ApiException(C::AUTH_EMAIL_ALREADY_VERIFIED, 409);
        }

        $last = EmailOtp::where('user_id', $user->id)->orderByDesc('created_at')->orderByDesc('id')->first();
        $cooldownMs = (int) config('assignment.otp_resend_cooldown_seconds') * 1000;
        if ($last && $this->ms(now()) - $this->ms($last->created_at) < $cooldownMs) {
            throw new ApiException(C::AUTH_OTP_RESEND_TOO_SOON, 429);
        }

        $this->issueOtp($user);

        return ApiResponse::ok(C::AUTH_OTP_SENT);
    }

    public function login(string $email, string $password): JsonResponse
    {
        $user = User::where('email', $email)->first();
        $valid = $user && Hash::check($password, $user->password_hash);
        if (! $user || ! $valid || $user->status === UserStatus::Deleted) {
            throw new ApiException(C::AUTH_INVALID_CREDENTIALS, 401);
        }

        $blocked = match ($user->status) {
            UserStatus::EmailApprovalPending => C::AUTH_EMAIL_NOT_VERIFIED,
            UserStatus::EmailApproved, UserStatus::AdminPending => C::AUTH_ADMIN_APPROVAL_PENDING,
            UserStatus::Deactivated => C::AUTH_ACCOUNT_DEACTIVATED,
            default => null,
        };
        if ($blocked) {
            throw new ApiException($blocked, 403);
        }

        Log::info('Login ok', ['userId' => $user->id, 'role' => $user->role->value]);

        return ApiResponse::ok(C::AUTH_LOGIN_SUCCESS, [
            'accessToken' => $this->jwt->issue($user),
            'user' => $user->toPublic(),
        ]);
    }

    private function issueOtp(User $user): void
    {
        $ttl = (int) config('assignment.otp_ttl_seconds');
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        EmailOtp::where('user_id', $user->id)->whereNull('consumed_at')->update(['consumed_at' => now()]);
        EmailOtp::create([
            'user_id' => $user->id,
            'code_hash' => $this->hashOtp($user->id, $code),
            'expires_at' => now()->addSeconds($ttl),
        ]);

        $this->mail->sendOtp($user->email, $user->first_name, $code, $ttl);
    }

    private function hashOtp(string $userId, string $code): string
    {
        return hash_hmac('sha256', "{$userId}:{$code}", $this->jwt->secret());
    }

    private function ms(CarbonInterface $t): int
    {
        return (int) $t->format('Uv');
    }
}
