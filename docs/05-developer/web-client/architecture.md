---
title: Project Architecture
sidebar_label: Architecture
---

# Project Architecture

This document provides a high-level overview of the `web-client` project architecture to assist with navigation and development.

## Technology Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router 7
- **State Management & Data Fetching**: TanStack Query (React Query)
- **Styling**: Tailwind CSS with `shadcn/ui` (Radix UI) components
- **Forms**: React Hook Form using Zod for validation
- **HTTP Client**: Axios
- **Internationalization**: i18next (en, ru)
- **Testing**: Vitest, React Testing Library
- **Code Quality**: ESLint, Prettier, Stylelint, Dependency Cruiser, Knip

## Directory Structure

The project follows a **Feature-Based Architecture** (inspired by Feature-Sliced Design), where code is organized by business domain rather than technical layer.

```
src/
├── assets/          # Static assets (images, fonts)
├── components/      # Shared UI components (mostly shadcn/ui primitives)
│   └── ui/          # Atomic UI elements (Button, Input, Card, etc.)
├── contexts/        # Global React Contexts (e.g., AuthContext)
├── features/        # Business features (The core of the application)
│   ├── auth/        # Login, Register pages and logic
│   ├── activity-feed/ # User notifications and activity history
│   ├── contacts/    # Contact management (List, Details, Forms, Relations)
│   ├── dashboard/   # Dashboard widgets and layout
│   ├── groups/      # Contact groups management (Alphabetical sort, color support)
│   ├── notification-policies/ # Notification policies management (Create, Edit, List)
│   ├── users/       # User management (Change Password)
│   ├── ...          # Other feature modules
│   └── [feature]/
│       ├── components/  # Feature-specific components
│       └── [hook].ts    # Feature-specific data hooks (e.g. useContacts.ts)
├── hooks/           # Shared global hooks (e.g. useAuth)
├── i18n/            # Localization configuration and JSON translation files
├── lib/             # Utility libraries and configurations (axios, utils)
├── pages/           # Route components (Page wrappers around features)
├── test/            # Global test setup and utilities
└── types/           # Global TypeScript definitions
    └── schema.d.ts  # Auto-generated API types from OpenAPI
```

## Key Patterns

- **API Client**: We use a `schema.d.ts` file generated from the backend OpenAPI/Swagger definition (`npm run gen:types`).
- **Data Fetching**: Data access logic is encapsulated in custom hooks within each feature (e.g., `features/contacts/useContacts.ts`). We use TanStack Query for caching and state management.
- **Authentication & Sessions**:
  - **JWT Refresh**: Implemented via Axios interceptors. On 401 Unauthorized, the client attempts to refresh the access token using a stored `refresh_token`. Concurrent requests are queued during refresh to prevent race conditions. If refresh fails, the user is logged out.
  - **Session Management**: Users can view active sessions (device, IP, time) via the Sessions page and terminate individual sessions remotely.
  - **State**: `AuthContext` manages global auth state (user, token, refresh_token).
- **User Preferences**: Global preferences (language, date format, google sync, dashboard notification policy) are managed via `useUserPrefs` hook and persisted to backend.
- **Settings System**: Implements a **Dynamic Registry** pattern (`SettingsRegistry`). Features and plugins can register their own settings tabs (`SettingTab`) independently. The Settings page acts as a shell that renders these registered tabs. Core settings are migrated to `GeneralSettingsTab`.
- **Notification Channels**: Support for multiple types (Telegram, Web). Telegram required config (token, ID), Web is config-less.
- **Validation**: All forms use Zod schemas defined in `src/types/models.ts` or co-located with forms ensures type safety between API and UI.
- **Favorites**: Contact favorites are managed via a special group (default `favourites`, configurable in User Settings).
- **Data Export**: Users can export all their data in XML format from the Settings page. This is handled via the `useExportContacts` hook which triggers a file download. Individual contacts can be exported as vCard (VCF) from the Contact Details page.
- **Data Import**: Users can import contacts from an XML file via the Settings page. This is handled by the `useImportContacts` hook which sends the file to the backend.
- **Global Search**: A unified search bar in the header allows searching for Contacts (API), Groups (local), and Navigation/Settings (static), organized in tabs (Contacts, Groups, Settings). Implemented in `src/features/search/components/GlobalSearch.tsx`. Displays top 5 results with a "Show all results" option for contacts.
- **Contact Graph**: Visualizes connections between contacts using a 2D force-directed graph. Accessible via the "Graph" navigation item. Implemented using `vis-network` in `src/features/contact-graph` and lazily loaded to optimize bundle size.
- **User Menu**: Quick access to system utilities (Audit Logs, Settings) and user profile actions via the top-right header menu.
- **Logo Navigation**: Clicking the application logo in the sidebar redirects to the Dashboard/Home page.
- **Dashboard**: A dynamic widget system (`DynamicDashboard`) that displays key information using interchangeable widgets registered in `WidgetRegistry`. Includes widgets for **System Stats** (total contacts, logs, notifications), **Groups**, **Upcoming Anniversaries**, and **Recent Activity**.
- **Contact Details**: Uses a **Plugin-first Architecture** controlled via `ContactDetailsRegistry`. Individual sections (cards) are registered as independent "Smart Sections" that handle their own data mutations.
- **Contact Form**: Uses a **Registry-based Architecture** (`ContactFormRegistry`) to dynamically render form fields. Sections are `react-hook-form` aware components that register their own fields.
- **Form Layout**: Contact creation/editing uses a `ContactModalForm` (Dialog) with a streamlined, Google Contacts-inspired layout (single column, icons). Other large forms may use `CollapsibleSection` to group fields.
- **Layouts**: The application uses two main layouts: `DashboardLayout` (with sidebar) for most pages and `SidebarLessLayout` (no sidebar, simplified) for the Home and Contacts pages.
- **Sidebar**: In `DashboardLayout`, the sidebar provides navigation to secondary features (Audit Logs, Groups, Settings etc). On desktop it is always visible; on mobile it is hidden and accessible via a hamburger menu (using the `Sheet` component). It does not contain Home or Contacts links, nor user/session controls (which are in the header).
- **Header Navigation**: In `SidebarLessLayout`, primary navigation (like Contacts) is exposed directly in the header row next to the logo.
- **Type Autocomplete**: Form fields for "type" (phone type, email type, etc.) use a `TypeAutocomplete` component that provides suggestions from the `/api/autocomplete` endpoint via the `useAutocomplete` hook. Users can also enter custom values, which are cached locally for future use within the session.
- **Avatar Upload**: Avatar management uses a dedicated component `AvatarUpload` which handles image selection and immediate upload via `POST /api/contacts/{id}/avatar`. Support for drag-and-drop or simple file selection with validation.
- **Demo Mode**: Users can instantly explore the application using a "Demo" account. This is triggered from the Login page, calling `POST /api/demo-account` to generate a temporary user and then automatically logging in with the default password `demo`.
- **Delete Account**: Users can permanently delete their account and all associated data via the Settings-related "Delete Account" page. This action triggers a `DELETE /api/profile` request and requires explicit confirmation through a modal dialog.

## Development Commands

- `npm run dev`: Start development server
- `npm run quality`: Run full suite of quality checks (Lint, Format, Types, Tests)
- `npm run gen:types`: Regenerate API types from backend
