---
title: Core Service Architecture
sidebar_label: Architecture
---

# Core Service Architecture

This document provides a technical overview of the `core` service (backend), which serves as the API and business logic layer for the application.

## Technology Stack

- **Language**: PHP 8.5
- **Framework**: Symfony 7.4
- **API Framework**: API Platform 4
- **ORM**: Doctrine ORM 3
- **Database**: MySQL (via `pdo_mysql`)
- **Authentication**: JWT (LexikJWTAuthenticationBundle)
- **Static Analysis**: PHPStan (Level 8 with Symfony container integration), Psalm (Level 3), Deptrac
- **Testing**: PHPUnit 12

## Directory Structure

Standard Symfony Flex structure with specific patterns:

```
core/
├── src/
│   ├── ApiResource/      # Custom API Platform resources (non-entity based)
│   ├── Command/          # Symfony Console commands
│   ├── Controller/       # Custom API actions (e.g., Export/Import) - No UI Controllers
│   ├── Doctrine/         # Doctrine extensions (Filters, etc.)
│   ├── Dto/              # Data Transfer Objects
│   ├── Entity/           # Doctrine Entities & API Platform Resources
│   ├── EventListener/    # Doctrine & Symfony Event Listeners
│   ├── EventSubscriber/  # Symfony Event Subscribers (Audit Log, etc.)
│   ├── Filter/           # Custom API Platform Filters
│   ├── Repository/       # Doctrine Repositories
│   ├── Security/         # Security Voters & Multi-tenancy logic
│   ├── Service/          # Business logic services
│   └── State/            # API Platform State Providers & Processors
└── tests/                # PHPUnit tests (Functional & Unit)
```

## Key Architectural Patterns

### 1. Multi-Tenancy
The application is designed to be multi-tenant, where data is isolated per "Tenant" (User).
- **Interface**: `App\Security\TenantAwareInterface` guarantees a `getTenant()` method.
- **Trait**: `App\Security\TenantAwareTrait` implements the interface and ensures `onDelete: CASCADE` at the database level for the `tenant_id` foreign key. This guarantees that deleting a user automatically cleans up all their associated multi-tenant data.
- **Enforcement**: `App\Doctrine\Filter\TenantFilter` is a Doctrine SQLFilter that automatically appends `AND tenant_id = <current_user_id>` to SQL queries. This ensures users cannot accidentally access other users' data.
- **Bypass**: The filter can be disabled for administrative tasks or internal commands.

### 2. Security & ACL
Security is handled at the object level using Symfony Voters.
- **Voters**: Located in `src/Security/Voter`, e.g., `ContactVoter`.
- **Permissions**: Defined constants like `CONTACT_VIEW`, `CONTACT_EDIT`, `CONTACT_ADD`.
- **API Integration**: API Platform resources use `security` attributes, e.g., `security: "is_granted('CONTACT_VIEW', object)"`.
- **Brute Force Protection**: Implemented via Symfony's `login_throttling` on the `/api/login` firewall. Limits login attempts to 5 per minute per IP/Username to prevent password guessing attacks. Requires `symfony/rate-limiter` and `symfony/lock`.
- **Account Deletion**: `DELETE /api/profile` allows users to delete their entire account and all associated data. Handled by `CurrentUserProvider`, `UserDeleteProcessor`, and database-level cascades.

### 3. API Design
- **Resources**: Primarily entity-based, exposed via `#[ApiResource]`.
- **Serialization**: Controlled via `#[Groups]`.
  - `*:read`: For read operations.
  - `*:create`/`*:update`: For write operations.
  - `export`: Specific groups for data export.
- **Custom Operations**: Implemented using `#[Get]`, `#[Post]`, etc., pointing to custom Controllers or State Processors where standard CRUD is insufficient (e.g., XML Import/Export, vCard Export, Change Password). XML Import is limited (default 70) to prevent memory issues, configurable via `XML_IMPORT_LIMIT`.
- **Change Password**: `PUT /api/profile/change-password` allows users to change their password securely using `ChangePasswordDto` and `UserPasswordChangeProcessor`.
- **Account Deletion**: `DELETE /api/profile` securely removes all user data. Multi-tenant data isolation is reinforced by `onDelete: CASCADE` on the `tenant_id` foreign key in `TenantAwareTrait`.
- **vCard Export**: `GET /api/contacts/{id}/vcard` exports a contact in vCard 4.0 format using `VCardService` (powered by `sabre/vobject`).
- **Statistics**: `GET /api/stats` provides total counts of contacts, audit logs, and sent notifications for the dashboard widget.
- **User Creation**: `POST /api/users` uses `UserInitialSetupProcessor` to automatically generate default notification channels ("web") and policies ("Default") for new users.

### 4. Audit Logging
Changes to critical entities are tracked via `App\EventSubscriber\AuditLogSubscriber`.
- **Mechanism**: Listens to Doctrine `onFlush` and `postPersist` events.
- **Storage**: Stores changes as JSON snapshots (`snapshotBefore`, `snapshotAfter`) and change sets in the `AuditLog` entity.
- **Scope**: Automatically audits any entity implementing `TenantAwareInterface` (unless explicitly excluded).

### 5. Notification System
Entities: `NotificationRule`, `NotificationQueue`, `NotificationPolicy`, `NotificationChannel`.
- **Logic**: Rules define when notifications are sent.
- **Channels**: Supported delivery channels include `web` (Activity Feed) and `telegram`.
- **Queue**: Pending notifications are stored in `NotificationQueue`.
- **Delivery**: Processed by services implementing `NotificationSenderInterface` (e.g., `ActivityFeedSender`, `TelegramSender`), utilizing Symfony's `AsTaggedItem` for channel-specific logic.
- **Webhook**: `POST /webhook/telegram` receives updates from Telegram. It processes `/start {userId}_{channelId}` commands to link a Telegram chat to a `NotificationChannel` by updating its `chatId` in the configuration. This bypasses the multi-tenancy filter to find the channel by ID and then manually verifies ownership.
- **Cleanup**: `App\EventListener\NotificationRuleListener` ensures pending queue items are canceled when a rule is deleted.

### 6. User Preferences
Entity: `UserPref`.
- **Mechanism**: Stores user-specific settings (e.g., language, date format, time format, sync preferences).
- **Validation**: Enforced via `#[Assert\Callback]` in the entity to ensure values matches the preference type.
- **API**: Exposed via custom `UserPrefStateProvider` and `UserPrefProcessor` to allow access by preference `type` instead of ID.

### 7. Google Contacts Integration
Location: `src/Service/Google/`.
- **Import**: `GoogleContactsService` imports contacts from Google People API using an asynchronous architecture (Symfony Messenger).
  - **Group Sync**: Synchronous pre-warm of contact groups.
  - **Contact Sync**: Dispatches `ImportGoogleContactMessage` to the `async` queue for every contact to prevent OOM errors.
  - **Limit**: The number of contacts is limited (default 70, configurable via `GOOGLE_CONTACTS_IMPORT_LIMIT`).
- **Update Sync**: `GoogleContactUpdateService` pushes contact data (phones, emails, names, addresses, bios, orgs, dates) to Google when `UserPref::TYPE_GOOGLE_SYNC_ON_UPDATE` is enabled.
- **Event Subscriber**: `ContactSyncSubscriber` listens to changes in `Contact` and its related entities (phones, names, emails, addresses, bios, orgs, dates) and triggers the sync after flush.
- **OAuth Scope**: Uses `https://www.googleapis.com/auth/contacts` for read/write access.

### 8. Demo Account Generation
- **Service**: `App\Service\Demo\DemoAccountService` generates a pre-populated user with 70 contacts and complex relationships (families, colleagues).
- **Command**: `bin/console app:generate-demo-account` triggers generation via CLI.
- **API**: `POST /api/demo-account` allows triggering via the web client (returns the username).
- **Data Generator**: `App\Service\Demo\DemoDataGenerator` provides realistic localized data without external dependencies.

### 9. Code Quality & Standards
The project enforces strict code quality:
- **Deptrac**: Enforces architectural layers:
  - **Controllers**, **Commands**, **ApiResources**: Cannot access **Repositories** directly. Must use **Services**.
  - **Services**: Can access **Repositories**, **Entities**, and other services.
  - **State Providers/Processors**: Can access **Services** and **Entities**.
  - **Entities**: Isolated (no dependencies on other layers).
- **PHPStan/Psalm**: High strictness levels to prevent type errors.
- **CS-Fixer**: Enforces PSR-12 and Symfony coding standards.

- **composer.json**: Describes dependencies and QA scripts.
- **[QA and Testing](testing)**: Details on the test environment and Makefile commands.

## Development & QA Workflow

The project uses an isolated, SQLite-backed test environment. For the best experience, use the provided `Makefile` in the `core/` directory.

### Essential Commands

```bash
# Run the complete Quality Assurance suite (Tests + Static Analysis)
make qa

# Run only tests
make test

# Generate coverage report
make coverage

# Fix coding standards
make cs-fix
```

For a full list of commands and technical details about the test environment, see [QA and Testing Infrastructure](testing).

### 10. Legacy / Direct Container Access
If you need to execute commands directly in the development container:
```bash
# Access container
docker exec -it ari-app-1 bash -c "cd /app/core && bash"
```

### Contact Dates Filtering

The `ContactDate` collection (Dashboard Upcoming Anniversaries) supports filtering based on the current user's `NotificationPolicy`.

1.  **Preference**: A `UserPref` of type `dashboard_notification_policy` holds the ID of the active `NotificationPolicy`.
2.  **Filter**: `UpcomingAnniversaryOrderFilter` implements the logic.
    *   It checks the `dashboard_notification_policy` preference.
    *   If a policy is set, it iterates over its `NotificationRule`s.
    *   It dynamically constructs DQL using `OR` between rules, filtering by `contactGroup` (using `EXISTS`), specific `contact`, and `eventType` (case-insensitive text matching).
    *   If no rules are active for a policy, the collection returns empty by default to respect the policy constraints.

### 11. Contact Graph Filtering

The `/api/contact-graph` endpoint supports advanced filtering via `ContactGraphProvider`:

- **Level Filtering**: Using `contactId` and `level` (default 1).
  - `level=1`: Returns the contact and its direct relations.
  - `level=2`: Returns the contact, its relations, and their relations (2nd degree).
- **Group Filtering**: Using `groupId`.
  - Returns all members of the group and all their 1st-degree connections.

These filters are useful for visualizing social circles or group-specific networks.

### 12. File Storage (Avatars)

The application supports contact avatar uploads with abstracted storage.
- **Abstraction**: Uses `league/flysystem-bundle` for storage abstraction.
- **Drivers**: Supports `local` (default) and `s3` (AWS/Minio) drivers, switchable via environment variables.
- **Processing**: Uses `intervention/image` for image resizing and thumbnail generation.
- **Thumbnail Strategy**: Dual strategy for thumbnails (150x150): they can be stored as BLOBs in the database for fast access without disk I/O, or served from storage. Controlled via `APP_STORE_THUMBNAILS_IN_DB`.
- **API**: `POST /api/contacts/{id}/avatar` handles `multipart/form-data` uploads.
