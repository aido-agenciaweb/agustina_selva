<?php
use App\Models\Service;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$services = Service::all();
echo "Total Services: " . $services->count() . "\n";
foreach ($services as $s) {
    echo "- {$s->name} ({$s->price})\n";
}
