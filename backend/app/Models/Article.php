<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'content',
        'author',
        'source_url',
        'published_date',
        'excerpt',
        'featured_image',
        'enhanced_content',
        'reference_1_url',
        'reference_1_title',
        'reference_2_url',
        'reference_2_title',
        'is_enhanced',
        'enhanced_at',
    ];

    protected $casts = [
        'published_date' => 'date',
        'is_enhanced' => 'boolean',
        'enhanced_at' => 'datetime',
    ];
}
