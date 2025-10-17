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
        Schema::create('members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('member_code')->unique();
            $table->string('name');
            $table->string('phone', 25)->nullable();
            $table->string('address')->nullable();
            $table->string('card_uid')->unique();
            $table->enum('package', ['299k', '499k', '669k']);
            $table->enum('status', ['active', 'inactive', 'expired'])->default('active');
            $table->timestamps();

            $table->index(['status', 'package']);
        });

        Schema::create('vehicles', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('member_id');
            $table->string('plate', 32);
            $table->string('color', 32)->nullable();
            $table->timestamps();

            $table->foreign('member_id')->references('id')->on('members')->cascadeOnDelete();
            $table->unique(['member_id', 'plate']);
        });

        Schema::create('memberships', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('member_id');
            $table->date('valid_from');
            $table->date('valid_to');
            $table->enum('status', ['active', 'expired', 'grace'])->default('active');
            $table->timestamps();

            $table->foreign('member_id')->references('id')->on('members')->cascadeOnDelete();
            $table->index(['member_id', 'status']);
            $table->index('valid_from');
            $table->index('valid_to');
        });

        Schema::create('visits', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('member_id');
            $table->foreignId('vehicle_id')->nullable()->constrained('vehicles')->nullOnDelete();
            $table->date('visit_date');
            $table->time('visit_time');
            $table->enum('status', ['allowed', 'blocked'])->default('allowed');
            $table->timestamps();

            $table->foreign('member_id')->references('id')->on('members')->cascadeOnDelete();
            $table->index('visit_date');
            $table->index(['member_id', 'status']);
        });

        Schema::create('card_requests', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('member_id');
            $table->string('old_uid')->nullable();
            $table->string('new_uid')->unique();
            $table->enum('reason', ['hilang', 'rusak', 'dicuri', 'lainnya']);
            $table->text('reason_note')->nullable();
            $table->string('proof_path')->nullable();
            $table->enum('request_status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamp('requested_at')->useCurrent();
            $table->timestamp('decided_at')->nullable();
            $table->foreignId('decided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->foreign('member_id')->references('id')->on('members')->cascadeOnDelete();
            $table->index(['member_id', 'request_status']);
        });

        Schema::create('approval_actions', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('card_request_id')->constrained('card_requests')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('action', ['approve', 'reject']);
            $table->text('note')->nullable();
            $table->timestamp('acted_at')->useCurrent();
            $table->timestamps();

            $table->index('acted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('approval_actions');
        Schema::dropIfExists('card_requests');
        Schema::dropIfExists('visits');
        Schema::dropIfExists('memberships');
        Schema::dropIfExists('vehicles');
        Schema::dropIfExists('members');
    }
};
