---
title: Plugin Architecture
sidebar_label: Plugin Architecture
---

# Plugin Architecture

The application uses a **Plugin-first Architecture** to ensure high decoupling between features and the core framework.

## How it Works

The core provides several **Registries**:
-   `RouteRegistry`: For dynamic pages.
-   `SidebarRegistry`: For main navigation items.
-   `UserMenuRegistry`: For user-specific actions.
-   `WidgetRegistry`: For dashboard widgets.
-   `ContactDetailsRegistry`: For sections within the Contact Details page.

A **Plugin** is a class that implements the `Plugin` interface and uses these registries during its `register()` phase.

## Creating a Plugin

> **📖 Cookbook:** For a step-by-step guide, see the [Plugin Development Playbook](./plugin-playbook.md).

1.  **Define the Plugin Class:**
    ```tsx
    export class MyPlugin implements Plugin {
      name = 'my-feature'
      register() {
        // Register routes, menu items, widgets, etc.
      }
    }
    ```

2.  **Internal Lazy Loading:**
    Plugins should use `lazy` and `Suspense` internally when registering routes or widgets to optimize bundle size.

3.  **Bootstrap:**
    Register the plugin in `src/main.tsx`:
    ```ts
    new MyPlugin().register()
    ```

## Plugin Types

### Internal Plugins

Internal plugins live in `src/plugins/` within the web client. They are bundled at build time and mapped in `src/pluginMap.ts`. Registration happens via direct import.

### Remote Plugins (External)

Remote plugins are built as standalone ES module bundles in separate repositories. They are discovered at runtime via the `GET /api/plugins` endpoint and loaded dynamically using native `import()`.

The `PluginLoader` singleton manages the full lifecycle:
1. Fetches the list of enabled plugins from `GET /api/plugins`.
2. Merges them with internal plugins from `PLUGIN_MAP`.
3. For each plugin with a `url` field, calls `loadRemotePlugin(url)` which uses dynamic `import()`.
4. Instantiates the plugin class (default export) and calls `register(context)`.

The `context` object passed to `register()` includes all registries (`RouteRegistry`, `SidebarRegistry`, `UserMenuRegistry`, `TopMenuRegistry`, `WidgetRegistry`, `SettingsRegistry`), the `i18n` instance, and the `api` (axios) client.

### Import Maps

Remote plugins are ES modules that reference shared dependencies like `react`, `react-dom`, and `@personal-ari/plugin-sdk` as bare specifiers. The browser resolves these via the **import map** in `index.html`:

```html
<script type="importmap">
  {
    "imports": {
      "react": "https://esm.sh/react@19.2.0",
      "react-dom": "https://esm.sh/react-dom@19.2.0",
      "@personal-ari/plugin-sdk": "/assets/sdk.js",
      ...
    }
  }
</script>
```

This ensures remote plugins share the same React instance and SDK as the host application, avoiding duplicate copies and version conflicts.

## Registration Logic

### Routing Slots
-   `dashboard`: Routes rendered inside `DashboardLayout`.
-   `sidebar-less`: Routes rendered inside `SidebarLessLayout`.
-   `public`: Routes accessible before login.

## Existing Plugins

| Plugin Name | Directory | Description |
| :--- | :--- | :--- |
| **Audit Logs** | `src/plugins/audit-logs` | Provides the "Activity History" features, including the timeline view for contacts, the sidebar history page, and the dashboard widget. |
| **Contacts** | `src/plugins/contacts` | Manages the Contact Details page layout and sections (General Info, Dates, Relations, etc.) via `ContactDetailsRegistry`. |
| **Contact Graph** | `src/plugins/contact-graph` | Visualization of contact relationships. |
| **Dashboard** | `src/plugins/dashboard` | Manages the home dashboard layout and widgets. |
| **Google Import** | `src/plugins/google-import` | Imports contacts from Google. |
| **Groups** | `src/plugins/groups` | Manages contact groups (creation, editing, deletion). |
| **Notifications** | `src/plugins/notifications` | Manages notification channels and policies. |
| **Sessions** | `src/plugins/sessions` | Manages active user sessions. |
| **Settings** | `src/plugins/settings` | Manages the application settings page. |
| **User Security** | `src/plugins/user-security` | Manages password change and account deletion features. |
