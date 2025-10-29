<?php

namespace Database\Factories;

use App\Models\Member;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Member>
 */
class MemberFactory extends Factory
{
    protected $model = Member::class;

    public function definition(): array
    {
        $packages = ['299k', '499k', '669k'];

        return [
            'id' => Str::uuid()->toString(),
            'member_code' => 'M' . $this->faker->unique()->numerify('####'),
            'name' => $this->faker->name(),
            'phone' => '08' . $this->faker->numerify('#########'),
            'address' => $this->faker->address(),
            'card_uid' => $this->faker->unique()->numerify('#########'),
            'package' => $this->faker->randomElement($packages),
            'status' => $this->faker->randomElement(['active', 'inactive', 'expired']),
        ];
    }

    public function active(): self
    {
        return $this->state(fn () => ['status' => 'active']);
    }
}
