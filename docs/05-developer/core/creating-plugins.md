---
title: How to Create a New Plugin
sidebar_label: Creating Plugins
---

# How to Create a New Plugin

This guide provides a step-by-step walkthrough for creating a new "Drop-in" plugin for the Ari Core.

## 1. Quick Start

Create the directory structure for your plugin (e.g., `MyPlugin`).

```bash
mkdir -p plugins/MyPlugin/src/DependencyInjection
mkdir -p plugins/MyPlugin/src/Entity
mkdir -p plugins/MyPlugin/config
mkdir -p plugins/MyPlugin/migrations
mkdir -p plugins/MyPlugin/tests/Functional
```

## 2. Manifest (composer.json)

Create `plugins/MyPlugin/composer.json` to define your plugin and its dependencies.

```json
{
    "name": "ari-plugins/my-plugin",
    "description": "My Awesome Plugin",
    "type": "symfony-bundle",
    "require": {
        "ari/core": "^0.1"
    }
}
```

## 3. Bundle Class

Create the main bundle class at `plugins/MyPlugin/src/MyPlugin.php`.

```php
<?php

namespace Plugins\MyPlugin;

use Symfony\Component\HttpKernel\Bundle\Bundle;

class MyPlugin extends Bundle
{
    public function getPath(): string
    {
        return \dirname(__DIR__);
    }
}
```

## 4. The Extension Magic (Crucial Step)

Create `plugins/MyPlugin/src/DependencyInjection/MyPluginExtension.php`.
This file is responsible for registering your entities, API resources, and migrations with the Core.

```php
<?php

namespace Plugins\MyPlugin\DependencyInjection;

use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Extension\Extension;
use Symfony\Component\DependencyInjection\Extension\PrependExtensionInterface;
use Symfony\Component\DependencyInjection\Loader\YamlFileLoader;
use Symfony\Component\Config\FileLocator;

class MyPluginExtension extends Extension implements PrependExtensionInterface
{
    public function load(array $configs, ContainerBuilder $container): void
    {
        // Load services (if you have any in config/services.yaml)
        $loader = new YamlFileLoader($container, new FileLocator(__DIR__ . '/../../config'));
        // $loader->load('services.yaml');
    }

    public function prepend(ContainerBuilder $container): void
    {
        // 1. Doctrine ORM Configuration
        if ($container->hasExtension('doctrine')) {
            $container->prependExtensionConfig('doctrine', [
                'orm' => [
                    'mappings' => [
                        'Plugins\MyPlugin\Entity' => [
                            'is_bundle' => false,
                            'type' => 'attribute',
                            'dir' => __DIR__ . '/../Entity',
                            'prefix' => 'Plugins\MyPlugin\Entity',
                            'alias' => 'MyPlugin',
                        ],
                    ],
                ],
            ]);
        }

        // 2. API Platform Configuration
        if ($container->hasExtension('api_platform')) {
            $container->prependExtensionConfig('api_platform', [
                'mapping' => [
                    'paths' => [
                        '%kernel.project_dir%/src/Entity', // IMPORTANT: Keep core entities
                        __DIR__ . '/../Entity',            // Add plugin entities
                    ],
                ],
            ]);
        }

        // 3. Doctrine Migrations Configuration
        if ($container->hasExtension('doctrine_migrations')) {
            $container->prependExtensionConfig('doctrine_migrations', [
                'migrations_paths' => [
                    'Plugins\MyPlugin\Migrations' => __DIR__ . '/../../migrations',
                ],
            ]);
        }
    }
}
```

## 5. Entities & Multi-Tenancy

Create your entity in `plugins/MyPlugin/src/Entity/MyEntity.php`.
**Requirement**: You MUST implement `TenantAwareInterface` and use `TenantAwareTrait`.

```php
<?php

namespace Plugins\MyPlugin\Entity;

use ApiPlatform\Metadata\ApiResource;
use Ari\Security\TenantAwareInterface;
use Ari\Security\TenantAwareTrait;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'plg_my_entity')] // Prefix tables to avoid collisions
#[ApiResource(processor: \Ari\State\UserOwnerProcessor::class)] // Auto-assign tenant
class MyEntity implements TenantAwareInterface
{
    use TenantAwareTrait;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;
    
    // ... your properties
}
```

## 6. Database Migrations

Generate a migration for your new entity.

```bash
# Generate diff
bin/console doctrine:migrations:diff --namespace="Plugins\MyPlugin\Migrations"

# Move the generated file
mv migrations/Version*.php plugins/MyPlugin/migrations/
```

*Note: Ensure the generated migration file namespace matches `Plugins\MyPlugin\Migrations`.*

## 7. Testing

Create a functional test in `plugins/MyPlugin/tests/Functional/MyEntityResourceTest.php`.

```php
<?php

namespace Plugins\MyPlugin\Tests\Functional;

use Ari\Tests\Functional\AbstractApiTestCase;

class MyEntityResourceTest extends AbstractApiTestCase
{
    public function testCreateAndRead(): void
    {
        $user = 'user@example.com';
        $this->createUser($user, 'password');
        $token = $this->getToken($user, 'password');

        $client = self::createClient();
        $client->request('POST', '/api/my_entities', [
            'headers' => ['Authorization' => 'Bearer ' . $token],
            'json' => ['name' => 'Test'],
        ]);

        static::assertResponseStatusCodeSame(201);
    }
}
```

Run your tests:
```bash
make test
```

## External Plugin Setup

External plugins live outside the main repository in their own project folder. This section covers how to connect an external plugin to the Ari development environment.

### Project Structure

A typical external plugin repository looks like this:

```
ari-plugin-gifts/
├── plugin.json              # Plugin manifest (required)
├── src/                     # Backend PHP code (Symfony Bundle)
│   ├── GiftPlugin.php
│   ├── DependencyInjection/
│   ├── Entity/
│   └── ...
├── config/
├── migrations/
├── tests/
└── ui/                      # Frontend code
    ├── src/
    ├── dist/                # Built frontend assets
    ├── package.json
    ├── vite.config.ts
    └── tsconfig.json
```

### Plugin Manifest (`plugin.json`)

Every external plugin must include a `plugin.json` file at the project root. This file is read by `PluginListProvider` to discover and serve the plugin.

```json
{
  "name": "gift-plugin",
  "version": "1.0.0",
  "displayName": "Gift Management",
  "description": "Manage gift ideas for contacts",
  "author": "Ari Team",
  "frontend": {
    "enabled": true,
    "entry": "ui/dist/gift-plugin.js",
    "devUrl": null
  },
  "backend": {
    "enabled": true,
    "bundle": "Plugins\\GiftPlugin\\GiftPlugin"
  },
  "require": {
    "ari/core": "^0.1.0"
  }
}
```

Key fields:
- **`frontend.enabled`**: Set to `true` if the plugin has a UI component.
- **`frontend.entry`**: Path to the built JS bundle, relative to the plugin root.
- **`frontend.devUrl`**: Optional URL for development (e.g., a Vite dev server). Set to `null` for production builds.
- **`backend.enabled`**: Set to `true` if the plugin has a Symfony Bundle.
- **`require.ari/core`**: Semver constraint for Core compatibility.

### Symlink into `core/plugins/`

The backend auto-discovers plugins from the `core/plugins/` directory. Create a symlink to your external plugin:

```bash
cd ari/core/plugins
ln -s /path/to/ari-plugin-gifts GiftPlugin
```

The symlink name must match the Bundle class name (e.g., `GiftPlugin` for `Plugins\GiftPlugin\GiftPlugin`).

### Docker Volume Mounts

In Docker, symlinks point to host paths that don't exist inside the container. You must mount the external plugin directory into the container using `compose.override.yaml`:

```bash
cd ari
cp compose.override.yaml.dist compose.override.yaml
```

Edit `compose.override.yaml`:

```yaml
services:
  app:
    volumes:
      - ../ari-plugin-gifts:/ari-plugin-gifts
```

The mount path must match the symlink target. If the symlink points to `/ari-plugin-gifts` inside the container, mount it there.

> **Note:** `compose.override.yaml` is gitignored and auto-merged by Docker Compose. See [Docker Development](./index.md#docker-development) for details.

### Asset Serving

The `PluginAssetController` serves plugin frontend assets at:

```
GET /plugins/{pluginName}/{fileName}
```

For example, `GET /plugins/gift-plugin/gift-plugin.js` serves the built JS bundle from `{pluginPath}/ui/dist/gift-plugin.js`.

Allowed file extensions: `.js`, `.css`, `.map`, `.woff`, `.woff2`, `.ttf`, `.eot`.

### Plugin Discovery API

The `GET /api/plugins` endpoint returns a list of enabled plugins with their metadata and asset URLs. The frontend `PluginLoader` calls this endpoint at startup to discover and load remote plugins.

Example response:

```json
[
  {
    "id": "gift-plugin",
    "version": "1.0.0",
    "displayName": "Gift Management",
    "enabled": true,
    "url": "/plugins/gift-plugin/gift-plugin.js"
  }
]
```
