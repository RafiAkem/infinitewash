<?php

namespace Database\Factories;

use App\Models\ApprovalAction;
use App\Models\CardRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ApprovalAction>
 */
class ApprovalActionFactory extends Factory
{
    protected $model = ApprovalAction::class;

    public function definition(): array
    {
        return [
            'card_request_id' => CardRequest::factory(),
            'user_id' => User::factory(),
            'action' => $this->faker->randomElement(['approve', 'reject']),
            'note' => $this->faker->sentence(),
            'acted_at' => $this->faker->dateTimeBetween('-7 days', 'now'),
        ];
    }
}
