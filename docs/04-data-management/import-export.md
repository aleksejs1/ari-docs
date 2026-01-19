---
title: Import & Export
sidebar_label: Import / Export
---

# Import & Export

Ari provides robust tools for data portability, allowing you to back up your data or migrate between instances.

## XML Export (Full Backup)

You can export your entire dataset, including contacts, groups, and relations, into a single XML file.

### How to Export
1.  Navigate to **Settings** -> **Data**.
2.  Scroll to the **Export** section.
3.  Click **Export All Data (XML)**.
4.  Your browser will download a `contacts_export.xml` file.

### Data Structure
The export file follows this schema:
```xml
<ari_export>
  <groups>
    <group>...</group>
  </groups>
  <contacts>
    <contact>...</contact>
  </contacts>
</ari_export>
```

## XML Import

You can restore data from an Ari XML export file.

### How to Import
1.  Navigate to **Settings** -> **Data**.
2.  Scroll to the **Import** section.
3.  Click **Import Data**.
4.  Select your `.xml` file.

### Import Logic
-   **Identity Match**: The system tries to match records by their UUID.
-   **Merge Strategy**:
    -   If a contact with the same UUID exists, fields are merged.
    -   Collections (phones, emails) are synchronized (items missing in the XML but present in the DB might be removed or preserved depending on the exact sync logic version, but generally it attempts a smart sync).
    -   **Relations**: Relationships between contacts are restored after all contacts are created.

## Account Deletion

You can permanently delete your account and all associated data.

1.  Navigate to **Settings** -> **Account Management** (or "Delete Account").
2.  Review the warning. **This action is irreversible.**
3.  Confirm the deletion.
4.  All your data (Contacts, Groups, Logs, Preferences) will be immediately removed from the database.
