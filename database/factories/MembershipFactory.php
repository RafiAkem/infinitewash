<?php

namespace Database\Factories;

use App\Models\Member;
use App\Models\Membership;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Membership>
 */
class MembershipFactory extends Factory
{
    protected $model = Membership::class;

    public function definition(): array
    {
        $start = $this->faker->dateTimeBetween('-6 months', 'now');
        $end = (clone $start)->modify('+1 year');

        return [
            'member_id' => Member::factory(),
            'valid_from' => $start,
            'valid_to' => $end,
            'status' => 'active',
        ];
    }
}
