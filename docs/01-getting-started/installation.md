---
id: installation
title: Installation Guide
sidebar_label: Installation
---

# Installation Guide

Welcome to the installation guide for Ari CRM.

## Getting Started

Ari is designed to be self-hosted using **Docker**. This ensures a consistent environment and easy updates.

### System Requirements
*   **OS**: Linux, macOS, or Windows (via WSL2)
*   **Software**: Docker Engine & Docker Compose
*   **Hardware**: Minimum 1GB RAM, 10GB Disk Space

## Production Installation

For the recommended production setup (e.g., on a NAS or VPS), please follow our detailed guide:

👉 **[Docker & NAS Setup Guide](../02-admin-guide/docker-setup.md)**

### Fast Track (Automatic Setup)

If you have a standard Docker environment, you can use the interactive setup script:

```bash
# 1. Clone the repository
git clone https://github.com/aleksejs1/ari.git
cd ari

# 2. Run the setup script
./setup_prod.sh

# 3. Start the containers
docker compose -f compose.prod.yaml up -d --build
```

Once installed, proceed to the [Quick Start Guide](quick-start.md) to create your first user.
