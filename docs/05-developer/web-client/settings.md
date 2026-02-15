---
title: Settings Architecture
sidebar_label: Settings System
---

# Settings Architecture

## Overview

The settings system uses a **dedicated layout with a secondary sidebar** for navigation. All settings and administrative pages are organized under `/settings/*` URLs with nested routing.

## Layout

### `SettingsLayout`
-   **Location**: `src/plugins/settings/components/SettingsLayout.tsx`
-   **Role**: Provides a secondary sidebar with grouped navigation for all settings pages.
-   **Structure**: Uses `<Outlet />` for nested route rendering.
-   **Mobile**: On small screens, the secondary sidebar is hidden and accessible via a `Sheet` component.

### Navigation Groups

Settings pages are organized into four groups:

| Group | Pages |
|:------|:------|
| **Preferences** | General, Regional, Data, Plugins |
| **Notifications** | Notification Channels, Notification Policies |
| **Activity** | Sessions, Login History, Google Import, Audit Logs |
| **Account** | Change Password, Delete Account |

### Route Registration

Settings pages are registered using the `'settings'` route slot in `RouteRegistry`. Paths are relative to `/settings/`:

```tsx
routeRegistry.register('settings', {
  path: 'my-settings-page',  // renders at /settings/my-settings-page
  element: <MySettingsPage />,
})
```

The navigation items in the secondary sidebar are defined in `SettingsLayout.tsx` via the `settingsNavGroups` array.

## Settings Builder System

### `SettingsRegistry`
-   **Location**: `src/lib/settings/SettingsRegistry.ts`
-   **Role**: A singleton service that stores registered settings tabs.
-   **Reactivity**: Uses `useSyncExternalStore` (via `useSettingsTabs` hook) to push updates to the UI whenever a tab is registered or unregistered.

### `SettingTab`
-   **Location**: `src/lib/settings/SettingTab.ts`
-   **Role**: An abstract class defining the contract for a settings tab.
-   **Contract**:
    -   `id`: Unique identifier (e.g., `'general'`, `'regional'`).
    -   `name`: Display name or translation key (e.g., `'settings.tabs.general'`).
    -   `Component`: A React component to render the tab's content.

### Builder API (The "Fluent API")

The settings UI is built using a chainable builder pattern inspired by the [Obsidian Plugin API](https://docs.obsidian.md/Plugins/User+interface/Settings#Settings).

#### `Setting` (Builder)
-   **Location**: `src/lib/settings/Setting.ts`
-   Provides a chainable API: `new Setting(container).setName(...).addControl(...)`

#### `SettingItem` (Renderer)
-   **Location**: `src/lib/settings/components/SettingItem.tsx`
-   Renders the appropriate UI controls (shadcn/ui components) from a `SettingConfig`.

## Standard Settings Pages

The core application provides these default settings pages:
-   **General** (`/settings/general`): Language, Favorites, Notifications.
-   **Regional** (`/settings/regional`): Date & Time formats.
-   **Data** (`/settings/data`): Import & Export.
-   **Plugins** (`/settings/plugins`): Community plugin management.

---

## Cookbook: Creating Settings

### Creating a New Settings Page

#### Step 1: Create the Component

```tsx
// src/features/my-feature/MySettings.component.tsx
import { useMemo } from 'react'
import { Setting } from '@/lib/settings/Setting'
import { SettingItem } from '@/lib/settings/components/SettingItem'

export function MySettings() {
  const settings = useMemo(() => {
    const container = []

    new Setting(container)
      .setName('My Setting')
      .addText(text => text.setPlaceholder('Value...'))

    return container
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {settings.map((s, i) => <SettingItem key={i} setting={s} />)}
      </div>
    </div>
  )
}
```

#### Step 2: Create and Register the Tab

```tsx
// src/features/my-feature/MySettingsTab.ts
import { SettingTab } from '@/lib/settings/SettingTab'
import { MySettings } from './MySettings.component'

export class MySettingsTab extends SettingTab {
  constructor() {
    super('my-feature', 'My Feature')
  }

  get Component() {
    return MySettings
  }
}
```

Register it in your plugin's `register()` method:

```ts
settingsRegistry.registerTab(new MySettingsTab())
```

### Control Recipes

#### Text Input
```ts
new Setting(settings)
  .setName('API Key')
  .addText(text => text.setValue(apiKey).onChange(val => setApiKey(val)))
```

#### Radio Group
```ts
new Setting(settings)
  .setName('Theme')
  .addRadio(radio =>
    radio
      .addOption('light', 'Light')
      .addOption('dark', 'Dark')
      .setValue(theme)
      .onChange(val => setTheme(val))
  )
```

#### Dropdown
```ts
new Setting(settings)
  .setName('Policy')
  .addDropdown(dropdown =>
    dropdown
      .addOption('a', 'Policy A')
      .addOption('b', 'Policy B')
      .setValue(currentPolicy)
      .onChange(val => setPolicy(val))
  )
```

#### Action Button
```ts
new Setting(settings)
  .setName('Sync')
  .addButton(btn =>
    btn
      .setButtonText('Sync Now')
      .setDisabled(isSyncing)
      .onClick(handleSync)
  )
```
