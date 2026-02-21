# Testing Requirements

## Minimum Test Coverage: 80%

Test Types (ALL required):
1. **Unit Tests** - Individual functions, utilities, data transformations
2. **Component Tests** - React components with Testing Library
3. **E2E Tests** - Critical user flows (Playwright)

## Recommended Test Stack

- **Runner**: Vitest
- **Component Testing**: React Testing Library + @testing-library/user-event
- **E2E**: Playwright
- **Coverage**: Istanbul via Vitest

Note: No test setup exists yet. Install when ready to add tests.

## Test-Driven Development

MANDATORY workflow:
1. Write test first (RED)
2. Run test - it should FAIL
3. Write minimal implementation (GREEN)
4. Run test - it should PASS
5. Refactor (IMPROVE)
6. Verify coverage (80%+)

## Troubleshooting Test Failures

1. Use **senior-tdd-engineer** agent
2. Check test isolation
3. Verify mocks are correct (especially Three.js WebGL mocks)
4. Fix implementation, not tests (unless tests are wrong)

## Agent Support

- **senior-tdd-engineer** - Use PROACTIVELY for new features, enforces write-tests-first
- **senior-e2e-tester** - Playwright E2E testing specialist
