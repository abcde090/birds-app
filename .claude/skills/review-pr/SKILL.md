---
name: review-pr
description: Review a pull request for code quality, type safety, and adherence to project standards
disable-model-invocation: true
allowed-tools: Read Grep Glob Bash(git diff*) Bash(git log*)
argument-hint: "[branch-or-pr-number]"
---

# PR Review

Review the changes in: `$ARGUMENTS`

## Review Checklist

- [ ] TypeScript strict mode (no `any` types)
- [ ] Functional components with hooks only
- [ ] Components under 200 lines
- [ ] Tailwind utility classes only (no inline styles)
- [ ] Zustand stores for global state (no prop drilling)
- [ ] Images have alt text and lazy loading
- [ ] Mobile-first responsive design
- [ ] useMemo/useCallback for expensive operations
- [ ] Tests added for new functionality
- [ ] All existing tests still pass

## Process

1. Get the diff: `git diff main...$ARGUMENTS`
2. Review each changed file against the checklist
3. Check for common issues (console.log left in, commented-out code, etc.)
4. Summarize findings by severity (CRITICAL > HIGH > MEDIUM > LOW)
5. Give overall verdict: APPROVED or NEEDS CHANGES
