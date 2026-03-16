---
id: backup-restore
title: Backup and Restore
description: How to set up automated Restic backups and restore data for Ari.
---

# Backup and Restore

Ari uses [Restic](https://restic.net) for automated, encrypted backups.
The backup service is part of the optional monitoring stack (`compose.monitoring.yaml`) and
runs on a cron schedule inside a dedicated Docker container.

---

## Quick start: automated backups

### 1. Choose a Restic repository

Restic supports many storage backends. Common options:

| Backend | `RESTIC_REPOSITORY` value |
|---------|--------------------------|
| AWS S3 | `s3:s3.amazonaws.com/my-bucket/ari-backups` |
| Backblaze B2 | `b2:my-bucket:/ari-backups` |
| SFTP server | `sftp:user@host:/backups/ari` |
| Local path (bind-mounted) | `/repo` (mount the directory into the container) |

### 2. Configure `.env.prod`

```bash
RESTIC_REPOSITORY=s3:s3.amazonaws.com/my-bucket/ari-backups
RESTIC_PASSWORD=<long-random-passphrase>

# MariaDB only — omit these if you use SQLite (default)
# BACKUP_MARIADB_HOST=database
# BACKUP_MARIADB_USER=ari_user
# BACKUP_MARIADB_PASSWORD=your-db-password
# BACKUP_MARIADB_DB=ari_db
```

Generate a strong passphrase with:

```bash
openssl rand -base64 32
```

:::danger Save your passphrase
`RESTIC_PASSWORD` is the encryption key for all backups.
If you lose it, the backups are unrecoverable.
Store it in a password manager, not only in `.env.prod`.
:::

### 3. Start the stack

```bash
docker compose -f compose.prod.yaml -f compose.monitoring.yaml up -d
```

The backup container initialises the Restic repository automatically on first start.
The cron schedule runs at UTC times:

| Time (UTC) | Command | What it does |
|------------|---------|--------------|
| 02:00 | `backup.sh db` | Dumps the database and uploads to Restic |
| 02:30 | `backup.sh files` | Backs up the user file storage directory |
| 03:00 | `backup.sh prune` | Removes old snapshots per the retention policy |

### 4. Verify the first backup

Trigger a manual run and check the output:

```bash
docker compose -f compose.prod.yaml -f compose.monitoring.yaml \
  run --rm backup /backup.sh db

docker compose -f compose.prod.yaml -f compose.monitoring.yaml \
  run --rm backup restic snapshots
```

---

## Retention policy

Restic keeps snapshots following the Grandfather-Father-Son (GFS) rotation:

| Window | Snapshots kept |
|--------|---------------|
| Daily | Last 7 days |
| Weekly | Last 4 weeks |
| Monthly | Last 12 months |

At steady state this keeps approximately 23 snapshots, which for a typical Ari database (a few MB)
requires well under 1 GB of repository storage.

---

## Restore from backup

### List available snapshots

```bash
docker compose -f compose.prod.yaml -f compose.monitoring.yaml \
  run --rm backup restic snapshots
```

Example output:

```
ID        Time                 Host        Tags        Paths
─────────────────────────────────────────────────────────────
a1b2c3d4  2026-03-16 02:00:05  backup      db,sqlite   /tmp/dump_20260316_020005.sql.gz
e5f6a7b8  2026-03-16 02:30:11  backup      files       /app/core/var/storage
```

### Restore the database (SQLite)

```bash
# 1. Extract the dump from the snapshot to a local directory
docker compose -f compose.prod.yaml -f compose.monitoring.yaml \
  run --rm -v $(pwd)/restore:/restore backup \
  restic restore latest --tag db --target /restore

# 2. Decompress
gunzip restore/tmp/dump_*.sql.gz

# 3. Stop the app to avoid concurrent writes
docker compose -f compose.prod.yaml stop app

# 4. Import the dump into SQLite
docker compose -f compose.prod.yaml run --rm app \
  bash -c "sqlite3 /app/core/var/data.db < /restore/tmp/dump_*.sql"

# 5. Restart
docker compose -f compose.prod.yaml start app
```

### Restore the database (MariaDB)

```bash
# 1. Extract
docker compose -f compose.prod.yaml -f compose.monitoring.yaml \
  run --rm -v $(pwd)/restore:/restore backup \
  restic restore latest --tag db --target /restore

# 2. Decompress
gunzip restore/tmp/dump_*.sql.gz

# 3. Import
docker compose -f compose.prod.yaml exec database \
  bash -c "mysql -u root -p\$MARIADB_ROOT_PASSWORD ari_db < /path-to/dump.sql"
```

### Restore user files

```bash
docker compose -f compose.prod.yaml -f compose.monitoring.yaml \
  run --rm -v $(pwd)/restore:/restore backup \
  restic restore latest --tag files --target /restore

# Copy restored files back to the app_data volume
docker run --rm \
  -v $(pwd)/restore/app/core/var/storage:/src:ro \
  -v ari-prod_app_data:/dst \
  alpine cp -r /src /dst/storage
```

---

## Verify a backup

Use `restic check` to verify repository integrity and `restic restore --dry-run` to confirm a
specific snapshot is readable:

```bash
# Check repository integrity (reads all pack files)
docker compose -f compose.prod.yaml -f compose.monitoring.yaml \
  run --rm backup restic check --read-data

# Dry-run restore of the latest db snapshot (no files written)
docker compose -f compose.prod.yaml -f compose.monitoring.yaml \
  run --rm backup restic restore latest --tag db --target /dev/null --dry-run
```

---

## Monthly restore test procedure

Automated backups are only as good as your last successful restore.
Perform a full test restore monthly:

1. Spin up a separate Ari instance (use `docker compose up` on a spare VM or locally).
2. Follow the "Restore from backup" steps above against that instance.
3. Log in and verify a sample of contacts, files, and settings look correct.
4. Destroy the test instance.

Document the date and outcome in your operations runbook.

---

## XML backup (user level)

In addition to operator-level Restic backups, individual users can export their own data:

1. Go to **Settings → Data**.
2. Click **Export All Data**.
3. Save the `contacts_export.xml` file.

This export is suitable for:
- Migrating a single user to another instance.
- User-driven snapshots before a major cleanup.
- Development and testing.

[Read more about importing and exporting data](../04-data-management/import-export.md)
