<?php

declare(strict_types=1);

/**
 * Manual PSR-4 Autoloader for IntermedCars
 *
 * No Composer required. Maps IntermedCars\ namespace to src/ directory.
 */

spl_autoload_register(static function (string $class): void {
    $prefix = 'IntermedCars\\';
    $baseDir = dirname(__DIR__) . '/src/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relativeClass = substr($class, $len);
    $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';

    if (file_exists($file)) {
        require $file;
    }
});
