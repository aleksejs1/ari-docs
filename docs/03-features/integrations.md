---
title: Integrations
sidebar_label: Integrations
---

# Integrations

Ari is designed to play nicely with your existing ecosystem.

## Google Contacts

Keep your digital address book in sync.
-   **Import**: One-click import of all your Google Contacts.
-   **Sync**: Automatic push of changes from Ari to Google.
-   **Groups**: Synchronization of Google Labels to Ari Groups.

[Learn more about Google Sync](../04-data-management/google-sync.md)

## Telegram Notification Channel

Receive timely updates where you chat.
-   **Activity Feed**: Get notified about important events.
-   **Reminders**: Receive birthday and anniversary reminders directly in Telegram.
-   **ChatOps**: Link your Telegram account securely via a `/start` command.

## AI & Automation (API Keys)

Connect AI agents, personal scripts, and third-party automation tools to your contacts using scoped, revocable **API keys** — without sharing your password or granting full account access.

### What you can connect

| Integration | Use-case |
|---|---|
| **Claude (Anthropic)** | Natural-language contact management via Claude Desktop or Claude Code |
| **Zapier / Make / n8n** | Automate contact creation from forms, CRMs, or spreadsheets |
| **Custom script** | Backup, migration, or data-processing scripts |

### How it works

Each key grants only the specific permissions you choose ("What can this integration do?"):

| Permission | What it allows |
|---|---|
| Read contacts | Search and retrieve contact data |
| Add and edit contacts | Create or update contacts and sub-fields |
| Delete contacts | Permanently delete contacts |
| Read groups | List groups and membership |
| Add and edit groups | Create or update groups |
| Full access | Everything above |

Keys use the same REST API endpoints as the web browser — no separate "AI API" is needed.

### Creating an integration

1. Go to **Settings → Integrations**.
2. Click **Connect**.
3. Choose your integration type from the tile grid (Claude, Zapier, n8n, Make, or Custom).
4. Review and adjust the pre-filled name and permissions.
5. Click **Create Integration**.
6. **Copy the token immediately** — it is shown only once and cannot be retrieved again.

The token looks like `ari_...ab3f`. The `...ab3f` suffix is shown in the key list so you can identify which token is configured where (the same pattern used by GitHub and Stripe).

### Connecting Claude Desktop

After creating a "Claude" integration, expand the **"How to connect"** section in the token dialog. It shows a ready-to-paste JSON snippet for your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ari": {
      "command": "npx",
      "args": ["-y", "ari-mcp"],
      "env": {
        "ARI_BASE_URL": "https://your-ari-instance.example.com",
        "ARI_TOKEN": "ari_..."
      }
    }
  }
}
```

Once configured, you can ask Claude: *"Add a note to John Smith's contact that he prefers meetings on Tuesdays"* and it will find the contact and add the note automatically.

### Security

- **Scoped**: Each key grants only the permissions you explicitly selected.
- **Revocable**: Deleting a key immediately blocks all requests using it (instant 401).
- **Audited**: All changes made via a key are logged in the Audit Log with the key name and suffix.
- **Expiry** (optional): Keys can be set to expire automatically.

> **Warning**: When you revoke a key, any scripts or apps using it will immediately stop working and receive `401 Unauthorized` errors.

## Data Portability

Your data is yours.
-   **XML Export**: Download a complete machine-readable backup of your data.
-   **XML Import**: Restore backups or migrate data between instances.
-   **vCard Export**: Export individual contacts in the standard `.vcf` format for compatibility with mobile devices and email clients.

[Learn more about Data Management](../04-data-management/import-export.md)
