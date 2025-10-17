<?php

namespace Database\Factories;

use App\Models\Member;
use App\Models\Vehicle;
use App\Models\Visit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Visit>
 */
class VisitFactory extends Factory
{
    protected $model = Visit::class;

    public function definition(): array
    {
        $member = Member::factory();

        return [
            'member_id' => $member,
            'vehicle_id' => Vehicle::factory()->for($member, 'member'),
            'visit_date' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'visit_time' => $this->faker->time('H:i:s'),
            'status' => $this->faker->randomElement(['allowed', 'blocked']),
        ];
    }
}
