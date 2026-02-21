---
name: review-pr
description: Review a pull request for code quality, security, and best practices. Use when reviewing PRs or when asked to check changes before merging.
disable-model-invocation: true
argument-hint: "[pr-number or branch]"
context: fork
agent: Explore
allowed-tools: Bash(gh *), Bash(git *), Read, Grep, Glob
---

Review the pull request specified by $ARGUMENTS.

## Steps

1. Get the PR diff and details:
   ```
   gh pr diff $ARGUMENTS
   gh pr view $ARGUMENTS
   ```

2. Identify all changed files and understand the scope of changes

3. Review each file for:
   - **Correctness**: Logic errors, edge cases, off-by-one errors
   - **Security**: SQL injection, XSS, exposed secrets, missing input validation
   - **Performance**: N+1 queries, unnecessary loops, missing indexes
   - **Code style**: Consistent with project conventions
   - **Error handling**: Proper try/catch, meaningful error messages
   - **Testing**: Are new/changed features covered by tests?

4. For this project specifically check:
   - **Backend (Express/Node.js)**: Proper middleware usage, Keycloak auth checks, Zod validation
   - **Aggregator (FastAPI/Python)**: Async patterns, proper error responses, SQLAlchemy usage
   - **Frontend (Vue 3)**: Reactivity patterns, component composition, TypeScript types
   - **Docker**: Dockerfile best practices, compose configuration

5. Provide feedback organized by severity:
   - **Critical** (must fix before merge)
   - **Warning** (should fix)
   - **Suggestion** (nice to have)

Include specific line references and code examples for fixes.
