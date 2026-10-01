<?php

namespace App\Services;

use App\Enums\Role;
use App\Enums\UserStatus;
use App\Exceptions\ApiException;
use App\Models\User;
use App\Support\ApiResponse;
use App\Support\ResponseCode as C;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class AdminService
{
    private const SORT_COLUMNS = [
        'firstName' => 'first_name', 'lastName' => 'last_name', 'email' => 'email',
        'createdAt' => 'created_at', 'updatedAt' => 'updated_at', 'status' => 'status',
    ];

    public function __construct(private readonly MailService $mail)
    {
    }

    public function listUsers(array $q): JsonResponse
    {
        $query = User::query();
        $q['status'] ? $query->where('status', $q['status']) : $query->where('status', '!=', UserStatus::Deleted->value);
        if ($q['role']) {
            $query->where('role', $q['role']);
        }
        if ($q['createdFrom']) {
            $query->where('created_at', '>=', $q['createdFrom']);
        }
        if ($q['createdTo']) {
            $query->where('created_at', '<=', $q['createdTo']);
        }
        if ($q['search']) {
            $like = '%'.addcslashes($q['search'], '\\%_').'%';
            $query->where(fn ($w) => $w->where('first_name', 'like', $like)
                ->orWhere('last_name', 'like', $like)->orWhere('email', 'like', $like));
        }

        $total = (clone $query)->count();
        $users = $query->orderBy(self::SORT_COLUMNS[$q['sortBy']], $q['sortOrder'])
            ->skip(($q['page'] - 1) * $q['pageSize'])->take($q['pageSize'])->get();

        return ApiResponse::ok(C::USER_LIST_SUCCESS, $users->map->toPublic()->all(), [
            'page' => $q['page'],
            'pageSize' => $q['pageSize'],
            'total' => $total,
            'totalPages' => max(1, (int) ceil($total / $q['pageSize'])),
        ]);
    }

    public function updateStatus(string $id, UserStatus $next): JsonResponse
    {
        $user = User::find($id);
        if (! $user) {
            throw new ApiException(C::USER_NOT_FOUND, 404);
        }
        if ($user->role === Role::Admin) {
            throw new ApiException(C::USER_STATUS_PROTECTED, 403);
        }
        if (! $user->status->canMoveTo($next)) {
            throw new ApiException(C::USER_STATUS_TRANSITION_INVALID, 409);
        }

        $previous = $user->status;
        $user->update(['status' => $next]);
        Log::info('User status changed', ['userId' => $user->id, 'from' => $previous->value, 'to' => $next->value]);

        if ($previous === UserStatus::AdminPending && $next === UserStatus::Activated) {
            $this->mail->sendAccountApproved($user->email, $user->first_name);
        }

        return ApiResponse::ok(C::USER_STATUS_UPDATE_SUCCESS, $user->toPublic());
    }

    public function stats(): JsonResponse
    {
        $since7 = now()->subDays(7);
        $since30 = now()->subDays(30);
        $notDeleted = fn () => User::where('status', '!=', UserStatus::Deleted->value);

        $byStatus = [];
        foreach (UserStatus::cases() as $s) {
            $byStatus[$s->value] = 0;
        }
        foreach (User::selectRaw('status, COUNT(*) as c')->groupBy('status')->get() as $row) {
            $byStatus[$row->status->value] = (int) $row->c;
        }

        $perDay = [];
        for ($i = 6; $i >= 0; $i--) {
            $perDay[now()->utc()->subDays($i)->format('Y-m-d')] = 0;
        }
        foreach (User::where('created_at', '>=', $since7)->get(['created_at']) as $row) {
            $k = $row->created_at->clone()->utc()->format('Y-m-d');
            if (isset($perDay[$k])) {
                $perDay[$k]++;
            }
        }

        return ApiResponse::ok(C::ADMIN_STATS_SUCCESS, [
            'totalUsers' => $notDeleted()->count(),
            'byStatus' => $byStatus,
            'registeredLast7Days' => $notDeleted()->where('created_at', '>=', $since7)->count(),
            'registeredLast30Days' => $notDeleted()->where('created_at', '>=', $since30)->count(),
            'registrationsPerDay' => array_map(fn ($d, $c) => ['date' => $d, 'count' => $c], array_keys($perDay), array_values($perDay)),
            'recentUsers' => $notDeleted()->orderByDesc('created_at')->limit(5)->get()->map->toPublic()->all(),
        ]);
    }
}
