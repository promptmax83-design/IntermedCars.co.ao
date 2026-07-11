<?php

declare(strict_types=1);

namespace IntermedCars\Http;

/**
 * Simple HTTP Router
 *
 * PHP 8.3 native, no frameworks.
 * Maps HTTP method + URI path to controller actions.
 */
class Router
{
    /** @var array<string, \Closure> */
    private array $routes = [];

    /** @var \Closure|null */
    private ?\Closure $notFoundHandler = null;

    /**
     * Register a GET route.
     *
     * @param string $path URI path (e.g., '/api/users')
     * @param \Closure $handler
     */
    public function get(string $path, \Closure $handler): self
    {
        $this->routes['GET ' . $path] = $handler;
        return $this;
    }

    /**
     * Register a POST route.
     */
    public function post(string $path, \Closure $handler): self
    {
        $this->routes['POST ' . $path] = $handler;
        return $this;
    }

    /**
     * Register a PUT route.
     */
    public function put(string $path, \Closure $handler): self
    {
        $this->routes['PUT ' . $path] = $handler;
        return $this;
    }

    /**
     * Register a DELETE route.
     */
    public function delete(string $path, \Closure $handler): self
    {
        $this->routes['DELETE ' . $path] = $handler;
        return $this;
    }

    /**
     * Set 404 handler.
     */
    public function notFound(\Closure $handler): self
    {
        $this->notFoundHandler = $handler;
        return $this;
    }

    /**
     * Dispatch the current request.
     */
    public function dispatch(): void
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);

        if ($uri === false || $uri === null) {
            $uri = '/';
        }

        // Remove trailing slash (except root)
        if ($uri !== '/' && strlen($uri) > 1 && $uri[-1] === '/') {
            $uri = rtrim($uri, '/');
        }

        // Check for exact match
        $routeKey = $method . ' ' . $uri;
        if (isset($this->routes[$routeKey])) {
            ($this->routes[$routeKey])();
            return;
        }

        // Check for parameterized routes (e.g., /api/users/{id})
        foreach ($this->routes as $key => $handler) {
            $pattern = $this->buildPattern($key);
            if (preg_match($pattern, $uri, $matches)) {
                // Set matched parameters as request attributes
                $params = array_filter(
                    $matches,
                    static fn ($key): bool => is_string($key),
                    ARRAY_FILTER_USE_KEY
                );
                $_SERVER['ROUTE_PARAMS'] = $params;
                $handler();
                return;
            }
        }

        // Not found
        if ($this->notFoundHandler !== null) {
            ($this->notFoundHandler)();
        } else {
            http_response_code(404);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['error' => 'Not Found'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
        }
    }

    /**
     * Convert route pattern with {param} to regex.
     *
     * @param string $routeKey e.g., 'GET /api/users/{id}'
     * @return string regex pattern
     */
    private function buildPattern(string $routeKey): string
    {
        // Extract path from 'METHOD /path'
        $spacePos = strpos($routeKey, ' ');
        $path = $spacePos !== false ? substr($routeKey, $spacePos + 1) : $routeKey;

        // Convert {param} to named capture groups
        $pattern = preg_replace('/\{(\w+)\}/', '(?P<$1>[^/]+)', $path);

        return '#^' . ($pattern ?: $routeKey) . '/?$#';
    }
}
