---
name: db-migrate
description: Manage database migrations. Create, run, or check migration status for PostgreSQL.
disable-model-invocation: true
argument-hint: "[action: create|run|status] [name?]"
---

Manage database migrations: $ARGUMENTS

## Steps

1. First, check the `db/` directory for existing migration patterns and tooling
2. Understand the current migration approach used in this project
3. Execute the requested action:
   - **create [name]**: Create a new migration file following existing naming conventions
   - **run**: Apply pending migrations
   - **status**: Show which migrations have been applied

## Guidelines
- Follow the existing migration naming convention found in `db/`
- Always create both up and down migrations when possible
- Test migrations against the development database first
- Back up data before running destructive migrations
