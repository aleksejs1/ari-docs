---
title: Web Client Overview
sidebar_label: Overview
---

# Ari CRM Web Client

Modern, fast, and secure frontend for the Ari CRM, built with React, Vite, and Tailwind CSS.

## Getting Started

### 1. Prerequisites
Ensure you have **Node.js 18+** installed.

### 2. Installation
Navigate to the `web-client` directory and install dependencies:

```bash
npm install
```

### 3. Development Server
Start the development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Quality Control

This project adheres to a strict "Zero Warning" policy. We use a comprehensive suite of tools to ensure code quality, maintainability, and architectural integrity.

### The Quality Suite
Run the full quality check (all tools combined):

```bash
npm run quality
```
*This command runs formatting, linting, type-checking, tests, architectural validation, and unused code detection.*

### Individual Tools

- **Formatting (Prettier)**:
  - Check: `npm run format:check`
  - Fix: `npm run format`
- **Logic & Style (ESLint)**:
  - Lint: `npm run lint`
  - *Includes Complexity limits (cyclomatic < 10) and Import sorting.*
- **Architecture (ESLint Boundaries & Depcruise)**:
  - Boundaires: Checked via standard lint.
  - Dependency Map: `npm run lint:deps`
  - Visualize Graph: `npm run lint:deps:graph`
- **Type Checking**:
  - `npm run typecheck`
- **Testing (Vitest)**:
  - Run: `npm run test`
  - UI Mode: `npm run test:ui`
- **Unused Exports (ts-prune)**:
  - `npm run lint:unused`
- **CSS Quality (Stylelint)**:
  - `npm run lint:css`

## Automated Safeguards

### Git Hooks (Husky)
The project uses **Husky** and **lint-staged** to ensure that only high-quality code is committed.
- Formatting and linting are automatically triggered on `git commit`.
- Architectural violations or failing tests will block the commit.

## Building for Production

To create a production-ready build in the `dist/` directory:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

> [!NOTE]
> This client is part of the Ari CRM ecosystem. For backend setup, please refer to the `core` directory README.
