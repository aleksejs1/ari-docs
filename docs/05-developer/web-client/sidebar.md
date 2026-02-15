---
title: Sidebar Architecture
sidebar_label: Sidebar
---

# Sidebar Architecture

The sidebar uses a **Registry-based Plugin Architecture** with support for a **collapsible mode**. This allows adding new navigation sections without modifying the core `SidebarContent` component.

## Core Concepts

### 1. Registry (`SidebarRegistry`)
A singleton that manages a list of navigation sections to be rendered in the sidebar.

**Path:** `src/lib/ui/sidebar/SidebarRegistry.ts`

### 2. Sections
A "Section" is a React component that renders a group of navigation links using the `SidebarNavItem` component.
-   Sections are independent and should use `useTranslation`.
-   They receive `onNavigate` and `collapsed` props.
-   `onNavigate` closes the mobile sidebar when a link is clicked.
-   `collapsed` indicates whether the sidebar is in collapsed (icon-only) mode.

### 3. Navigation Item (`SidebarNavItem`)
A shared component that ensures all sidebar links have consistent styling and behavior. When `collapsed` is `true`, it renders only the icon wrapped in a `Tooltip`.

**Path:** `src/features/ui/sidebar/SidebarNavItem.tsx`

### 4. Collapsible Sidebar
The sidebar supports two display modes:
-   **Expanded** (~256px): Displays icons alongside text labels.
-   **Collapsed** (~64px): Displays only icons with tooltips on hover.

The collapse state is managed by the `useSidebarCollapsed` hook and persisted in `localStorage`. A toggle button at the bottom of the sidebar switches between modes.

**Path:** `src/hooks/useSidebarCollapsed.ts`

### 5. Mobile Behavior
On mobile screens, the sidebar is hidden by default and can be opened via a hamburger menu button. It renders inside a `Sheet` component (slide-out drawer).

## Default Sidebar Sections

Sidebar items are registered by plugins during their `register()` phase. The default order is:

| Order | Section | Description |
|:------|:--------|:------------|
| 0 | Home | Dashboard page |
| 10 | Contacts | Contacts list |
| 20 | Groups | Collapsible section with group list and contact counts |
| 30 | Contact Graph | Relationship visualization |
| 50+ | Plugin items | Custom plugin navigation |
| 100 | Settings | Opens `/settings/general` |

The **Groups** section is a special collapsible sub-list that shows individual groups (with color dots and contact counts) and a "Manage Groups" link. Empty groups (zero contacts) are hidden. In collapsed sidebar mode, it shows only the folder icon linking to `/groups`.

## How to Add a New Navigation Section

To add a new section (e.g., "Reports"):

1.  **Create the Component:**
    ```tsx
    // src/plugins/reports/extensions/ReportsSidebarSection.tsx
    import { BarChart } from 'lucide-react'
    import { SidebarNavItem } from '@/features/ui/sidebar/SidebarNavItem'

    export function ReportsSidebarSection({
      onNavigate,
      collapsed,
    }: {
      onNavigate?: () => void
      collapsed?: boolean
    }) {
      return (
        <SidebarNavItem
          to="/reports"
          icon={BarChart}
          label="Reports"
          onClick={onNavigate}
          collapsed={collapsed}
        />
      )
    }
    ```

2.  **Register the Section:**
    ```ts
    import { SidebarRegistry } from '@/lib/ui/sidebar/SidebarRegistry'
    import { ReportsSidebarSection } from './ReportsSidebarSection'

    SidebarRegistry.getInstance().register({
      id: 'reports',
      component: ReportsSidebarSection,
      order: 15 // Order relative to other sections
    })
    ```
