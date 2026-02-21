---
name: run-tests
description: Run tests for the project. Supports running all tests or tests for a specific component (backend, aggregator, web-dashboard).
disable-model-invocation: true
argument-hint: "[component: backend|aggregator|dashboard|all]"
context: fork
allowed-tools: Bash, Read
---

Run tests for the specified component: $ARGUMENTS

## Test commands by component

### Aggregator (Python/FastAPI)
```bash
cd aggregator && python -m pytest tests/ -v
```

### Backend (Node.js/Express)
Check package.json for test script:
```bash
cd backend && npm test
```

### Web Dashboard (Vue 3/Vite)
Check package.json for test script:
```bash
cd web-dashboard && npm test
```

### All
Run tests for all components sequentially.

## Instructions
1. Run the appropriate test command(s)
2. If tests fail, analyze the failures and report:
   - Which tests failed
   - The error messages
   - Likely root cause
   - Suggested fixes
3. If all tests pass, report the summary
