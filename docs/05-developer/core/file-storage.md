---
title: Contact Avatar Storage
sidebar_label: File Storage
---

# Contact Avatar Storage

This document describes the subsystem for uploading and storing contact avatars.

## Overview
The system supports uploading images (JPEG, PNG, WEBP) as contact avatars. It uses Flysystem for storage abstraction and Intervention Image for processing.

## Configuration

### Storage Driver
The driver is configured via the `STORAGE_TYPE` environment variable in `.env`.
- `local`: Files are stored in `%kernel.project_dir%/public/uploads/avatars`.
- `s3`: Files are stored in an S3-compatible bucket (configured via `AWS_S3_*` variables).

### Thumbnail Strategy
You can toggle whether thumbnails (150x150) are stored in the database (as BLOB) via `APP_STORE_THUMBNAILS_IN_DB`.

## API Usage

### Uploading an Avatar
**POST** `/api/contacts/{id}/avatar`

**Request Body:** `multipart/form-data`
- `file`: The image file (max 5MB).

**Response:** Returns the `Contact` entity with the updated `avatar` relation.

## Implementation Details
- **Entity:** `App\Entity\ContactAvatar`
- **Service:** `App\Service\AvatarManager`
- **Controller:** `App\Controller\AvatarUploadAction`
- **Storage Adapter:** `avatar.storage` (Flysystem)
