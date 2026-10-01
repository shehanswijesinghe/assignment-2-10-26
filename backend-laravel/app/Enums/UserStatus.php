<?php

namespace App\Enums;

enum UserStatus: string
{
    case EmailApprovalPending = 'email_approval_pending';
    case EmailApproved = 'email_approved';
    case AdminPending = 'admin_pending';
    case Activated = 'activated';
    case Deactivated = 'deactivated';
    case Deleted = 'deleted';

    /**
     * @return list<self>
     */
    public function transitions(): array
    {
        return match ($this) {
            self::EmailApprovalPending, self::EmailApproved => [self::Deleted],
            self::AdminPending => [self::Activated, self::Deactivated, self::Deleted],
            self::Activated => [self::Deactivated, self::Deleted],
            self::Deactivated => [self::Activated, self::Deleted],
            self::Deleted => [],
        };
    }

    public function canMoveTo(self $next): bool
    {
        return in_array($next, $this->transitions(), true);
    }
}
