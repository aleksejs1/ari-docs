```
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
```
