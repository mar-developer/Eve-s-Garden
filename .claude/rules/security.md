# Security Guidelines

## Mandatory Security Checks

Before ANY commit:
- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] XSS prevention (no dangerouslySetInnerHTML with untrusted content)
- [ ] No eval() or dynamic code execution
- [ ] No sensitive data in localStorage
- [ ] Error messages don't leak internal details
- [ ] Dependencies checked for known vulnerabilities

## Secret Management

```typescript
// NEVER: Hardcoded secrets
const apiKey = "sk-proj-xxxxx"

// ALWAYS: Environment variables
const apiKey = process.env.NEXT_PUBLIC_API_KEY

if (!apiKey) {
  throw new Error('NEXT_PUBLIC_API_KEY not configured')
}
```

## Client-Side Security

### XSS Prevention
```typescript
// React auto-escapes by default — safe
<div>{alertDescription}</div>

// NEVER use dangerouslySetInnerHTML with external content
<div dangerouslySetInnerHTML={{ __html: untrustedContent }} /> // BAD
```

### Safe DOM Manipulation
```typescript
// Three.js canvas operations are safe (no HTML injection vector)
// But always clean up event listeners on unmount
```

### Dependency Security
```bash
# Check for known vulnerabilities
npm audit

# Fix automatically where possible
npm audit fix
```

## Security Response Protocol

If security issue found:
1. STOP immediately
2. Use **security-reviewer** agent
3. Fix CRITICAL issues before continuing
4. Rotate any exposed secrets
5. Review entire codebase for similar issues
