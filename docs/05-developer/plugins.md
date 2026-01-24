---
title: Plugin Development Overview
sidebar_label: Plugins
---

# Extending Ari CRM

Ari CRM uses a **Plugin-Oriented Architecture** on both the backend (Core) and frontend (Web Client) to allow extensibility while keeping the core codebase clean.

## Core Plugins (Backend)

The backend uses a "Drop-in" Symfony Bundle architecture. Plugins are auto-discovered from the `plugins/` directory and can seamlessly inject entities, API resources, migrations, and services.

-   **[Architecture](./core/plugin-architecture.md)**: Deep dive into how the Core Plugin system works (Kernel booting, PrependExtension, etc.).
-   **[Creating Plugins](./core/creating-plugins.md)**: Step-by-step guide to scaffolding and building a backend plugin.

## Web Client Plugins (Frontend)

The frontend uses a Registry-based architecture where plugins register their UI components into specific slots.

-   **[Architecture](./web-client/plugin-architecture.md)**: Overview of the Registries (`RouteRegistry`, `SidebarRegistry`, etc.).
-   **[Plugin Playbook](./web-client/plugin-playbook.md)**: Cookbook for adding new features (Pages, Navigation, Widgets).

## Contributing

If you want to contribute a plugin to the main repository, please check our [Contributing Guide](contributing.md).
