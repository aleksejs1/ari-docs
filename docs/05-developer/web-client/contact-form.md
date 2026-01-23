---
title: Contact Form Architecture
sidebar_label: Contact Form
---

# Contact Form Architecture

The Contact Form has been refactored to use a **Registry-based Plugin Architecture**. This allows new fields to be added to the contact form without modifying the core `ContactForm` component.

## Core Concepts

### 1. Registry (`ContactFormRegistry`)
The `ContactFormRegistry` is a singleton that manages a list of sections to be rendered in the form.

**Path:** `src/lib/contacts/form/ContactFormRegistry.ts`

### 2. Sections
A "Section" is a React component that renders a specific part of the form (e.g., Names, Emails, Phone Numbers).
-   Sections are rendered within the context of `react-hook-form`.
-   They should use `useFormContext` to access form state and control methods.
-   They should **not** rely on props passed from the parent.

**Path:** `src/features/contacts/form/sections/` (for newly extracted sections) and `src/features/contacts/components/` (for legacy sections).

### 3. Bootstrapping
The form is initialized by registering the default sections in `defaults_form.ts`. This file maps the section components to string IDs and defines their order.

**Path:** `src/features/contacts/defaults_form.ts`

## How to Add a New Field

To add a new field (e.g., "Telegram Username") to the contact form:

1.  **Create the Component:**
    Create a new component that renders your form field. Use `useFormContext` to register the field.
    ```tsx
    // src/features/contacts/form/sections/TelegramSection.tsx
    import { useFormContext } from 'react-hook-form'
    import { FormField, FormItem, FormControl, FormLabel } from '@/components/ui/form'

    export function TelegramSection() {
      const { control } = useFormContext()
      return (
        <FormField
          control={control}
          name="telegram"
          render={({ field }) => (
             <FormItem>
               <FormLabel>Telegram</FormLabel>
               <FormControl><Input {...field} /></FormControl>
             </FormItem>
          )}
        />
      )
    }
    ```

2.  **Register the Section:**
    Import the registry and your component, then register it. This can be done in an initialization file or a plugin entry point.
    ```ts
    import { ContactFormRegistry } from '@/lib/contacts/form/ContactFormRegistry'
    import { TelegramSection } from './TelegramSection'

    ContactFormRegistry.getInstance().register({
      id: 'telegram',
      component: TelegramSection,
      order: 110 // Choose an order
    })
    ```
