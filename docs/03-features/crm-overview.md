---
title: Features Overview
sidebar_label: Overview
---

# Features Overview

Ari is a feature-rich Personal CRM designed to help you manage your relationships with privacy and flexibility.

## Core Contact Management

At the heart of Ari is a powerful contact management system that goes far beyond a simple address book.

-   **Rich Data Model**: Store unlimited **Names**, **Phones**, **Emails**, **Addresses**, and **Biographies** for each contact.
-   **Organizations**: Track professional history with **Companies**, **Departments**, **Titles**, and employment dates.
-   **Special Dates**: Never forget a Birthday, Anniversary, or any custom date important to you.
-   **Relationships**: Define and track how people know each other (Spouse, Colleague, Friend) to build a true network.
-   **Groups**: Organize contacts into flexible groups for easier management and filtering.

### Visualization
-   **Contact Graph**: Visualize your network with an interactive force-directed graph showing connections between people.
-   **Customizable Tables**: Toggle columns, reorder them, and sort the contact list to show exactly what you need.

### Interaction Tracking & Keep in Touch

Ari records every call, email, or meeting you have with a contact and reminds you to stay in touch at a regular interval.

-   **Interaction Log**: Log any communication event — type, date, who reached out, notes, and free-form tags. The full history appears in a timeline on the contact detail page.
-   **Cadence**: Set a personal "keep in touch every N days" target per contact. A red badge appears on the contact when the interval has elapsed.
-   **Catch Up Widget**: A dashboard widget surfaces up to 7 overdue contacts with a one-click **Log Interaction** button so you can catch up without leaving the dashboard.
-   **Table Columns**: Optional **Last Interaction** (color-coded by cadence ratio) and **Cadence** columns are available in the contacts table, hidden by default.

See [Interaction Tracking & Keep in Touch](./interactions-cadence.md) for the full guide.

### Relationship Playbooks

Playbooks turn intentions into actions by attaching a goal-driven task schedule to any contact.

-   **Goals**: Choose from Maintain, Deepen, Reignite, Rekindle, or Appreciate to set the direction.
-   **Presets**: Pick a named plan that matches your goal — the system generates concrete tasks (calls, date nights, surprises, check-ins) at the right cadence.
-   **Reflections**: After completing an offline task (call, visit), a reflection prompt captures how it went.
-   **Reciprocity Indicator**: A 90-day interaction balance shows whether you or the contact initiates contact more often.
-   **Seasonal Check-in**: A quarterly banner reminds you to review your active Playbooks.

See [Relationship Playbooks](./relationship-playbooks.md) for the full guide.

### Column Variants

Beyond the standard columns, you can add **type-scoped columns** to surface specific sub-fields directly in the table.

Click the **column variants button** (grid icon) in the contacts toolbar to open the Display Settings panel:

-   **Names** — Add a column for each name locale (e.g. "Name in ru", "Name in en"), useful when contacts have transliterated or multilingual names.
-   **Phone numbers** — Add a column per phone type (mobile, work, home) to compare numbers side by side.
-   **Email addresses** — Add a column per email type (personal, work) for the same effect.
-   **Dates** — Add a column per date label (Birthday, Anniversary, or any custom label you use).

Each typed column shows the **first matching value** for that contact, or `—` if the contact has no value of that type.

Typed columns appear immediately after their parent column and persist across page reloads.

### Card View

Switch between **table** and **card** layout using the toggle button next to the column variants button. On screens narrower than 768 px, the card layout is always active regardless of the toggle.

Card view is recommended when you have many typed columns enabled, as it avoids horizontal scrolling and keeps all contact details visible at a glance. Typed column values appear at the bottom of each card.

## Integrations

Your data shouldn't be trapped in a silo.

-   **Google Contacts Sync**:
    -   **Import**: Pull your existing Google Contacts and Labels immediately.
    -   **Two-Way Sync**: Automatically push updates from Ari back to Google (requires "Sync on Update" enabled).
-   **Data Portability**:
    -   **XML Export**: Full backup of your database structure.
    -   **XML Import**: Restore backups or migrate between instances smoothly.
-   **Phone Backup Import**:
    -   **SMS & Call History**: Import call logs and SMS threads from **SMS Backup & Restore** (Android) as contact interaction records.
    -   **Automatic Matching**: Phone numbers are normalised and matched to existing contacts; optionally create new contacts for unknown numbers.

## Productivity & Dashboard

The dashboard provides an at-a-glance view of your personal network health, and it is fully customizable.

-   **Widgets**:
    -   **Upcoming Anniversaries**: See birthdays and events happening in the next 30 days.
    -   **Recent Logins**: View your recent login activity.
    -   **Recent Activity**: Track the latest updates to your contacts.
    -   **Statistics**: View total contacts and system usage.
    -   **Groups**: Quick access to your top contact groups.
-   **Customization**:
    -   **Toggle Widgets**: Show or hide individual widgets from the Customize panel.
    -   **Reorder**: Drag and drop widgets to arrange them in the order you prefer.
    -   **Move Between Zones**: Drag widgets between layout zones (e.g., from the left column to the right).
    -   **Layout Presets**: Choose from Single Column, Two Columns, Three Columns, or Sidebar Right layouts.
    -   **Persistent**: Your dashboard configuration is saved automatically and syncs across sessions.

## Notifications

Stay informed on the channels you actually use.

-   **Multi-Channel**: Receive alerts via **Web**, **Telegram**, or **Email**.
-   **Flexible Rules**: Configure exactly *what* you want to hear about (e.g., "Notify me on Telegram only for Family birthdays").

## Customization & User Experience

Make Ari your own.

-   **Dashboard**: Fully customizable with drag-and-drop widget reordering, zone-based layouts, and multiple layout presets.
-   **Themes**: Switch between **Dark** and **Light** modes.
-   **Localization**: Fully translated in **English** and **Russian**.
-   **Preferences**: Customize Date & Time formats and Privacy settings (like hiding the logo for screenshots).

## Security & Audit

Built for privacy and control.

-   **Audit Logs**: Every change is tracked. View a complete history of *who* changed *what* and *when*, with detailed before/after snapshots.
-   **Point-in-Time Snapshots**: Click any event in a contact's timeline to see the complete state of the contact at that moment — including all names, phones, emails, dates, and other details as they were at the time.
-   **Session Control**: View and revoke active sessions from any device.
