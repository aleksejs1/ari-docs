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
use App\Security\TenantAwareInterface;
use App\Security\TenantAwareTrait;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'plg_my_entity')] // Prefix tables to avoid collisions
#[ApiResource(processor: \App\State\UserOwnerProcessor::class)] // Auto-assign tenant
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

use App\Tests\Functional\AbstractApiTestCase;

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
