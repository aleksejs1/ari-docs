---
title: Phone Backup Import
sidebar_label: Phone Backup Import
---

# Phone Backup Import

Ari can import your call and SMS history from **SMS Backup & Restore** — the most popular Android backup app — and turn it into `ContactInteraction` records on the contact timeline.

---

## What is imported

| Data | Result in Ari |
|---|---|
| SMS messages | One **Message** interaction per contact per calendar day (UTC). The description shows the total count: "3 messages (2 received, 1 sent)". |
| Calls (answered, outgoing, missed, rejected) | One **Call** interaction per call record. The description shows direction and duration: "Incoming call, 36 sec". |

### What is skipped

- **MMS** — multimedia messages are not imported (only `<sms>` elements are read).
- **Service senders** — alphanumeric sender IDs like "Google", "Tele2", or "BANK" are skipped by default (they cannot be matched to a contact). You can disable this with the *Skip service senders* option.
- **Unmatched numbers** — if a phone number in the backup has no matching contact in Ari, the record is skipped by default. You can create new contacts for them with the *Unknown contacts* option.

---

## How to export from SMS Backup & Restore

1. Open **SMS Backup & Restore** on your Android device.
2. Tap **Back Up Now** (or tap the three-dot menu → **Back Up**).
3. Choose **SMS Messages** and/or **Call Log**.
4. After the backup completes, locate the XML files — they are typically saved in the `SMSBackupRestore` folder on your internal storage.
5. Transfer the files to your computer (`sms-YYYY-MM-DD.xml` and/or `calls-YYYY-MM-DD.xml`).

---

## Import options

Navigate to **Settings → Data** and scroll to the **Phone Backup Import** section.

### Unknown contacts

What to do when a phone number in the backup has no matching contact in Ari.

| Option | Behaviour |
|---|---|
| **Skip** (default) | The record is counted as skipped. No new contacts are created. |
| **Create new contact** | A new contact is created with the phone number and (if available) the name from the backup. The contact quota applies — creation stops silently if the limit is reached. |

### Name conflict

What to do when a matched contact's name in Ari differs from the name stored in the backup file. Only relevant when Unknown contacts = *Create new contact* or when the import updates names of matched contacts.

| Option | Behaviour |
|---|---|
| **Keep existing name** (default) | The contact name in Ari is not changed. |
| **Add as alternative name** | The backup name is added as a second name alongside the existing one. |
| **Replace with backup name** | The primary name is updated to the backup name. |

### Skip service senders

When checked (default), records from alphanumeric sender IDs (e.g. "Google", "Tele2", "BANK") are silently skipped. Uncheck this only if you have genuine contacts whose SMS sender ID is a word rather than a phone number.

### Duplicate handling

| Option | Behaviour |
|---|---|
| **Skip duplicates** (default) | If a `ContactInteraction` with the same type and timestamp (within ±1 second) already exists for the contact, the record is skipped. Safe to re-import the same backup multiple times. |
| **Allow duplicates** | Every record creates a new interaction even if one already exists. Use this only after manually deleting interactions you want to re-create. |

---

## Result notification

After clicking **Import**, the file is submitted immediately and a background job is queued. You will receive an in-app notification (bell icon) when processing is complete. The notification includes a summary:

> Imported 12 calls, 5 SMS threads, 0 new contacts. 3 records skipped.

The import typically completes within a few seconds for files up to a few thousand records.

---

## Troubleshooting

### My contact wasn't matched

**Cause:** The phone number stored in Ari does not match the number in the backup file after normalisation.

Ari strips all non-digit characters before comparing numbers, so `+371 29 837 434`, `37129837434`, and `+37129837434` all match. However, a number stored as `29837434` (local format, no country code) will **not** match `+37129837434` (international format).

**Fix:** Edit the contact's phone number in Ari to use the full international format and re-import.

### The import seems slow

Normal behaviour — processing is asynchronous. Large backup files (thousands of records) may take 10–30 seconds. The notification bell will light up when done.

### I see "Import failed" with no detail

The backup file may be corrupt, use an unsupported encoding, or have a root element other than `<smses>` or `<calls>`. Ensure the file was exported directly by SMS Backup & Restore and has not been manually edited.

---

## Developer Notes

### Architecture

The import pipeline is fully asynchronous:

1. `POST /api/sms_backup/import` (multipart, field `files[]`, max 2 XML files)
   → validates file type, queues `SmsBackupImportMessage`, returns `202 { status: 'queued' }`
2. `SmsBackupImportMessageHandler` dispatches to `SmsBackupImportService`
3. `SmsBackupParserService` streams the XML with `XMLReader` (no DOM load → safe for large files)
4. `ContactPhoneNumberRepository::buildPhoneMapForTenant()` builds a `normalizedPhone → contactId` map via DQL
5. SMS records are grouped by (contact, UTC day) → one `ContactInteraction` per group
6. Call records create one `ContactInteraction` per call
7. Deduplication via `ContactInteractionRepository::findDeduplicationKeysByContactIds()`
8. `ContactInteractionListener` (Doctrine `prePersist` + `postFlush`) updates `Contact::lastInteractionAt` in bulk at the end of the flush

### XML security

The parser uses `LIBXML_NONET` (disables network access) and `SUBST_ENTITIES=false` (no entity substitution). **Never remove these flags** — they protect against XXE (XML External Entity) injection attacks.

### Phone number normalization

Both the phone map builder and the parser normalize numbers with `preg_replace('/\D/', '', $phone)`. Numbers stored in Ari in local format (e.g. `29837434`) will not match international format numbers from the backup (`+37129837434`). Users must store numbers in international format.

### Adding a new interaction type

To add a support for a new backup format (e.g. WhatsApp), implement a new parser implementing the same parse-and-yield approach as `SmsBackupParserService`, add the new file type to the upload handler, and register a new `SmsBackupImportMessage` variant. Do not modify the existing parser.

### Relevant classes

| Class | Location | Responsibility |
|---|---|---|
| `SmsBackupController` | `src/Controller/` | Receives multipart upload, queues message |
| `SmsBackupParserService` | `src/Service/` | Streaming XML parser |
| `SmsBackupImportService` | `src/Service/` | Orchestrates phone map, dedup, persist |
| `SmsBackupImportMessage` | `src/Message/` | Messenger message DTO |
| `SmsBackupImportMessageHandler` | `src/MessageHandler/` | Calls service, sends in-app notification |
| `ContactPhoneNumberRepository` | `src/Repository/` | `buildPhoneMapForTenant()` DQL query |
