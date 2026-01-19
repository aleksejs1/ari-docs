---
title: Google Contacts Import Architecture
sidebar_label: Google Import
---

# Google Contacts Import Architecture

The Google Contacts import process is designed to handle large datasets efficiently by leveraging Symfony Messenger for asynchronous processing.

## Overview

1.  **User Request**: User triggers import via API.
2.  **Groups Pre-warm**: `GoogleContactsService` fetches and creates all Google Contact Groups synchronously. This ensures foreign keys exist before parallel workers start.
3.  **Dispatcher Loop**: The service iterates over Google's `connections` API using pagination.
    -   Optimization: Requests only `personFields=metadata` to get the `resourceName`.
    -   Action: Dispatches a `ImportGoogleContactMessage` for each contact.
4.  **Async Worker**: `ImportGoogleContactHandler` processes messages from the queue.
    -   Fetches full contact data (names, phones, etc.) for that single contact.
    -   Resolves Group association (checking DB first, fallback to API).
    -   Saves/Updates contact via `ContactImportService`.

## Running Workers

To process the import queue:

```bash
php bin/console messenger:consume async
```

## Configuration

Top limit is controlled by `GOOGLE_CONTACTS_IMPORT_LIMIT` in `.env`.

## Field Mapping

The following table details the technical mapping between Ari Entities and Google People API resources.

| Ari Entity (`Contact`) | Google Resource (`person`) | Sync Direction | Notes |
| :--- | :--- | :--- | :--- |
| `ContactName` | `names` | Bidirectional | Maps `givenName` and `familyName`. |
| `ContactPhoneNumber` | `phoneNumbers` | Bidirectional | Maps `value` and `type` (canonicalized). |
| `ContactEmailAdress` | `emailAddresses` | Bidirectional | Maps `value` and `type`. |
| `ContactAddress` | `addresses` | Bidirectional | Full address structure (Street, City, Zip, Country). |
| `ContactOrganization` | `organizations` | Bidirectional | `name` (Company), `title`, `department`, `jobDescription`. |
| `ContactDate` | `birthdays`, `events` | Bidirectional | `birthdays` for date-only birthdays. `events` for other types. |
| `ContactBiography` | `biographies` | Bidirectional | Mapped to `value` with `contentType='TEXT_PLAIN'`. |
| `ContactGroup` | `memberships` | Bidirectional | Resolved via `ImportMapping` lookup (Google Label ID to Group ID). |
| `ContactAvatar` | `photos` | Import Only | Downloaded from `url` if `metadata.primary` is true. |
