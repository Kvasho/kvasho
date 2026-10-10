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
        Schema::create('geo_game_rounds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('geo_game_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('round_number');
            $table->foreignId('country_id')->constrained();
            $table->decimal('guess_lat', 9, 6)->nullable();
            $table->decimal('guess_lng', 9, 6)->nullable();
            $table->unsignedInteger('distance_km')->nullable();
            $table->unsignedSmallInteger('score')->nullable();
            $table->timestamp('answered_at')->nullable();
            $table->timestamps();

            $table->unique(['geo_game_id', 'round_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('geo_game_rounds');
    }
};
