---
sidebar_position: 5
title: "Cookbook: Writing E2E Tests"
description: "A step-by-step guide for new developers and QA on running and writing new E2E tests locally in Ari CRM."
---

# Cookbook: Writing E2E Tests

This guide is intended for specialists of any level, including those just starting with Playwright and Typescript. The process is described in maximum detail here — from cloning the necessary repositories to pushing ready automated tests.

## 🏁 Step 1. Preparing the Workspace

### Cloning Repositories
The tests (Playwright) and the application itself (React + Symfony) are physically located in two different repositories.
You need to clone them into the **same folder** so they are located next to each other.

1. Open your terminal and navigate to your working directory (e.g., `cd ~/code`).
2. Clone the backend/frontend repository:
   ```bash
   git clone git@github.com:aleksejs1/ari.git
   ```
3. Clone the tests repository:
   ```bash
   git clone git@github.com:aleksejs1/ari-e2e.git
   ```

Make sure the folders are side-by-side:
```
~/code/
  ├── ari/
  └── ari-e2e/
```
> E2E scripts need to know where the application source code (`ari/`) is located to build the Docker image for testing from it. By default, scripts expect to find `ari` one level up, so the folders must be "siblings".

### Installing Dependencies (Only Once)

Navigate to the tests folder and run the installation of necessary packages and browsers. You must have NodeJS installed.

```bash
cd ari-e2e

# Install TypeScript and Playwright
npm ci

# Download Chromium and the necessary drivers for auto-control
npx playwright install --with-deps chromium
```

---

## 🚀 Step 2. Running the E2E Environment Locally

Before writing tests, you need to "spin up" the application itself. `ari-e2e` has everything necessary to build a copy of the Production environment from scratch in Docker (with a database, email mocks, etc.).

1. Ensure you have Docker running (Docker Desktop or Docker Daemon started).
2. While in the `ari-e2e/` folder, run the command:
   ```bash
   make up
   ```
3. This will launch a long process (the first run may take a few minutes). The script will build the application's Docker containers, wait for the databases to initialize, load the Seed data (test users), and output:
   `E2E environment is ready! App: http://localhost:8081`
4. Now you can open `http://localhost:8081` in your browser. The application is running! You can log in as the test user (Login: `e2e-user`, Password: `e2e-password`). Ensure everything loads.

> **Reference:** The `make down` command will completely stop the environment and delete the databases. The `make test` command simply runs all written tests "in the background". To develop new tests, we will use the UI mode.

---

## 🛠 Step 3. Running Playwright UI Mode (Debugging and Development)

Playwright provides a fantastic interface for developing tests with hot reloading.

Run the command:
```bash
npx playwright test --ui
```
*(Or `make test-ui`, if you have set up an alias).*

A new Playwright UI window will open. On the left, all files from the `tests/` folder will be listed. You can select any and click the ▶️ (Play) button. In the right panel, you will see how the test clicks through the application in real-time, and below you can explore the DOM tree for each step of the test, view the network (Network), etc. The Playwright window cannot be closed while you are writing tests.

---

## 📝 Step 4. Writing a New Test (Step-by-Step)

Let's assume we need to write a test for the "Groups" page, where we verify that groups from our Seed set (for example, the "Family" group) are displayed in the list.

### 4.1 Creating a Page Object

Instead of searching for buttons and texts directly in the test, we create a class that describes this page. This is called the Page Object Model (POM).

Create the file `tests/pages/GroupsPage.ts`:

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class GroupsPage {
    // 1. Declare what we will interact with
    private readonly title: Locator;
    private readonly createButton: Locator;

    constructor(private readonly page: Page) {
        // 2. Describe the locators. We prefer data-testid!
        this.title = page.getByTestId('page-title-groups');
        // If data-testid is not yet in the application source, we can search semantically
        this.createButton = page.getByRole('button', { name: /create|add/i });
    }

    // 3. Write action methods
    async goto() {
        await this.page.goto('/groups');
    }

    // 4. Write verification methods (Assertions)
    async expectGroupToBeVisible(groupName: string) {
        // Groups are data from the DB, we can search for them by text
        await expect(this.page.getByText(groupName)).toBeVisible();
    }
}
```

### 4.2 Modifying React Source Code (Adding `data-testid`)

We specified in the POM: `this.title = page.getByTestId('page-title-groups');`. If this attribute is absent in the UI, the test will fail.
Go to the neighboring `ari` repository, find the file with this page (e.g., `ari/web-client/src/pages/GroupsPage.tsx`), and add:

```tsx
// Before
<h1>{t('groups.title')}</h1>

// After
<h1 data-testid="page-title-groups">{t('groups.title')}</h1>
```
> The frontend runs in an isolated Docker, and after modifying the React code, you may need to rebuild the E2E environment build: `make down` -> `make up`, so the changes are pulled into the E2E container.

### 4.3 Writing the Test Itself (spec file)

Tests are located in the `tests/` folder with the `.spec.ts` suffix or are grouped into subfolders by feature (e.g., `tests/groups/groups.spec.ts`).

Create the file `tests/groups/groups-list.spec.ts`:

```typescript
// IMPORTANT: We import `test` and `expect` from our fixture, not from standard playwright!
import { test, expect } from '../fixtures/user-context.fixture';
import { GroupsPage } from '../pages/GroupsPage';

test.describe('Groups List', () => {

    test('should display seeded groups', async ({ userContext }) => {
        // userContext provides us with a completely fresh and independent user
        const { page } = userContext; 
        
        // 1. Initialize our Page Object
        const groupsPage = new GroupsPage(page);

        // 2. Perform actions
        await groupsPage.goto();

        // 3. Verify the expected result
        // Since userContext creates a new user, by default they have the 'Test Group' group (see E2eSeedService)
        // But if you need a Seed user who already has 3 groups, the test needs to be written differently (using a shared user).
        await groupsPage.expectGroupToBeVisible('Test Group');
    });

});
```

### Crucial Difference: `userContext` vs `authFixture`

- If you use `({ userContext })` — Playwright creates an absolutely clean user before the test starts. All deletions, creations, and edits you make here **will not affect other tests**. After the test, the user is deleted permanently. This is the **gold standard** for all CRUD tests (creating, deleting elements).
- If your test only reads (does not mutate the database), you can use `import { test, expect } from '../fixtures/auth.fixture';` and the `({ authenticatedPage: page })` object — it will log in as a global seed user (who already has 10 contacts, etc.).

### 4.4 Running and Verifying

In the **Playwright UI Mode** window (which you opened in Step 3), your new file `groups-list.spec.ts` will appear.
Click "Play" next to it.
Watch as the browser opens itself, logs into the system, navigates to `/groups`, and verifies the presence of the group!

If the test is "green" — you did it! If "red" — look at the UI Mode console; it will indicate which locator was not found and show a screenshot at the moment of the error.

---

## 🛠 Step 5. Working with Email (Mailpit)

If you are testing functionality that sends an Email:
There is no real email in the E2E environment. Instead, [Mailpit](https://mailpit.axllent.org/) is running. Its WEB interface is exposed on port `8026` (you can access it via browser).

Inside the tests, `userContext` has a unique Email address!
```typescript
test('forgot password email', async ({ userContext }) => {
    const { email, apiContext } = userContext; // E.g., e2e-a1b2c3d4e5f6@e2e.local

    // ... your code triggers the email sending ...

    // Query the Mailpit API via a Playwright request
    const mailpitResponse = await apiContext.get(
        `http://localhost:8026/api/v1/search?query=to:${email}`,
    );
    const { messages } = await mailpitResponse.json();

    expect(messages.length).toBe(1);
    expect(messages[0].Subject).toContain('Password reset');
});
```

---

## 🚀 Step 6. Pushing Changes

Excellent, the test is written and passes locally (glows green in UI-mode). It's time to commit the code!

Since we changed TWO different repositories (added `data-testid` to the application and wrote tests in `ari-e2e`), we need to make two pushes. Usually, developing an auto-test is tied to a development task (you fix a feature and immediately write an auto-test for it in the neighboring repository).

1. **In the application repository (`ari`):**
   ```bash
   cd ~/code/ari
   git checkout -b feature/groups-e2e-ids
   git add .
   git commit -m "test: add data-testid for groups page"
   git push origin feature/groups-e2e-ids
   ```
   *(And create a Pull Request)*.

2. **In the tests repository (`ari-e2e`):**
   ```bash
   cd ~/code/ari-e2e
   git checkout -b tests/groups
   git add .
   git commit -m "test: add groups list verification"
   git push origin tests/groups
   ```
   *(Create a Pull Request).*

Right after creating the PR, GitHub Actions will automatically spin up Docker, download the application, and run your new E2E auto-tests in the cloud. Wait for the green checkmark in GitHub — and the test is ready!
