<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PublicHoliday extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'holiday_date',
    ];

    protected $casts = [
        'holiday_date' => 'date',
    ];
}
