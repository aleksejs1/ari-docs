---
id: backup-restore
title: Backup and Restore Strategy
description: How to backup and restore the database and user data.
---

# Backup and Restore Strategy

## Database Backup (Docker)
The primary method for backing up Ari is to snapshot the database volume or dump the SQL database.

```bash
docker exec ari-db-1 mysqldump -u root -p ari_db > backup.sql
```


## File Backup (Local Storage)

When configured with `STORAGE_TYPE=local` (default), uploaded files are stored on the local filesystem. You should backup these directories to preserve user uploads and avatars.

### Storage Locations

| Content Type | Application Path | Description |
| :--- | :--- | :--- |
| **Files** | `%kernel.project_dir%/var/storage/default` | General file attachments and documents. |
| **Avatars** | `%kernel.project_dir%/public/uploads/avatars` | User and contact profile pictures.  |

> **Note:** `%kernel.project_dir%` usually refers to the root `core/` directory of the application.

### Backup Strategy

To backup these files, simply copy the directories to a secure location.

```bash
# Example: Backing up file storage
cp -r core/var/storage/default /backup/path/storage

# Example: Backing up avatars
cp -r core/public/uploads/avatars /backup/path/avatars
```

## XML Backup (User Level)

Users can generate their own backups via the Web Client.
1.  Go to **Settings** -> **Data**.
2.  Select **Export All Data**.
3.  Save the `contacts_export.xml` file.

This method is ideal for:
-   Migrating a specific user to a new instance.
-   User-driven snapshots before major cleanup.
-   Development testing.

[Read more about Exporting](../04-data-management/import-export.md)
