---
name: fix-issue
description: Fix a GitHub issue by reading it, understanding requirements, implementing the fix, and writing tests.
disable-model-invocation: true
argument-hint: "[issue-number]"
---

Fix GitHub issue $ARGUMENTS following the project's coding standards.

## Steps

1. Read the issue:
   ```
   gh issue view $ARGUMENTS
   ```

2. Understand the requirements and acceptance criteria

3. Explore the relevant codebase to understand existing patterns

4. Implement the fix:
   - Follow existing code patterns and conventions
   - Keep changes minimal and focused
   - Add proper error handling
   - Use TypeScript types (backend/frontend) or Python type hints (aggregator)

5. Write or update tests as needed

6. Create a commit with a descriptive message referencing the issue

## Project structure
- `backend/` — Express.js + TypeScript (Node.js API)
- `aggregator/` — FastAPI + Python (data processing)
- `web-dashboard/` — Vue 3 + TypeScript + Vite (main frontend)
- `admin-console/` — Admin interface
- `db/` — Database migrations and schemas
- `docker-compose*.yml` — Container orchestration
