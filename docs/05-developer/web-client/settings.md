---
title: Settings Architecture
sidebar_label: Settings System
---

# Settings Architecture

## Overview

The settings system in **Ari Web Client** follows a **Plugin-First Architecture**. It consists of three main layers:

1.  **Registry**: A global registry (`SettingsRegistry`) that manages available setting tabs.
2.  **Tabs**: Individual modules (`SettingTab` subclasses) that implement specific setting pages.
3.  **Builder API**: A **Fluent API (Builder Pattern)** used within tabs to declaratively define the UI (`Setting` class).

This approach is heavily inspired by the [Obsidian Plugin API](https://docs.obsidian.md/Plugins/User+interface/Settings#Settings).

## 1. Registry System

### `SettingsRegistry`
-   **Location**: `src/lib/settings/SettingsRegistry.ts`
-   **Role**: A singleton service that stores registered tabs.
-   **Reactivity**: Uses `useSyncExternalStore` (via `useSettingsTabs` hook) to push updates to the UI whenever a tab is registered or unregistered.

### `SettingTab`
-   **Location**: `src/lib/settings/SettingTab.ts`
-   **Role**: An abstract class defining the contract for a settings tab.
-   **Contract**:
    -   `id`: Unique identifier (e.g., `'general'`, `'regional'`).
    -   `name`: Display name or translation key (e.g., `'settings.tabs.general'`).
    -   `Component`: A React component to render the tab's content.

## 2. Builder System (The "Fluent API")

### `Setting` (Builder)
-   **Location**: `src/lib/settings/Setting.ts`
-   **Role**: Provides a chainable API to construct settings configurations.
-   **Usage**: `new Setting(container).setName(...).addControl(...)`

### `SettingItem` (Renderer)
-   **Location**: `src/lib/settings/components/SettingItem.tsx`
-   **Role**: A pure React component that takes a `SettingConfig` and renders the appropriate UI controls (shadcn/ui components).

## 3. Data Flow

1.  **Registration**: At application startup (`main.tsx` or plugin init), `SettingTab` instances are registered with `settingsRegistry`.
    ```typescript
    settingsRegistry.registerTab(new GeneralSettingsTab())
    ```
2.  **Navigation**: `SettingsPage.tsx` subscribes to the registry and renders the sidebar list of tabs.
3.  **Tab Rendering**: When a tab is selected, its `Component` (e.g., `GeneralSettings`) is rendered.
4.  **Content Definition**: Inside `GeneralSettings`, `useMemo` is used to create a `settings` array using the `Setting` builder.
5.  **Data Binding**: User interactions trigger `onChange` callbacks, which call updating functions from `useUserPrefs`.

## Standard Tabs

The core application provides three default tabs (located in `src/features/settings`):
-   **General**: Language, Favorites, Notifications.
-   **Regional**: Date & Time formats.
-   **Data**: Import & Export.

---

# Cookbook: Creating Settings

This guide provides step-by-step recipes for adding new settings to the Ari Web Client.

## 1. Creating a New Settings Tab

To add a new section to the Settings page, you need to create a `SettingTab`.

### Step A: Create the Component
Create a component that uses the `Setting` builder to define your UI.

```typescript
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

### Step B: Create the Tab Class
Extend the `SettingTab` abstract class.

```typescript
// src/features/my-feature/MySettingsTab.ts
import { SettingTab } from '@/lib/settings/SettingTab'
import { MySettings } from './MySettings.component'

export class MySettingsTab extends SettingTab {
  constructor() {
    super('my-feature', 'My Feature') // ID, Display Name (or translation key)
  }

  get Component() {
    return MySettings
  }
}
```

### Step C: Register the Tab
Register your tab in `src/main.tsx` (or your plugin entry point).

```typescript
import { settingsRegistry } from '@/lib/settings/SettingsRegistry'
import { MySettingsTab } from './features/my-feature/MySettingsTab'

settingsRegistry.registerTab(new MySettingsTab())
```

## 2. Adding Settings to an Existing Tab

If you want to add settings to an existing component (like `GeneralSettings`), follow usage of the **Setting Builder**.

### Base Pattern

```typescript
new Setting(settings)
  .setName(t('settings.yourSettingName'))
  .setDesc(t('settings.yourDescription'))
  // .addControl(...)
```

### Control Recipes

#### Simple Text Input

```typescript
new Setting(settings)
  .setName('API Key')
  .addText((text) =>
    text
      .setValue(apiKey)
      .onChange((val) => setApiKey(val)),
  )
```

#### Radio Group (Toggle/Choice)

```typescript
new Setting(settings)
  .setName('Theme')
  .addRadio((radio) =>
    radio
      .addOption('light', 'Light')
      .addOption('dark', 'Dark')
      .setValue(theme)
      .onChange((val) => setTheme(val)),
  )
```

#### Dropdown (Select)

```typescript
new Setting(settings)
  .setName('Policy')
  .addDropdown((dropdown) => {
    dropdown
      .addOption('a', 'Policy A')
      .addOption('b', 'Policy B')
      .setValue(currentPolicy)
      .onChange(val => setPolicy(val))
  })
```

#### Action Button

```typescript
new Setting(settings)
  .setName('Sync')
  .addButton((btn) =>
    btn
      .setButtonText('Sync Now')
      .setDisabled(isSyncing)
      .onClick(handleSync),
  )
```
