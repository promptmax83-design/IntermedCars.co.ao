<?php
declare(strict_types=1);

// Router script for PHP built-in server.
// Routes all requests through index.php which handles API routing.
// Static files are served directly if they exist.

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$ext = pathinfo($uri, PATHINFO_EXTENSION);

// Serve static files directly (CSS, JS, images, etc.)
if ($ext && file_exists(__DIR__ . $uri)) {
    return false;
}

// Route everything else through index.php
require __DIR__ . '/index.php';
