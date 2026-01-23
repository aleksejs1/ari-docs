---
title: User Menu Architecture
sidebar_label: User Menu
---

# User Menu Architecture

The User Menu has been refactored to use a **Plugin-first Architecture**. This allows new menu items or sections to be added without modifying the core `UserMenu` component.

## Core Concepts

### 1. Registry (`UserMenuRegistry`)
A singleton that manages a list of sections to be rendered in the dropdown menu.

**Path:** `src/lib/ui/usermenu/UserMenuRegistry.ts`

### 2. Sections
A "Section" is a React component that renders a group of menu items or a label.
-   Sections are independent and should use their own hooks (e.g., `useAuth`, `useTranslation`).
-   They are rendered sequentially in the `DropdownMenuContent`.
-   A `DropdownMenuSeparator` is automatically added between sections.

**Path:** `src/features/ui/usermenu/sections/`

### 3. Bootstrapping
Default sections are registered in `defaults_usermenu.ts`.

**Path:** `src/features/ui/defaults_usermenu.ts`

## How to Add a New Menu Section

To add a new section (e.g., "Billing"):

1.  **Create the Component:**
    ```tsx
    // src/features/billing/ui/BillingMenuSection.tsx
    import { CreditCard } from 'lucide-react'
    import { DropdownMenuItem } from '@/components/ui/dropdown-menu'

    export function BillingMenuSection() {
      return (
        <DropdownMenuItem onClick={...}>
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Billing</span>
        </DropdownMenuItem>
      )
    }
    ```

2.  **Register the Section:**
    ```ts
    import { UserMenuRegistry } from '@/lib/ui/usermenu/UserMenuRegistry'
    import { BillingMenuSection } from './BillingMenuSection'

    UserMenuRegistry.getInstance().register({
      id: 'billing',
      component: BillingMenuSection,
      order: 25 // Between Core Navigation and Theme
    })
    ```
