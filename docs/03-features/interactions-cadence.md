---
title: Interaction Tracking & Keep in Touch
sidebar_label: Interactions & Cadence
sidebar_position: 3
---

# Interaction Tracking & Keep in Touch

Ari lets you record every conversation, call, or meeting you have with a contact and set a personal reminder to stay in touch at a regular interval. This turns your address book into an active relationship management tool.

---

## Logging an Interaction

An **interaction** is any communication event between you and a contact. Open a contact's detail page and scroll to the **Keep in Touch** card, then click **Log Interaction**.

Each interaction has the following fields:

| Field | Description |
|---|---|
| **Type** | `Call`, `Email`, `Meeting`, or `Other` |
| **Date** | When the interaction took place (defaults to today) |
| **Initiator** | Who reached out — *I reached out* or *They reached out* (optional) |
| **Description** | Free-text notes about the conversation (optional) |
| **Tags** | Comma-separated labels such as `business`, `follow-up`, `fundraising` (optional, max 20 tags) |

After saving, the interaction appears in the **timeline** on the contact's detail page, sorted newest first. The most recent 10 interactions are shown by default.

### Editing and Deleting Interactions

Each timeline entry has an **edit** (pencil) button and a **delete** (trash) button. Clicking delete shows an inline confirmation before the record is removed.

---

## Setting a Cadence (Keep in Touch Reminder)

A **cadence** is a personal target interval — "I want to speak to this person at least every N days." It is set per contact and is only visible to you.

To set a cadence, click the **Set cadence…** link below the section title on the contact detail page. Enter a number of days (e.g. `30` for monthly, `90` for quarterly) and press the checkmark to save. Click the displayed interval at any time to edit or clear it.

When a cadence is set:

- The **Keep in Touch** section header shows how many days overdue the contact is (e.g. **5 days overdue**) as a red badge, once the interval has elapsed since the last interaction.
- If no interactions have been logged yet, the contact is considered immediately overdue by the full cadence value.

To remove a cadence, open the editor and clear the field, then save.

---

## Needs Attention: Catch Up Widget

The **Catch Up** dashboard widget shows up to 7 contacts that are currently overdue based on their cadence. For each contact it displays:

- The contact's name (links to their detail page)
- When the last interaction was (relative time, e.g. *3 months ago*), or *Never* if none
- How many days overdue they are
- A **Log Interaction** button that opens the interaction drawer directly from the widget, without navigating away

The widget footer shows a **View all overdue contacts** link that opens the contacts table pre-filtered to all overdue contacts.

To add the Catch Up widget to your dashboard, open the **Customize** panel (gear icon) and enable it.

---

## Overdue Contacts in the Contacts Table

The contacts table includes two optional columns that are hidden by default:

| Column | Description |
|---|---|
| **Last Interaction** | Relative time since the most recent interaction. Color-coded: green (< 70 % of cadence elapsed), yellow (70–99 %), red (≥ 100 % or overdue). Grey when no cadence is set. |
| **Cadence** | The configured interval in days, or `—` if not set |

To show these columns, click the **column variants** button (grid icon) in the contacts toolbar and enable them from the Display Settings panel.

---

## Filtering to Overdue Contacts

Clicking **View all overdue contacts** in the Catch Up widget (or navigating to `/contacts?needsAttention=true`) filters the contacts table to show only contacts with a cadence set whose last interaction is past due. The filter applies globally across all groups and search terms.

---

## API

Interactions are accessible via the standard REST API:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/contacts/{id}` | Contact response includes `contactInteractions[]` (max 200) and `cadenceDays` |
| `POST` | `/api/contact_interactions` | Create an interaction |
| `PATCH` | `/api/contact_interactions/{id}` | Update an interaction (merge-patch) |
| `DELETE` | `/api/contact_interactions/{id}` | Delete an interaction |
| `PATCH` | `/api/contacts/{id}` | Set or clear `cadenceDays` |
| `GET` | `/api/contacts/needs-attention` | Paginated list of overdue contacts with `lastInteractionAt` and `overdueDays` |

All endpoints require JWT authentication and are scoped to the authenticated user's data.
