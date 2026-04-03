---
name: generate-docs
description: Generate documentation for components, hooks, or stores
allowed-tools: Read Glob Write
argument-hint: "[component-or-path]"
---

# Generate Documentation

Generate markdown documentation for: `$ARGUMENTS`

## For Components

Document each component with:
- **Description**: What it does
- **Props**: Table of prop name, type, default, and description
- **Usage Example**: TSX code showing typical usage
- **Related**: Links to related components or hooks

## For Hooks

Document each hook with:
- **Description**: What it does
- **Parameters**: What it accepts
- **Returns**: What it returns (with types)
- **Usage Example**: Code showing how to use it

## For Stores

Document each store with:
- **State Shape**: TypeScript interface of the state
- **Actions**: List of actions and what they do
- **Selectors**: Any derived state
- **Usage Example**: How to use in a component

Write the generated docs to `docs/` directory.
