---
id: configuration
title: Configuration & Environment Variables
sidebar_label: Configuration
---

# Configuration & Environment Variables

Ari uses environment variables to configure various aspects of the application. These variables are defined in the `.env` file in the root of the `core` directory.

## General Configuration

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `APP_ENV` | The application environment (`dev` or `prod`). | `dev` |
| `APP_SECRET` | A secret string used for generating signatures and tokens. Change this in production! | `ChangeMeToAreallyLongRandomString` |
| `DEFAULT_URI` | The default URI used for generating URLs in CLI commands. | `http://localhost` |

## Database Configuration

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | The connection string for the database. Supports SQLite, MySQL, PostgreSQL. | `sqlite:///%kernel.project_dir%/var/data_%kernel.environment%.db` |
| `DATABASE_SERVER_VERSION` | The version of the database server. | `11.4.9-MariaDB` |
| `DB_CONNECTION` | The database driver to use (`sqlite`, `mysql`, `postgresql`). | `sqlite` |

## Authentication (JWT)

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `JWT_SECRET_KEY` | Path to the private key for signing JWT tokens. | `%kernel.project_dir%/config/jwt/private.pem` |
| `JWT_PUBLIC_KEY` | Path to the public key for verifying JWT tokens. | `%kernel.project_dir%/config/jwt/public.pem` |
| `JWT_PASSPHRASE` | Passphrase for the JWT private key. Change this! | `ChangeMeToAreallyLongRandomString` |

## Storage

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `STORAGE_TYPE` | The storage backend for files (`local` or `s3`). | `local` |
| `APP_STORE_THUMBNAILS_IN_DB` | Whether to store small image thumbnails directly in the database. | `true` |
| `AWS_S3_KEY` | AWS Access Key ID (required if `STORAGE_TYPE=s3`). | (empty) |
| `AWS_S3_SECRET` | AWS Secret Access Key (required if `STORAGE_TYPE=s3`). | (empty) |
| `AWS_S3_REGION` | AWS Region (e.g., `us-east-1`). | `us-east-1` |
| `AWS_S3_BUCKET` | The name of the S3 bucket. | `ari-avatars` |
| `AWS_S3_ENDPOINT` | Custom info endpoint (e.g., for MinIO or local S3 compatible storage). | `http://localhost:9000` |

## Integrations

### Google

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `GOOGLE_CLIENT_ID` | OAuth Client ID from Google Cloud Console. | (empty) |
| `GOOGLE_CLIENT_SECRET` | OAuth Client Secret from Google Cloud Console. | (empty) |
| `GOOGLE_REDIRECT_URI` | The callback URL for OAuth flow. | `http://localhost:8000/api/connect/google/check` |
| `GOOGLE_CONTACTS_IMPORT_LIMIT`| Maximum number of contacts to import per batch. | `70` |

### Telegram

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `TELEGRAM_BOT_SECRET` | The API Token for your Telegram Bot. | (empty) |
| `TELEGRAM_BOT_NAME` | The username of your Telegram Bot. | (empty) |

## System & Limits

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `MESSENGER_TRANSPORT_DSN` | DSN for the message queue transport (e.g., RabbitMQ, Redis, Doctrine). | `doctrine://default?auto_setup=0` |
| `MAILER_DSN` | DSN for sending emails (e.g., `smtp://...`). | `null://null` |
| `CORS_ALLOW_ORIGIN` | Regex pattern for allowed CORS origins. | `^https?://(localhost\|127\.0\.0\.1\|0\.0\.0\.0)(:[0-9]+)?$` |
| `LOCK_DSN` | DSN for the locking mechanism. | `flock` |
| `XML_IMPORT_LIMIT` | Maximum number of contacts to import from XML per batch. | `70` |
