---
id: quick-start
title: Quick Start
sidebar_label: Quick Start
---

# Quick Start

Now that you have Ari CRM running, let's get you logged in and exploring.

## 1. Access the Application

Open your web browser and navigate to:

> **http://localhost:8080**
> *(Or the IP address of your server if running remotely)*

## 2. Create Your First Account

Ari defaults to a secure setup with no public registration. To get started, generate a **Demo Account**. This will create a user with populated data (contacts, groups, etc.) so you can explore the features immediately.

Run the following command in your terminal.
> **Note:** If you used the **NAS / Docker Hub** setup, your container is likely named `ari`. If you installed **from source**, it is `ari-prod-app`.

```bash
# For NAS / Docker Hub setup:
docker exec -it ari php bin/console ari:demo-account:generate

# For Source / Dev setup:
# docker exec -it ari-prod-app php bin/console ari:demo-account:generate
```

**Output Example:**
```text
Generating Demo Account...
 [OK] Demo account generated successfully!
 [INFO] User UUID: 018d20ae-3b65-7119-8b2c-6a7f849d1234
 [INFO] Password: demo
```

## 3. Login

1.  Return to the login screen in your browser.
2.  **Username**: Paste the **User UUID** from the command output (e.g., `018d20ae-3b65-7119-8b2c-6a7f849d1234`).
3.  **Password**: `demo`

> **Tip:** You can change your password later in **Settings > Profile**.

## 4. Explore Features

*   **Contacts**: View the generated contacts and their relationships.
*   **Graph View**: Click the graph icon to see how contacts are connected.
*   **Settings**: Configure your preferences and import real data.

[Read more about Features](../03-features/crm-overview.md)
