---
name: deploy
description: Build and deploy the birds app. Run type checks, tests, and build before deploying.
disable-model-invocation: true
allowed-tools: Bash Read
argument-hint: "[environment]"
---

# Deploy Birds App

Deploy the application after running all quality checks.

## Steps

1. **Type Check**: Run `npx tsc --noEmit` to catch type errors
2. **Lint**: Run `npm run lint` to check code style
3. **Test**: Run `npm test` to verify all tests pass
4. **Build**: Run `npm run build` to create production bundle
5. **Deploy**: Deploy the `dist/` folder to target environment

Target environment: `$ARGUMENTS` (default: preview)

## If Any Step Fails

Stop immediately, report the error, and suggest fixes. Do NOT proceed to deployment with failing checks.
