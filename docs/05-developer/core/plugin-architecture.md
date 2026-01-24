---
title: Plugin Architecture
sidebar_label: Plugin Architecture
---

# Plugin Architecture

This document describes the "Drop-in" plugin architecture introduced in version 0.1.0 of the Core application. It allows extending the application's functionality by simply placing a directory into the `plugins/` folder, without modifying the global `composer.json` or registering bundles manually.

## 1. Overview

The architecture follows a "Convention over Configuration" approach.
- **Location**: All plugins reside in `core/plugins/`.
- **Isolation**: Each plugin is a Symfony Bundle.
- **Zero-Config**: Plugins are auto-discovered at runtime.
- **Autoloading**: The kernel dynamically registers namespaces using `Composer\Autoload\ClassLoader`, so `composer dump-autoload` is not required when adding a new plugin.

## 2. Kernel Boot Process

The logic resides in `src/Kernel.php`, specifically in the `registerBundles()` method.

1.  **Scanning**: The kernel iterates over the `plugins/` directory.
2.  **Version Check**:
    - It looks for a `composer.json` file in the plugin root.
    - It checks for the `ari/core` requirement.
    - Using `composer/semver`, it verifies if the Core `VERSION` satisfies the plugin's constraint.
    - If the check fails, the plugin is **skipped**, and an error is logged.
    - If `composer.json` is missing or the requirement is absent, the plugin is loaded (optimistic loading).
3.  **Registration**:
    - The namespace `Plugins\{DirName}` is mapped to `plugins/{DirName}/src`.
    - The bundle class `Plugins\{DirName}\{DirName}` is instantiated and yielded.

## 3. Dependency Injection & Configuration

To integrate seamlessly with the Core (Doctrine, API Platform, Migrations) without manual configuration, plugins use the `PrependExtensionInterface`.

### The Problem
Normally, entities and API resources must be registered in `config/packages/doctrine.yaml` and `config/packages/api_platform.yaml`. Requiring users to edit these files breaks the "drop-in" concept.

### The Solution: Prepend Logic
The plugin's Extension class (e.g., `GiftPluginExtension`) implements `PrependExtensionInterface`. This allows the plugin to inject configuration into *other* bundles before they are loaded.

- **Doctrine ORM**: The plugin prepends its `Entity` directory to `doctrine.orm.mappings`.
- **API Platform**: The plugin prepends its `Entity` directory to `api_platform.mapping.paths`.
    - **Crucial**: It must explicitly include `%kernel.project_dir%/src/Entity` as well, or the prepend might overwrite the default path.
- **Doctrine Migrations**: The plugin prepends its `migrations` directory to `doctrine_migrations.migrations_paths`.

## 4. Security & Multi-Tenancy

Plugins fully inherit the Core's security architecture.

- **Multi-Tenancy**: Entities MUST implement `App\Security\TenantAwareInterface` and use `App\Security\TenantAwareTrait`.
    - This ensures `tenant_id` is present and CASCADE delete is configured.
    - The global `TenantFilter` automatically applies to plugin entities, preventing cross-tenant data access.
- **Automatic Assignment**: API Resources should use `processor: \App\State\UserOwnerProcessor::class` to automatically assign the current user as the tenant upon creation.

For more details, see [Core Architecture](./architecture.md#1-multi-tenancy).

## 5. Migrations

Plugin-specific migrations are stored in `plugins/{PluginName}/migrations`.
Because `GiftPluginExtension` registers this path with Doctrine Migrations, commands like `doctrine:migrations:migrate` automatically execute them alongside core migrations.

## 6. Testing Strategy

The Core's testing infrastructure has been updated to support plugins:

- **PHPUnit**: `phpunit.dist.xml` includes a `<testsuite name="Plugins">` that scans `plugins/*/tests`.
- **PHPStan**: `phpstan.dist.neon` includes `plugins/` in its analysis paths.
- **Integration**: `make test` executes plugin tests within the isolated Docker environment.
