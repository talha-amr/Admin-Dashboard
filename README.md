# Impact OS — Admin Dashboard Project

This project is a web-based administration panel built with React, TypeScript, Vite, Tailwind CSS, and Supabase. It allows an administrator to manage organizations and send member invitations via a backend serverless Edge Function.

## Live Deployments

* **Production Environment (main branch):** https://admin-dashboard-ruddy-eta.vercel.app/
* **Preview Environment (development branch):** https://admin-dashboard-git-development-talhas-projects-ab218ba2.vercel.app/

## Seeded Test Credentials

You can log into the deployed application directly using this pre-configured administrator account without signing up:

* **Email:** admin@test.com
* **Password:** testpass123

---

## Local Installation and Setup

You can clone, install, and run this project locally in a few minutes by following these steps:

### 1. Clone the Repository

```bash
git clone https://github.com/talha-amr/Admin-Dashboard.git
cd Admin-Dashboard
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory by copying the example file:

```bash
cp .env.example .env
```

Open the new `.env` file and add your Supabase credentials:

```text
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anonymous_key
```

### 4. Run the Local Server

```bash
npm run dev
```

---

## Git Workflow and Branching Strategy

The project follows a two-branch workflow to keep code organized and isolated:

* **main:** Holds the stable production code. No direct commits are made here; it only receives merges from the development branch once a milestone works perfectly.
* **development:** The default working branch where features are integrated and tested.
* **Feature Branches (`feat/*`):** Short-lived branches created for specific tasks.

### Merged Pull Requests

To satisfy the workflow requirements, the core feature pipeline was tracked and merged using 6 distinct pull requests

* **Pull Request 1 (#1):** `feat: Install core packages and initialize design engine` — Scaffolding the underlying dependencies, theme parameters, and build setups.
* **Pull Request 2 (#2):** `feature: complete responsive auth flow and protected routes` — Implementing secure interface routing, redirection logic, and responsive screen handling.
* **Pull Request 3 (#3):** `feature: implement organization management workspace with dynamic validation` — Adding the baseline context controls for rendering configuration panels.
* **Pull Request 4 (#4):** `feature: implement serverless member invitation system via supabase edge functions` — Setting up the serverless backend orchestration code to isolate admin actions.
* **Pull Request 5 (#5):** `feature: display server-side aggregated member counts and formatted directory dates` — Integrating backend subquery structures to safely gather aggregate relational context.
* **Pull Request 6 (#6):** `fixed dashboard directory issue` — Final cleanups ensuring correct card directory behaviors and layout fixes.

---

## Database Schema Blueprint

The repository contains a file named `schema.sql` in the root folder. This file contains the plain SQL code needed to recreate the database tables (`profiles`, `organizations`, `organization_members`), the Row-Level Security (RLS) protection rules, and the database trigger that automatically links new users to a profile.

---

## Shortcuts, Trade-offs, and Next Steps

### What I Would Do With Another Day

* **Real Email Sending:** Right now, inviting a member creates a row in the database table. With more time, I would connect the Edge Function to an actual email service provider API (like Resend) to send a physical email notification to the user.
* **Form Validation & Error States:** I would add more advanced UI error handling and confirmation alerts to give the user better visual feedback when operations succeed or fail.
* **Component Testing:** I would set up a basic testing framework (like Vitest) to verify that data processes correctly across components.

### Honest Shortcuts Taken

* **Direct Database Queries:** To save time and keep the architecture lightweight, the frontend connects directly to Supabase to fetch and save data instead of building a separate custom Node.js Express backend API server.
* **Bypassing Email Verification:** To make testing simple for the reviewer, the test account was created manually inside the Supabase dashboard with the auto-confirm setting enabled. This bypasses the email activation step so you can log in instantly.

### Explicit Technical Trade-offs

* **Removing tsconfig Options:** During production compilation on Vercel, the TypeScript build failed with a fatal error stating that `baseUrl` is deprecated under modern bundler configurations. To fix this build crash quickly and ensure a successful live deployment, I directly removed the `baseUrl` property from `tsconfig.app.json` and relied entirely on native Vite path mapping.
