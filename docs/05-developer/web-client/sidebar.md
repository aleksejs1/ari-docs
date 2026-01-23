---
title: Sidebar Architecture
sidebar_label: Sidebar
---

# Sidebar Architecture

The Sidebar has been refactored to use a **Registry-based Plugin Architecture**. This allows adding new navigation sections or links without modifying the core `SidebarContent` component.

## Core Concepts

### 1. Registry (`SidebarRegistry`)
A singleton that manages a list of navigation sections to be rendered in the sidebar.

**Path:** `src/lib/ui/sidebar/SidebarRegistry.ts`

### 2. Sections
A "Section" is a React component that renders a group of navigation links using the `SidebarNavItem` component.
-   Sections are independent and should use `useTranslation`.
-   They receive an `onNavigate` prop to close the mobile sidebar when a link is clicked.

**Path:** `src/features/ui/sidebar/sections/`

### 3. Navigation Item (`SidebarNavItem`)
A shared component that ensures all sidebar links have consistent styling and behavior.

**Path:** `src/features/ui/sidebar/SidebarNavItem.tsx`

### 4. Bootstrapping
Default sidebar sections are registered in `defaults_sidebar.ts`.

**Path:** `src/features/ui/defaults_sidebar.ts`

## How to Add a New Navigation Section

To add a new section (e.g., "Reports"):

1.  **Create the Component:**
    ```tsx
    // src/features/reports/ui/ReportsSidebarSection.tsx
    import { BarChart } from 'lucide-react'
    import { SidebarNavItem } from '@/features/ui/sidebar/SidebarNavItem'

    export function ReportsSidebarSection({ onNavigate }: { onNavigate?: () => void }) {
      return (
        <SidebarNavItem
          to="/reports"
          icon={BarChart}
          label="Reports"
          onClick={onNavigate}
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
