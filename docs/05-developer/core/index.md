---
title: Core Service Overview
sidebar_label: Overview
---

# Ari CRM Core

Open Source CRM focused on privacy and extensibility.

## Quality Tools

This project uses a set of tools to ensure code quality and stability. All commands should be run inside the Docker container.

### Static Analysis

- **PHPStan**: Level 8 analysis with strict rules.
  ```bash
  composer phpstan
  ```
- **Psalm**: Level 3 analysis with Symfony plugin.
  ```bash
  composer psalm
  ```
- **Deptrac**: Architectural layer validation.
  ```bash
  composer deptrac
  ```

### Testing

- **PHPUnit**: Unit and Functional tests.
  ```bash
  composer test
  ```
- **Infection**: Mutation testing to verify test suite quality.
  ```bash
  composer infection
  ```
  *(Uses `pcov` for coverage inside Docker)*

### Coding Standards

- **PHP-CS-Fixer**: Automatically fix coding standard violations.
  ```bash
  composer cs-fix
  ```
- **PHP_CodeSniffer**: PSR12 linting check.
  ```bash
  composer lint
  ```

### Security

- **Symfony Security Check**: Check for known vulnerabilities in dependencies.
  ```bash
  composer security:check
  ```

## Development

To run all quality checks at once:
```bash
composer qa
```

> [!NOTE]
> Ensure your Docker environment is running before executing these commands.
