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
| **Google Import** | `src/plugins/google-import` | Imports contacts from Google. |
| **Notifications** | `src/plugins/notifications` | Manages notification channels and policies. |
| **Sessions** | `src/plugins/sessions` | Manages active user sessions. |
