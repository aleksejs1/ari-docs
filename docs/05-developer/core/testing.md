---
title: QA and Testing Infrastructure
sidebar_label: Testing
---

# QA and Testing Infrastructure

This document describes the quality assurance and testing setup for the `core` service.

## Isolated Test Environment

To ensure tests are fast, reliable, and do not interfere with development data, a dedicated test environment is provided using Docker Compose.

- **Config**: `core/compose.test.yaml`
- **Container**: `test-runner`
- **Database**: SQLite (file-based at `/app/var/test.db` for the test duration).

### SQLite Compatibility
Since the project supports both MySQL (production) and SQLite (testing), specific architectural patterns are used:
1. **Custom DQL Functions**: `MONTH()` and `DAY()` functions are implemented in `App\Doctrine\DQL` to bridge the syntax gap between MySQL and SQLite.
2. **Foreign Key Enforcement**: SQLite requires `PRAGMA foreign_keys = ON` to be set on every connection. This is enforced via `App\Doctrine\DBAL\SqliteForeignKeyMiddleware` to ensure it happens at the lowest level, before any test transactions start.

## Makefile QA Suite

A `Makefile` is provided in the `core/` directory to simplify common quality and testing tasks.

| Command | Description |
|---------|-------------|
| `make test` | Runs the full PHPUnit test suite (230+ tests). |
| `make qa` | **Recommended**. Runs all quality checks (PHPStan, Psalm, Deptrac, Tests). |
| `make phpstan` | Runs PHPStan static analysis (Level 8+). |
| `make psalm` | Runs Psalm static analysis. |
| `make deptrac` | Verifies architectural layer boundaries. |
| `make cs-fix` | Automatically fixes coding standard violations. |
| `make coverage` | Generates a detailed HTML coverage report in `core/coverage/`. |
| `make sh` | Opens an interactive bash shell in the test container. |
| `make down` | Shuts down the test environment and cleans up orphan containers. |

## Running Checks Locally

Instead of manually entering containers, use the Makefile from the `core/` directory:

```bash
cd core
make qa
```

## Static Analysis Configuration
- **PHPStan**: Configured in `phpstan.dist.neon`.
- **Psalm**: Configured in `psalm.xml`.
- **Deptrac**: Configured in `depfile.yaml`.
