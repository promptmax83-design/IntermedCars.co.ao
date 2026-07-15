# IntermedCars PHP Backend

PHP 8.3 API backend for the IntermedCars platform.

## Requirements

- PHP 8.3+ with extensions: openssl, curl, mbstring, zip, json
- Composer 2.x
- PHPStan (static analysis)
- PHP_CodeSniffer (PSR-12 coding standard)

## Setup

```bash
composer install
```

## Development

### Static Analysis (PHPStan)

```bash
# Run analysis at level 8
php vendor/bin/phpstan analyse

# Run with specific config
php vendor/bin/phpstan analyse -c phpstan.neon
```

### Code Standards (PSR-12)

```bash
# Check coding standards
php vendor/bin/phpcs

# Auto-fix issues
php vendor/bin/phpcbf
```

## Project Structure

```
PHP-Project/
├── src/
│   ├── Controllers/    # API controllers
│   ├── Models/         # Data models
│   └── Services/       # Business logic
├── views/              # PHP templates (Tailwind watch)
├── public/             # Public assets
├── vendor/             # Composer dependencies
├── composer.json       # Dependencies
├── phpstan.neon        # PHPStan config (level 8)
└── phpcs.xml           # PSR-12 coding standard
```

## Code Standards

- **Strict Types**: Every file MUST start with `declare(strict_types=1);`
- **PSR-12**: Follow PSR-12 coding standard
- **PHPStan Level 8**: Maximum static analysis level
- **Typed Properties**: Use PHP 8.3 typed properties
- **Return Types**: Always declare return types
- **Parameterized Queries**: Never use string concatenation for SQL
