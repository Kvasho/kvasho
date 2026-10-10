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
        Schema::create('geo_games', function (Blueprint $table) {
            $table->id();
            $table->uuid('token')->unique();
            $table->string('status', 20)->default('in_progress');
            $table->unsignedTinyInteger('current_round')->default(1);
            $table->unsignedInteger('total_score')->default(0);
            $table->unsignedInteger('total_distance_km')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('geo_games');
    }
};
