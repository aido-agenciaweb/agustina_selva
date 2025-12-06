<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\TimeSlot;
use Carbon\Carbon;

$count = TimeSlot::count();
echo "Total Slots in DB: " . $count . "\n";

$today = Carbon::today();
$start = $today->copy()->subDays(5);
$end = $today->copy()->addDays(5);

$slots = TimeSlot::whereBetween('date', [$start, $end])->get();
echo "Slots between " . $start->toDateString() . " and " . $end->toDateString() . ": " . $slots->count() . "\n";

if ($slots->count() > 0) {
    echo "Sample Slot Date (Raw): " . $slots->first()->date . "\n";
    echo "Sample Slot JSON: " . $slots->first()->toJson() . "\n";
}
