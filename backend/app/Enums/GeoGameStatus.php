<?php

namespace App\Enums;

enum GeoGameStatus: string
{
    case InProgress = 'in_progress';
    case Won = 'won';
    case Lost = 'lost';
}
