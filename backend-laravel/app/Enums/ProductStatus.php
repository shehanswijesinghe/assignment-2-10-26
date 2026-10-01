<?php

namespace App\Enums;

enum ProductStatus: string
{
    case Draft = 'draft';
    case Active = 'active';
    case Deactivated = 'deactivated';
    case Deleted = 'deleted';

    /**
     * @return list<self>
     */
    public function transitions(): array
    {
        return match ($this) {
            self::Draft => [self::Active, self::Deleted],
            self::Active => [self::Deactivated, self::Draft, self::Deleted],
            self::Deactivated => [self::Active, self::Draft, self::Deleted],
            self::Deleted => [],
        };
    }

    public function canMoveTo(self $next): bool
    {
        return in_array($next, $this->transitions(), true);
    }
}
