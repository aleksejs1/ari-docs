---
id: docker-setup
title: Docker & NAS Setup
sidebar_label: Docker Setup
---

# Docker & NAS Setup

This guide explains how to deploy Ari CRM in a production-ready environment using the optimized **FrankenPHP** setup.

## Prerequisites

- **Docker** and **Docker Compose** installed.
- **Port 8080** (or your chosen port) available.
- **MariaDB/MySQL** (optional, opt-in).

---

## 1. Database Configuration

Ari CRM supports two database modes: **SQLite** (default) and **MySQL/MariaDB**.

### Option A: SQLite (Default)
**Best for:** Personal use, small teams, simplest setup.
- Zero configuration required.
- Data stored in `core/var/data.db`.
- No additional database container running.

### Option B: MySQL / MariaDB (Opt-out)
**Best for:** Larger datasets, high concurrency, existing infrastructure.
- Requires enabling the `mysql` Docker profile.
- Uses a separate `database` container.
- Requires configuration in `.env`.

---

## 2. Prepare Environment Variables

Use the provided helper script or manually create a `.env` file.

**Option A: Automatic Setup (Recommended)**
```bash
./setup_prod.sh
```

**Option B: Manual Setup**
1. Create a `.env` file from `.env.prod.example`.
2. **If using MySQL**: Uncomment and fill in `DB_CONNECTION=mysql`, `COMPOSE_PROFILES=mysql` and the `MARIADB_` variables.
3. **If using SQLite**: You can leave the database variables commented out or remove them; it defaults to SQLite.

---

## 3. Build and Start the Containers

### For SQLite (Default)
```bash
docker compose -f compose.prod.yaml up -d --build
```

### For MySQL
You need to activate the `mysql` profile and ensure `DB_CONNECTION=mysql` is set in your environment (or `.env` file).

```bash
# Set env var for this session or add to .env
export COMPOSE_PROFILES=mysql
docker compose -f compose.prod.yaml up -d --build
```

### What happens automatically:
- **JWT Keys**: Generated on the first run.
- **Database**: 
    - **SQLite**: The database file is created and schema updated automatically.
    - **MySQL**: Migrations are applied automatically.
- **Frontend/Backend**: Served via FrankenPHP on the configured port.

---

## 4. Access the Application

Open your browser and navigate to:
`http://<your-nas-ip>:8080` (or your custom port)

---

## Maintenance and Updates

### Pulling Updates
```bash
git pull
# Re-run the start command appropriate for your DB choice
docker compose -f compose.prod.yaml up -d --build
```

### Viewing Logs
```bash
docker compose -f compose.prod.yaml logs -f app
```

### Backup
**SQLite**:
- Backup the `core/var/data.db` file.

**MySQL**:
- Backup the `database_data` volume or use `mysqldump`.

---

## Background Tasks

The application runs periodic tasks via `cron` inside the main application container (Notification Generation & Processing).

### Monitoring Tasks:
```bash
docker exec ari-prod-app tail -f /app/core/var/log/cron.log
```
