<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\TimeSlot;
use App\Models\Appointment;
use Carbon\Carbon;

try {
    echo "Testing TimeSlot Accessor...\n";
    
    // Create a dummy slot and appointment if needed, or use existing
    $slot = TimeSlot::first();
    if (!$slot) {
        echo "No slots found. Creating one.\n";
        $slot = TimeSlot::create([
            'date' => Carbon::today(),
            'time' => '10:00',
            'is_available' => true,
            'max_appointments' => 1
        ]);
    }

    echo "Slot ID: " . $slot->id . "\n";
    echo "Date: " . $slot->date . "\n";
    echo "Time: " . $slot->time . "\n";

    // Test accessor
    $appointments = $slot->appointments_list;
    echo "Appointments List Count: " . $appointments->count() . "\n";

    echo "Testing Controller Logic...\n";
    $startDate = Carbon::today()->subDays(7);
    $endDate = Carbon::today()->addDays(30);

    $slots = TimeSlot::whereBetween('date', [$startDate, $endDate])
        ->orderBy('date')
        ->orderBy('time')
        ->get()
        ->append(['bookedCount', 'appointments_list']);

    echo "Fetched " . $slots->count() . " slots with appends.\n";
    
    // Check JSON serialization
    $json = $slots->toJson();
    echo "JSON Serialization OK. Length: " . strlen($json) . "\n";

} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
