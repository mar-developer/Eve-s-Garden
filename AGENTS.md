# AGENTS.md

This file contains guidelines and commands for agentic coding agents working in this TrackMeNot repository.

## Project Overview

This is a Next.js 16 habit tracking application with:
- Frontend: React 19 + TypeScript + Tailwind CSS
- Backend: Supabase (PostgreSQL + Auth + Realtime)
- Mobile: Capacitor (iOS/Android)
- State: React hooks + Supabase client
- Styling: Tailwind CSS with custom design system

## Development Commands

### Core Commands (run from `habit-tracker/` directory)
```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Type checking (add this to package.json if missing)
npx tsc --noEmit
```

### Testing
No test framework is currently configured. Based on skills analysis, consider adding:
```bash
# For unit testing (Vitest recommended for React/Next.js)
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom

# For E2E testing (Playwright recommended)
npm install --save-dev playwright

# Run single test
npm test <test-file>
npm test -- <test-file>  # For Vitest
npx playwright test <test-file>  # For E2E
```

## Code Style Guidelines

### Import Organization
```typescript
// 1. React and Next.js imports
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { clsx } from 'clsx';
import { z } from 'zod';

// 3. Internal imports (use @/* path alias)
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { User, Habit } from '@/lib/types';
```

### TypeScript Patterns
- Use strict mode (already enabled in tsconfig.json)
- Prefer interfaces over types for object shapes
- Use proper generic typing: `useState<User | null>(null)`
- Export types from dedicated `lib/types.ts` file
- Use Zod for runtime validation and type inference

### Component Patterns
```typescript
// Use forwardRef for UI components
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    // Component logic
  }
);

// Always add displayName
Button.displayName = 'Button';

// Use proper prop interfaces
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
}
```

### Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile`, `HabitCard`)
- **Files**: kebab-case for components (`user-profile.tsx`), camelCase for utilities (`formatDate.ts`)
- **Variables**: camelCase (`userName`, `habitList`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_HABITS`, `DEFAULT_TIMEOUT`)
- **Interfaces**: PascalCase with descriptive names (`HabitCompletion`, `UserSettings`)

### Error Handling
```typescript
// Use try-catch for async operations
try {
  const { data, error } = await supabase
    .from('habits')
    .select('*');
    
  if (error) throw error;
  return data;
} catch (error) {
  console.error('Failed to fetch habits:', error);
  return null;
}

// Use proper error types
interface ApiError {
  message: string;
  code?: string;
  details?: any;
}
```

### Styling Patterns
```typescript
// Use cn() utility for conditional classes
className={cn(
  'base-styles',
  isActive && 'active-styles',
  variant === 'primary' && 'primary-styles',
  className
)}

// Follow Tailwind CSS conventions
// - Use semantic color tokens: bg-primary, text-secondary-foreground
// - Use responsive prefixes: sm:text-sm md:text-base
// - Use state variants: hover:bg-primary/90, focus-visible:ring-2
```

### Frontend Design Rules (from frontend-specialist agent)
- **NO PURPLE COLORS**: Never use purple, violet, indigo or magenta as primary unless explicitly requested
- **NO STANDARD LAYOUTS**: Avoid "Left Text / Right Image" hero splits, Bento grids, mesh gradients
- **MANDATORY ANIMATIONS**: All sections need scroll-triggered entrance animations, micro-interactions on hover
- **EXTREME GEOMETRY**: Use either 0-2px (sharp/tech) or 16-32px (friendly) border-radius, avoid 4-8px middle ground
- **VISUAL DEPTH**: Use overlapping elements, grain textures, avoid flat designs

### Database Patterns
```typescript
// Use Supabase client properly
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

// Always handle errors
const { data, error } = await supabase
  .from('habits')
  .select('*')
  .eq('user_id', userId);

if (error) {
  // Handle error
  return;
}

// Use proper types for database responses
interface HabitRow extends Habit {
  // Additional fields from joins
}
```

### File Structure
```
habit-tracker/
├── app/                    # Next.js app router pages
├── components/
│   ├── ui/                # Reusable UI components
│   └── features/          # Feature-specific components
├── lib/
│   ├── hooks/             # Custom React hooks
│   ├── supabase/          # Database client configs
│   ├── calculations/      # Business logic calculations
│   ├── cache/            # Caching utilities
│   ├── rate-limit/       # Rate limiting
│   └── utils.ts          # General utilities
└── types.ts              # Global type definitions
```

### Performance Guidelines
- Use React.memo for expensive components
- Implement proper loading states
- Use debounce/throttle for search inputs (available in utils)
- Implement pagination for large data sets
- Use Supabase realtime for live updates when appropriate

### Security Practices
- Never expose secrets on client side
- Use Supabase RLS policies for data access
- Validate all inputs with Zod schemas
- Implement rate limiting for API routes
- Use proper authentication checks

## Common Patterns

### Custom Hooks
```typescript
// Example: useAuth hook
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Auth logic
  }, []);
  
  return { user, loading };
}
```

### Form Handling
```typescript
// Use react-hook-form with Zod validation
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm<CreateHabitSchema>({
  resolver: zodResolver(createHabitSchema),
  defaultValues: {
    name: '',
    frequency: 'daily',
  },
});
```

## Agent Skills Integration

This repository includes specialized agent skills in `.agent/agents/` and `.agent/skills/`:

### Available Agents
- **test-engineer**: TDD, test automation, coverage strategies
- **frontend-specialist**: React/Next.js architecture, performance, accessibility
- **backend-specialist**: API design, security, database patterns
- **mobile-developer**: React Native/Flutter, touch-first design, performance

### When to Use Each Agent
- **test-engineer**: Writing tests, TDD implementation, debugging test failures
- **frontend-specialist**: UI components, styling, state management, responsive design
- **backend-specialist**: API endpoints, authentication, database integration
- **mobile-developer**: Cross-platform mobile apps, native features, mobile optimization

### Agent-Specific Guidelines
Each agent follows strict patterns from their skill files:
- **Frontend**: No purple colors, avoid standard layouts, mandatory animations
- **Backend**: Security-first, validate all inputs, layered architecture
- **Mobile**: 44-48px touch targets, platform conventions, performance obsessed
- **Testing**: AAA pattern, coverage targets, systematic testing pyramid

### Core Skills (All Agents Must Follow)
- **clean-code**: Concise, direct, solution-focused code with self-documentation
- **react-patterns**: Modern React patterns, hooks, composition, performance
- **nextjs-best-practices**: Server vs client components, data fetching, routing
- **lint-and-validate**: Type checking, linting, validation scripts

### Skill-Based Rules
From `.agent/skills/` directory:
- **clean-code**: SRP, DRY, KISS principles, naming conventions, function rules
- **react-patterns**: Component design, hook patterns, state management, performance
- **nextjs-best-practices**: Server components, data fetching, routing, caching
- **testing-patterns**: AAA pattern, testing pyramid, coverage strategies
- **frontend-design**: No purple colors, anti-cliché design, mandatory animations
- **mobile-design**: Touch targets, platform conventions, performance optimization

### Verification Scripts
Each skill includes validation scripts in `.agent/skills/<skill>/scripts/`:
- `lint_runner.py`: Code style and type checking
- `test_runner.py`: Test execution and coverage
- `ux_audit.py`: UI/UX quality checks
- `security_scan.py`: Security vulnerability scanning
- `mobile_audit.py`: Mobile-specific validation

### Mandatory Protocol
1. **Read First**: Always read relevant agent and skill files before coding
2. **Apply Principles**: Use patterns from skills, not just copy code
3. **Run Scripts**: Execute verification scripts after completing work
4. **Document Changes**: Update relevant documentation files

### Global Rules (from GEMINI.md)
- **Socratic Gate**: Ask clarifying questions before complex implementations
- **File Dependencies**: Check and update all affected files together
- **Performance Mandate**: Profile before optimizing, measure first
- **Testing Mandate**: Write tests following AAA pattern and testing pyramid
- **Infrastructure Safety**: Verify deployability and operational safety

## Linting and Type Checking

Always run these commands before committing:
```bash
npm run lint          # Check code style
npx tsc --noEmit     # Type checking
```

The project uses ESLint with Next.js configuration and TypeScript strict mode enabled.