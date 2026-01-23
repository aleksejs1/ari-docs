---
title: Plugin Development Playbook
sidebar_label: Plugin Playbook
---

# Plugin Development Playbook

This cookbook provides a step-by-step guide for adding new features to the application using the **Plugin-first Architecture**.

## 1. Scaffold the Plugin

Create a new directory in `src/plugins/` (e.g., `src/plugins/my-feature/`).
Create an `index.tsx` file which will serve as the entry point.

```tsx
// src/plugins/my-feature/index.tsx
import type { Plugin } from '@/lib/core/Plugin'

export class MyFeaturePlugin implements Plugin {
  name = 'my-feature'

  register(): void {
    console.log('Registering MyFeaturePlugin...')
    // Registration logic goes here
  }
}
```

## 2. Register Routes

Use `RouteRegistry` to add pages. You typically register routes under the `dashboard` slot (for the main layout) or `sidebar-less` (for full-width pages like wizards).

**Important:** Always use `lazy` imports and `Suspense` with a loader component to ensure **Fast Refresh** works correctly and to optimize bundle size.

```tsx
// src/plugins/my-feature/index.tsx
import { lazy, Suspense } from 'react'
import { RouteRegistry } from '@/lib/routing/RouteRegistry'
import { PageLoader } from './components/PageLoader' // Extract this component!

// 1. Lazy load the page component
const MyFeaturePage = lazy(() => import('./pages/MyFeaturePage'))

export class MyFeaturePlugin implements Plugin {
  name = 'my-feature'

  register(): void {
    const routeRegistry = RouteRegistry.getInstance()

    // 2. Register key route
    routeRegistry.register('dashboard', {
      path: '/my-feature',
      element: (
        <Suspense fallback={<PageLoader />}>
          <MyFeaturePage />
        </Suspense>
      ),
    })
  }
}
```

> **Warning:** Do not define the `PageLoader` component inside `index.tsx` if you export the Plugin class. This breaks React Fast Refresh. Move it to a separate file (e.g., `components/PageLoader.tsx`).

## 3. Add Sidebar Navigation

Use `SidebarRegistry` to add a link to the main sidebar.

```tsx
import { SidebarRegistry } from '@/lib/ui/sidebar/SidebarRegistry'
import { SidebarNavItem } from '@/features/ui/sidebar/SidebarNavItem'
import { Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// ... inside register()
const sidebarRegistry = SidebarRegistry.getInstance()

sidebarRegistry.register({
  id: 'my-feature-link',
  component: ({ onNavigate }) => {
    // Hooks like useTranslation are allowed here
    const { t } = useTranslation()
    return (
      <SidebarNavItem
        to="/my-feature"
        icon={Star}
        label={t('myFeature.title', 'My Feature')}
        onClick={onNavigate}
      />
    )
  },
  order: 50, // Higher number = lower in the list
})
```

## 4. Add User Menu Items

Use `UserMenuRegistry` to add items to the top-right profile dropdown.

```tsx
import { UserMenuRegistry } from '@/lib/ui/usermenu/UserMenuRegistry'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Link } from 'react-router-dom'

// ... inside register()
const userMenuRegistry = UserMenuRegistry.getInstance()

userMenuRegistry.register({
  id: 'my-feature-settings',
  component: () => (
    <DropdownMenuItem asChild>
      <Link to="/my-feature/settings">Settings</Link>
    </DropdownMenuItem>
  ),
  order: 20,
})
```

## 5. Add Dashboard Widgets

Use `WidgetRegistry` to add cards to the home dashboard.

```tsx
import { widgetRegistry } from '@/lib/widgets/WidgetRegistry' // Note: exported instance

const MyWidget = lazy(() => import('./widgets/MyWidget'))

// ... inside register()
widgetRegistry.register({
  id: 'my-widget',
  title: 'My Feature Stats',
  component: () => (
    <Suspense fallback={<div>Loading...</div>}>
      <MyWidget />
    </Suspense>
  ),
  defaultDimensions: { w: 6, h: 4 }, // Gridster dimensions
})
```

## 6. Extend Contact Details

If your plugin relates to contacts (e.g., "Invoices"), you can inject sections into the Contact Details page using `ContactDetailsRegistry`.

```tsx
import { ContactDetailsRegistry } from '@/lib/contacts/details/ContactDetailsRegistry'

// ... inside register()
const contactRegistry = ContactDetailsRegistry.getInstance()

contactRegistry.register({
  id: 'invoices',
  component: ({ contact }) => {
    if (!contact.id) return null
    return <InvoicesList contactId={contact.id} />
  },
  order: 80, // Position relative to other sections
  layout: 'full', // 'full' or 'half' width
})
```

## 7. Bootstrap the Plugin

Finally, initialize your plugin in `src/main.tsx`.

```tsx
// src/main.tsx
import { MyFeaturePlugin } from '@/plugins/my-feature'

// ...
new MyFeaturePlugin().register()
```

## Validation Checklist

- [ ] **Fast Refresh:** Does editing a component file update the page without a full reload? (Ensure exported components are in separate files).
- [ ] **Tests:** Did you add tests for your widgets and pages?
- [ ] **Translation:** Are hardcoded strings extracted to `i18n`?
