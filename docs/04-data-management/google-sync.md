---
title: Google Synchronization
sidebar_label: Google Sync
---

# Google Synchronization

Ari provides deep integration with Google Contacts, allowing you to keep your address book in sync across devices.

## Features

-   **Import**: Pull contacts from Google into Ari.
-   **Export (Sync on Update)**: Automatically push changes made in Ari back to Google.
-   **Group Sync**: Google Contact labels are imported as Groups in Ari.
-   **Avatar Sync**: Contact photos are imported.

## Configuration

To enable Google Synchronization, you need to authorize Ari to access your Google Contacts.

1.  Navigate to **Settings** -> **Import from Google**.
2.  Click **Authorize with Google**.
3.  Follow the prompts to grant access.

## Import Process

Once authorized, you can import your contacts:

1.  Click **Import Contacts**.
2.  (Optional) Toggle **Add to "google" group** to automatically tag all imported contacts.
3.  The import runs in the background. You will receive notifications as contacts are processed.

### Conflict Resolution
Ari uses a "smart merge" based on Google's unique Resource Name.
-   If a contact with the same Google ID exists, it updates the existing record.
-   If no match is found, a new contact is created.

## Sync on Update

You can configure Ari to push changes back to Google automatically.

1.  Navigate to **Settings** -> **General** (or Search for "Sync").
2.  Enable **Sync on Update**.
3.  **Note**: This requires an active authorization token. If the token expires, you may need to re-authorize.

## Field Mapping

The following table describes how data is mapped between Ari and Google Contacts.

| Ari Field | Google Field | Notes |
| :--- | :--- | :--- |
| **Name** | `names` | Given Name and Family Name are synced. |
| **Phones** | `phoneNumbers` | Value and Type (Mobile, Work, etc.) are synced. |
| **Emails** | `emailAddresses` | Value and Type are synced. |
| **Addresses** | `addresses` | Street, City, Region, Postcode, Country are synced. |
| **Organization** | `organizations` | Company, Title, Department, Job Description. |
| **Dates** | `birthdays`, `events` | Birthdays and Custom/Anniversary dates. |
| **Notes** | `biographies` | Stored as "Note" type in Ari. |
| **Groups** | `memberships` | Google Labels are mapped to Ari Groups. |
| **Avatar** | `photos` | Primary photo is imported. Updates from Ari are not pushed to Google Photos currently. |

:::info Limits
By default, the import is limited to the first **70 contacts** to prevent server overload on smaller instances. This limit can be configured by the administrator.
:::
