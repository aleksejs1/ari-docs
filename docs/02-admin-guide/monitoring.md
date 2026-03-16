---
id: monitoring
title: Monitoring
description: How to set up the optional Prometheus + Grafana + Loki monitoring stack for Ari.
---

# Monitoring

Ari ships an optional monitoring stack as a second Compose file (`compose.monitoring.yaml`).
When activated it adds Prometheus, Grafana, Loki, Grafana Alloy, AlertManager, and Node Exporter
alongside the main application — all communicating over an internal Docker network that is not
reachable from the internet.

---

## Quick start

### 1. Prerequisites

The monitoring stack layers on top of the production Compose file.
Make sure `compose.prod.yaml` is already working before adding monitoring.

### 2. Generate secrets

```bash
# Prometheus scrape token
openssl rand -hex 32         # → METRICS_SECRET

# Grafana admin password (must not be the string "admin")
openssl rand -base64 16      # → GRAFANA_ADMIN_PASSWORD
```

### 3. Configure `.env.prod`

Add the following variables to your existing `.env.prod` file:

```bash
# Prometheus scrape secret
METRICS_SECRET=<output of openssl above>

# Grafana
GRAFANA_ADMIN_PASSWORD=<output of openssl above>

# AlertManager — Telegram alerts (optional; leave empty to skip alerts)
ALERTMANAGER_TELEGRAM_BOT_TOKEN=
ALERTMANAGER_TELEGRAM_CHAT_ID=
```

### 4. Start the stack

```bash
docker compose -f compose.prod.yaml -f compose.monitoring.yaml up -d
```

### 5. Access Grafana

Open **http://your-server:3000** in a browser.
Login with username `admin` and the `GRAFANA_ADMIN_PASSWORD` you set above.

The **Ari Overview** dashboard is pre-provisioned and visible immediately.

:::warning Do not expose port 3000 publicly
Bind Grafana to `127.0.0.1:3000` or put it behind a VPN/Caddy reverse proxy with TLS and
authentication before exposing it to the internet.
:::

---

## What is monitored

### Application health

| Signal | Source | How collected |
|--------|--------|---------------|
| Container up/down | Prometheus `up` metric | Prometheus scrapes `/metrics` every 30 s |
| Business metrics | `GET /metrics` (PHP) | Prometheus → `X-Metrics-Token` header |
| Host CPU / memory / disk | Node Exporter | Prometheus scrapes `:9100` |
| Container logs | Grafana Alloy | Alloy tails Docker log sockets → Loki |
| Backup success | Textfile collector | `backup.sh` writes `.prom` sentinel → Node Exporter |

### Business metrics exposed at `/metrics`

| Metric | Description |
|--------|-------------|
| `ari_messenger_queue_depth{transport}` | Current number of pending messages in each Messenger queue |
| `ari_failed_messages_total` | Total messages in the dead-letter queue |
| `ari_ai_suggestions_total{status}` | AI suggestion counts by status (pending/accepted/dismissed) |
| `ari_notification_deliveries_total{channel,status}` | Notification delivery counts by channel and status |
| `ari_active_tenants_total` | Number of users with at least one contact |
| `ari_new_tenants_24h` | New registered users in the last 24 hours |
| `ari_failed_logins_24h` | Failed login attempts in the last 24 hours |

---

## Alert runbook

Ten alert rules are pre-configured in `monitoring/prometheus/rules/ari.yml`.

### AriDown

**Condition:** `up{job="ari"} == 0` for 2 minutes.
**Meaning:** The application container is not responding to Prometheus scrapes.
**Response:** Check `docker compose logs app`; restart the container if it has crashed; check disk space if OOM-killed.

### AsyncQueueDepth

**Condition:** `async` Messenger queue depth > 500 for 10 minutes.
**Meaning:** Background jobs (Google Contacts import, notification dispatch) are backed up.
**Response:** Check `docker compose logs app` for worker errors; ensure `php bin/console messenger:consume` is running (it starts automatically in the app container); restart the container if workers are stuck.

### AiAsyncQueueDepth

**Condition:** `ai_async` Messenger queue depth > 500 for 10 minutes.
**Meaning:** AI suggestion generation is backed up.
**Response:** Same as AsyncQueueDepth. If the AI provider is down, the queue will drain once it recovers — no manual intervention needed unless messages are also appearing in the dead-letter queue.

### DeadLetterMessages

**Condition:** `ari_failed_messages_total > 0` for 5 minutes.
**Meaning:** At least one Messenger message has been retried and permanently failed.
**Response:** Run `php bin/console messenger:failed:show` to inspect failures; `messenger:failed:retry` to retry; `messenger:failed:remove` to discard. Address the root cause before retrying.

### DiskSpaceLow / DiskSpaceCritical

**Condition:** Root filesystem free space below 20% (warning) or 10% (critical).
**Meaning:** Disk is filling up — could cause database write failures or backup failures.
**Response:** Check `docker system df`; prune old images with `docker image prune -a`; expand the volume or add disk; verify Restic backups are pruning correctly.

### MemoryHigh

**Condition:** Available memory below 15% for 15 minutes.
**Meaning:** The host is under sustained memory pressure.
**Response:** Identify the highest memory consumer with `docker stats`; consider upgrading the host or reducing the number of PHP-FPM workers.

### BackupMissed

**Condition:** Last backup sentinel timestamp is more than 26 hours old (or no sentinel exists).
**Meaning:** The automated Restic backup did not run or did not complete successfully.
**Response:** Check `docker compose logs backup`; verify `RESTIC_REPOSITORY` and `RESTIC_PASSWORD` are set correctly; test connectivity to the repository with `docker compose run --rm backup restic snapshots`.

### HighFailedLogins

**Condition:** More than 50 failed login attempts in 1 hour.
**Meaning:** Possible brute-force attack.
**Response:** Review server access logs; consider blocking the offending IP ranges at the firewall or via Caddy's `rate_limit` directive.

### AIProviderErrors

**Condition:** AI suggestion error rate > 0.5 errors/minute for 10 minutes.
**Meaning:** The configured LLM provider is returning errors consistently.
**Response:** Check the AI provider status page; rotate the API key if suspected compromised; the queue will drain once the provider recovers.

---

## Accessing the health endpoint

The `GET /api/health` endpoint is public (no authentication required) and returns application status:

```json
{
  "status": "ok",
  "version": "1.2.0",
  "checks": {
    "database": "ok",
    "messenger_async": "ok",
    "messenger_ai_async": "warn"
  }
}
```

| `status` | HTTP code | Meaning |
|----------|-----------|---------|
| `ok` | 200 | All checks healthy or warn |
| `degraded` | 503 | At least one check returned `error` |

Check statuses: `ok` (healthy) · `warn` (queue 500–999 messages) · `error` (queue ≥ 1000 or DB unreachable).

This endpoint is suitable for use as an uptime monitor target (e.g. UptimeRobot, BetterStack).

---

## Grafana dashboard tour

### Ari Overview

Located under **Dashboards → Ari Overview** in the Grafana sidebar.

| Panel | What it shows |
|-------|---------------|
| Queue Depth | Time-series of `async` and `ai_async` queue depths |
| Dead-letter Messages | Total count of permanently failed messages (stat panel) |
| Active Tenants | Number of users who have at least one contact |
| New Tenants (24 h) | New signups in the last 24 hours |
| AI Suggestions by Status | Time-series breakdown of pending / accepted / dismissed suggestions |
| Failed Logins (24 h) | Failed login count as a single-value stat |

### Log Explorer

Use **Explore → Loki** to query container logs. Useful label selectors:

```logql
# All app container logs
{container="ari-app-1"}

# Error-level logs only (structured JSON logs from Monolog)
{container="ari-app-1"} | json | level = "error"

# Logs from a specific Symfony channel
{container="ari-app-1"} | json | channel = "security"
```

---

## Backup alert

The `BackupMissed` alert works through a Prometheus textfile collector:

1. `backup.sh db` writes `/var/node_exporter_textfiles/ari_backup.prom` with the current Unix timestamp after every successful backup.
2. Node Exporter reads that directory and exposes the metric as `ari_backup_last_success_timestamp_seconds`.
3. Prometheus evaluates `time() - ari_backup_last_success_timestamp_seconds > 93600` (26 hours) to fire the alert.

### Testing the alert manually

To verify the alert fires correctly without waiting 26 hours, write a backdated sentinel:

```bash
docker compose exec node_exporter sh -c "
  echo '# HELP ari_backup_last_success_timestamp_seconds Unix timestamp of last successful backup.
# TYPE ari_backup_last_success_timestamp_seconds gauge
ari_backup_last_success_timestamp_seconds 1' \
  > /var/node_exporter_textfiles/ari_backup.prom
"
```

Within 2 minutes Prometheus will evaluate the rule and AlertManager will fire the alert.
Restore a real backup run to clear it:

```bash
docker compose run --rm backup /backup.sh db
```

---

## Secrets management

Store `RESTIC_PASSWORD`, `METRICS_SECRET`, and `GRAFANA_ADMIN_PASSWORD` in your `.env.prod` file
with restricted permissions:

```bash
chmod 600 .env.prod
chown root:root .env.prod
```

For Docker Swarm deployments, use Docker Secrets:

```bash
echo "my-restic-password" | docker secret create restic_password -
```

Then reference the secret in your Compose file with `secrets:` blocks and read the file from
`/run/secrets/restic_password` in the container entrypoint.

---

## Upgrading the monitoring stack

To update individual components to newer image versions:

1. Edit the image tag in `compose.monitoring.yaml` (e.g. `grafana/grafana:11.5.0`).
2. Pull and restart:

```bash
docker compose -f compose.prod.yaml -f compose.monitoring.yaml pull
docker compose -f compose.prod.yaml -f compose.monitoring.yaml up -d
```

:::caution Loki upgrades
Loki requires following the upgrade path for breaking versions. Never skip major versions.
Check the [Loki upgrade guide](https://grafana.com/docs/loki/latest/setup/upgrade/) before bumping the image tag.
:::

---

## Self-hosted requirements

| Configuration | Minimum RAM |
|---------------|-------------|
| App only (`compose.prod.yaml`) | 512 MB |
| App + monitoring stack | 2 GB |

The monitoring stack itself uses approximately 400–600 MB at rest (Prometheus ~150 MB, Grafana ~200 MB, Loki ~100 MB, Alloy ~50 MB, AlertManager ~20 MB).

---

## Security notes

- The `/metrics` endpoint returns 404 when `METRICS_SECRET` is empty (feature disabled).
- When `compose.monitoring.yaml` is active, Caddy replaces its Caddyfile with one that
  restricts `/metrics` to RFC-1918 (private) IP ranges only — the monitoring network uses
  Docker-internal addresses in the `172.16.0.0/12` range.
- Never expose `/metrics` to the public internet. If you require external Prometheus
  federation, protect it with mTLS.
- The `monitoring` Docker network is declared `internal: true` — no container on that
  network can initiate outbound internet connections (except AlertManager, which uses a
  separate `alertmanager_egress` network to reach the Telegram Bot API).
