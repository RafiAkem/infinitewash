<?php

namespace Database\Factories;

use App\Models\Member;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Vehicle>
 */
class VehicleFactory extends Factory
{
    protected $model = Vehicle::class;

    public function definition(): array
    {
        return [
            'member_id' => Member::factory(),
            'plate' => strtoupper($this->faker->bothify('D #### ???')),
            'color' => $this->faker->safeColorName(),
        ];
    }
}
