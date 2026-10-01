<?php

namespace App\Support;

use Carbon\CarbonInterface;

final class Dates
{
    public static function iso(CarbonInterface $date): string
    {
        return $date->clone()->utc()->format('Y-m-d\TH:i:s.v\Z');
    }
}
