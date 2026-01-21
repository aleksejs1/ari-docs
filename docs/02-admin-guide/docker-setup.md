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

---

## 1. Choose Installation Method

### Option A: Docker Hub (Recommended for NAS)
**Best for:** NAS (Synology, QNAP, Unraid), Home Servers, Quick Setup.
- No need to clone git repository.
- Single `docker-compose.yml` file.
- Automatic updates via Watchtower (optional).

### Option B: From Source (SQLite)
**Best for:** Developers, Contributors, Custom Builds.
- Requires cloning the repository.
- Full access to source code and configuration files.

### Option C: From Source (MySQL / MariaDB)
**Best for:** High Concurrency, Large Deployments.
- Requires cloning the repository.
- Uses external database container.

---

## 2. Installation Steps

### Option A: Docker Hub Setup (Fastest)

1. Create a folder on your server/NAS (e.g., `/volume1/docker/ari`).
2. Create a `docker-compose.yml` file with the following content:

```yaml
services:
  ari:
    image: aleksejs0/ari-app:latest
    container_name: ari
    restart: unless-stopped
    environment:
      - APP_ENV=prod
    volumes:
      - ./data:/app/core/var
    ports:
      - "8080:8080"
```

3. Start the container:
```bash
docker compose up -d
```

**Alternative: Docker Run (No Compose)**
If you prefer a single command line:
```bash
docker run -d \
  --name ari \
  --restart unless-stopped \
  -p 8080:8080 \
  -e APP_ENV=prod \
  -v $(pwd)/data:/app/core/var \
  aleksejs0/ari-app:latest
```

### Option B: From Source (SQLite)

1. Clone the repository:
   ```bash
   git clone https://github.com/aleksejs1/ari.git
   cd ari
   ```
2. Run the setup script:
   ```bash
   ./setup_prod.sh
   ```
3. Start the containers:
   ```bash
   docker compose -f compose.prod.yaml up -d --build
   ```

### Option C: From Source (MySQL)

1. Clone the repository and run setup as in Option B.
2. Edit `.env` file and uncomment MySQL settings:
   ```env
   DB_CONNECTION=mysql
   # fill in DB details
   ```
3. Enable MySQL profile and start:
   ```bash
   export COMPOSE_PROFILES=mysql
   docker compose -f compose.prod.yaml up -d --build
   ```

---

## 3. What Information is Stored?

By default (Option A & B), all your data includes:
- **Database**: SQLite file stored in `./data/data.db` (Option A) or `core/var/data.db` (Option B).
- **Logs**: Application logs.

**Backup Strategy:**
Simply back up the mapped volume folder (e.g., `./data` or `core/var`).

---

## 4. Access the Application

Open your browser and navigate to:
`http://<your-nas-ip>:8080` (or your custom port)

---

## Maintenance

### Updating (Option A)
```bash
docker compose pull
docker compose up -d
```

### Viewing Logs
```bash
docker logs -f ari
```

## Background Tasks

The application runs periodic tasks via `cron` inside the main application container (Notification Generation & Processing).

### Monitoring Tasks:
```bash
docker exec ari tail -f /app/core/var/log/cron.log
```
