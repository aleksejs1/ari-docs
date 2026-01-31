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

## Docker Development

The development environment runs in Docker. All commands below are run from the `ari/` directory.

### Starting with SQLite (default)

```bash
docker compose up
```

### Starting with MariaDB

Use the `mysql` profile to start a MariaDB container alongside the app:

```bash
DB_CONNECTION=mysql docker compose --profile mysql up
```

The app container uses `depends_on` with `required: false`, so it starts normally even without the database container in SQLite mode.

### Access Points

| Service  | URL                    |
| :------- | :--------------------- |
| App      | http://localhost:8000  |
| Mailpit  | http://localhost:8025  |

### Plugin Volume Mounts

External plugin directories must be mounted into the Docker container. Use `compose.override.yaml` for this — it is auto-merged by Docker Compose and is gitignored.

```bash
cp compose.override.yaml.dist compose.override.yaml
```

Edit `compose.override.yaml` to mount your plugin directories:

```yaml
services:
  app:
    volumes:
      - ../ari-plugin-gifts:/ari-plugin-gifts
      # Add more plugins as needed:
      # - ../my-other-plugin:/my-other-plugin
```

This file is applied automatically with both `docker compose up` and `docker compose --profile mysql up`.

### Shell Access

```bash
docker exec -it ari-app-1 bash
```

## Running All Checks

To run all quality checks at once:
```bash
composer qa
```

> [!NOTE]
> Ensure your Docker environment is running before executing these commands.
