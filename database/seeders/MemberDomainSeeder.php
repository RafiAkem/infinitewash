<?php

namespace Database\Seeders;

use App\Models\ApprovalAction;
use App\Models\CardRequest;
use App\Models\Member;
use App\Models\Membership;
use App\Models\Vehicle;
use App\Models\Visit;
use Illuminate\Database\Seeder;

class MemberDomainSeeder extends Seeder
{
    public function run(): void
    {
        Member::factory()
            ->count(15)
            ->has(Vehicle::factory()->count(rand(1, 3)))
            ->has(Membership::factory()->count(2))
            ->has(Visit::factory()->count(5))
            ->has(
                CardRequest::factory()
                    ->count(2)
                    ->has(ApprovalAction::factory()->count(1))
            )
            ->create();
    }
}
