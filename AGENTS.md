# IntermedCars Development Guidelines

## Project Structure

```
New OpenCode Project/
├── opencode.jsonc          # OpenCode configuration
├── AGENTS.md               # This file
├── .opencode/              # Agent definitions
│   └── agent/
│       ├── architecture.md # Architect (designs, never codes)
│       ├── build.md        # Builder (writes code, SQL)
│       └── security.md     # Security auditor (validates)
├── site-institucional/     # Next.js Frontend
│   ├── src/app/            # Pages and components
│   ├── package.json        # npm dependencies
│   └── ...                 # Next.js config files
└── PHP-Project/            # PHP Backend API
    ├── src/                # PHP source files
    ├── vendor/             # Composer dependencies
    └── composer.json       # PHP dependencies
```

## Agent Ecosystem

| Agente | Modelo | Missão |
|--------|--------|--------|
| `@architecture` | anthropic/claude-3-5-sonnet | Engenheiro chefe — desenha estrutura, nunca toca no código |
| `@build` | google/gemini-1.5-pro | Operário de alta velocidade — classes e queries SQL puras |
| `@security` | meta-llama/llama-3-405b-instruct | Auditor de segurança — valida inputs, previne invasões |

## Development Workflow

1. **@architecture** desenha a estrutura e define interfaces
2. **@build** implementa classes e queries SQL按照 a especificação
3. **@security** audita vulnerabilidades (zero bugs, zero invasões)
4. Run `npm run analyze` for full validation
5. Commit and push to GitHub

## Code Standards

### TypeScript/React (Frontend)
- Functional components with hooks
- Tailwind CSS utility classes only (no inline styles)
- Next.js App Router patterns
- TypeScript strict mode

### PHP 8.3 (Backend)
- `declare(strict_types=1);` at top of every file
- PSR-12 coding standard
- PHPStan level 8 analysis
- Parameterized database queries

## Design System

### Colors
- Primary (Grafite): #0d0d0d
- Secondary: #1a1a2e
- Accent (Ambar): #c9a84c
- Success (Esmeralda): #10b981
- Background: #f0f2f5
- Light: #f5f5f5

### Commands
```bash
# Frontend
npm run dev              # Development server
npm run build            # Production build
npm run lint             # Check for errors
npm run lint:fix         # Fix errors
npm run format           # Format code
npm run typecheck        # Check TypeScript
npm run analyze          # Full validation
npm run tailwind:watch   # Watch Tailwind para PHP views
npm run tailwind:build   # Build Tailwind para PHP views

# Backend (from PHP-Project/)
php vendor/bin/phpstan analyse     # Static analysis
php vendor/bin/phpcs               # Code standards
php vendor/bin/phpcbf              # Auto-fix standards
```
