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
        Schema::create('countries', function (Blueprint $table) {
            $table->id();
            $table->string('code', 2)->unique();      // მაგ. GE
            $table->string('name');
            $table->string('capital')->nullable();
            $table->string('region')->nullable();     // Europe, Asia...
            $table->decimal('lat', 9, 6);             // ქვეყნის ცენტრი
            $table->decimal('lng', 9, 6);
            $table->decimal('capital_lat', 9, 6)->nullable();
            $table->decimal('capital_lng', 9, 6)->nullable();
            $table->unsignedBigInteger('population')->default(0);
            $table->string('flag_url')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('countries');
    }
};
