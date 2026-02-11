---
title: Widget System Architecture
sidebar_label: Dashboard Widgets
---

# Widget System Architecture

## Overview

The dashboard is built on a fully customizable widget system. Users can toggle widget visibility, reorder widgets within layout zones via drag-and-drop, move widgets between zones, and switch between preset layouts. The system is entirely registry-driven, enabling plugins to contribute widgets and layout presets without modifying core code.

## Core Concepts

### Widget Registry

The `WidgetRegistry` is a singleton that stores all available widget definitions. Each widget is described by a `WidgetDefinition`:

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier (e.g., `'stats'`) |
| `title` | `string` | Display name (translation key) |
| `description` | `string?` | Description shown in the toggle panel (translation key) |
| `icon` | `ComponentType?` | Icon shown in the toggle panel |
| `component` | `ComponentType` | React component to render |
| `defaultDimensions` | `{ w, h }` | Default size. `w` determines initial zone placement |

The `w` (width) value controls which zone a widget is placed in by default:
- `w >= 12` — Full-width zone
- `w > 6` — Left or main column
- `w <= 6` — Right or sidebar column

### Layout Preset Registry

The `LayoutPresetRegistry` manages dashboard layouts. Each `LayoutPreset` defines a set of zones:

```typescript
interface LayoutPreset {
  id: string          // e.g., 'two-column'
  name: string        // Translation key for display name
  description: string // Translation key for description
  zones: LayoutZone[]
}

interface LayoutZone {
  id: string       // e.g., 'left'
  label: string    // Translation key for zone label
  basis?: string   // Flex basis (e.g., '1/2', '1/3', '100%')
}
```

**Built-in presets:**

| Preset | Zones | Description |
|---|---|---|
| Single Column | `main` | All widgets stacked vertically |
| Two Columns | `full`, `left`, `right` | Full-width row + two equal columns |
| Three Columns | `full`, `left`, `center`, `right` | Full-width row + three equal columns |
| Sidebar Right | `full`, `main`, `sidebar` | Full-width row + wide main + narrow sidebar |

### Dashboard Settings

User customization is persisted as a JSON blob in the `UserPref` entity (type `dashboard_settings`):

```json
{
  "layout": "two-column",
  "zones": {
    "full": ["stats"],
    "left": ["recent-logins", "recent-audit-logs"],
    "right": ["upcoming-anniversaries", "groups"]
  },
  "hidden": ["recent-audit-logs"]
}
```

An empty value `{}` means "use all system defaults" — no migration is required.

## User-Facing Features

### Toggle Widgets

Users click the **Customize** button (gear icon) to open a panel listing all registered widgets with checkboxes. Toggling a widget adds or removes its ID from the `hidden` array.

### Reorder and Move Widgets

Clicking the **Reorder** button enters edit mode. In this mode:
- **Drag handles** appear on each widget (grip icon on the left edge).
- **Zone labels** and borders become visible.
- Widgets can be **reordered** within a zone by dragging up/down.
- Widgets can be **moved between zones** by dragging to a different zone container.
- Changes are held in a **draft state** until the user clicks **Done** (save) or **Cancel** (discard).

Drag-and-drop is powered by [`@dnd-kit`](https://dndkit.com/).

### Switch Layouts

In edit mode, clicking the **Layout** button opens a picker dialog. Each preset is shown as a card with a visual zone diagram. Selecting a new layout redistributes all widgets into the new zone structure based on their `defaultDimensions.w`.

---

# Cookbook: Creating a Dashboard Widget

## Step 1: Create the Component

```tsx
// src/plugins/my-feature/widgets/MyWidget.tsx
import { Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function MyWidget() {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Star className="h-5 w-5 text-yellow-500" />
          <span>{t('myWidget.title')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>Widget content here.</p>
      </CardContent>
    </Card>
  )
}
```

## Step 2: Register the Widget

In your plugin's `register()` method:

```typescript
widgetRegistry.register({
  id: 'my-widget',
  title: 'myWidget.title',
  description: 'myWidget.description',
  component: MyWidget,
  defaultDimensions: { w: 6, h: 4 },
})
```

The widget will automatically:
- Appear in the **Customize** panel for toggling visibility.
- Be placed in the appropriate **default zone** for new users.
- Support **drag-and-drop** reordering and cross-zone movement.
- Be **redistributed** when the user switches layout presets.

## Step 3: Add Translations

```json
{
  "myWidget": {
    "title": "My Widget",
    "description": "A brief description shown in the customize panel"
  }
}
```

## Registering Custom Layout Presets

Plugins can also register new layout presets:

```typescript
// Inside register(context)
context.layoutPresetRegistry.register({
  id: 'my-layout',
  name: 'myPlugin.layout.name',
  description: 'myPlugin.layout.description',
  zones: [
    { id: 'top', label: 'Top', basis: '100%' },
    { id: 'left', label: 'Left', basis: '1/2' },
    { id: 'right', label: 'Right', basis: '1/2' },
  ],
})
```

Custom presets appear alongside built-in ones in the Layout Picker dialog.
