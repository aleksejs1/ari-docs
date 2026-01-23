---
title: Contact Details Architecture
sidebar_label: Contact Details
---

# Contact Details Architecture

The Contact Details page (`ContactDetailsPage.tsx`) uses a **Plugin-first Architecture** to render its content. This allows for dynamic extensibility and decouples the main page from the specific details of each section.

## Core Concepts

### 1. Registry (`ContactDetailsRegistry.ts`)
The `ContactDetailsRegistry` is a singleton that manages the list of sections to be rendered on the page.

```typescript
// src/lib/contacts/details/ContactDetailsRegistry.ts
ContactDetailsRegistry.getInstance().register({
  id: 'my_section_id',
  component: MySectionComponent,
  order: 100,
  layout: 'full' // or 'half'
});
```

### 2. Smart Sections (`src/features/contacts/details/sections/`)
Each section is a "Smart Component" corresponding to a card (e.g., General Info, Phones, Emails).
*   **Props:** Receives ONLY `{ contact: Contact }`.
*   **Logic:** Encapsulates all necessary mutation logic (hooks) internally. It does not rely on props for update handlers.
*   **Layout:**
    *   `layout: 'full'`: Spans the full width of the container.
    *   `layout: 'half'`: Takes up one column in the grid (on medium screens and larger).

### 3. Bootstrapping (`defaults_details.ts`)
The `src/features/contacts/defaults_details.ts` file registers the default sections when the application starts. This file is imported for its side effects in `ContactDetailsPage.tsx`.

## Adding a New Section

1.  Create a new component in `src/features/contacts/details/sections/`.
2.  Ensure it accepts `{ contact: Contact }` props.
3.  Implement any mutation logic using hooks (e.g., `useUpdateContact...`).
4.  Register it in `defaults_details.ts` (or another startup file).

```typescript
registry.register({
  id: 'custom_section',
  component: CustomSection,
  order: 15,
  layout: 'half'
})
```
