<?php

namespace Database\Factories;

use App\Models\CardRequest;
use App\Models\Member;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CardRequest>
 */
class CardRequestFactory extends Factory
{
    protected $model = CardRequest::class;

    public function definition(): array
    {
        $status = $this->faker->randomElement(['pending', 'approved', 'rejected']);
        $decidedAt = $status === 'pending' ? null : $this->faker->dateTimeBetween('-7 days', 'now');
        $decidedBy = $status === 'pending' ? null : 1;

        return [
            'member_id' => Member::factory(),
            'old_uid' => strtoupper($this->faker->bothify('UID-######')),
            'new_uid' => strtoupper($this->faker->unique()->bothify('UID-######')),
            'reason' => $this->faker->randomElement(['hilang', 'rusak', 'dicuri', 'lainnya']),
            'reason_note' => $this->faker->sentence(),
            'proof_path' => null,
            'request_status' => $status,
            'requested_at' => $this->faker->dateTimeBetween('-10 days', 'now'),
            'decided_at' => $decidedAt,
            'decided_by' => $decidedBy,
        ];
    }
}
