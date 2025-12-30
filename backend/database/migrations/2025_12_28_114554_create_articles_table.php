<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->longText('content');
            $table->string('author')->nullable();
            $table->string('source_url')->nullable();
            $table->date('published_date')->nullable();
            $table->string('excerpt', 500)->nullable();
            $table->string('featured_image')->nullable();
            $table->longText('enhanced_content')->nullable();
            $table->string('reference_1_url')->nullable();
            $table->string('reference_1_title')->nullable();
            $table->string('reference_2_url')->nullable();
            $table->string('reference_2_title')->nullable();
            $table->boolean('is_enhanced')->default(false);
            $table->timestamp('enhanced_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
