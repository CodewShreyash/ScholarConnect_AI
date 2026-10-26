# ScholarConnect AI — React + Supabase

The existing React/Tailwind interface now uses Supabase Auth, Postgres and private Storage. The original page layouts and visual theme are retained. New student/provider dashboards, organization profiles, document vault, scholarship editor and application review screens complete the workflows.

## Quick start (Windows, macOS or Linux)

1. Install Node.js **22.12+** (Node 24 LTS also works).
2. Create a Supabase project at https://supabase.com/dashboard. This code does not contain credentials or create a hosted project automatically.
3. In the project's **SQL Editor**, run `supabase/migrations/202609290001_initial.sql` once in a **new project**, then run `supabase/migrations/202610260001_category_matching.sql` and `supabase/migrations/202610260002_document_upload_types.sql`. The initial migration creates tables, functions, permissions, the signup trigger and a private `student-documents` bucket; the category migration updates category-based matching and application checks, adds a generic category-certificate document type, and clears the old automatic “Scheduled Tribe” placeholder so students can choose their real category. The document migration enables the additional Google Doc checklist uploads. Do this **before registering accounts**. The initial migration is transactional and intended for a fresh database; it is not an idempotent upgrade script for an unrelated existing schema. For an already configured ScholarConnect database, run both upgrade migrations, then have students whose category was previously preset review and save their correct category in **My profile**.
4. From the Supabase project's Connect/API settings, copy the project URL and **publishable key** (or legacy **anon key**). Copy `.env.example` to `.env.local` and replace its placeholders:

   ```dotenv
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_PUBLISHABLE_KEY
   ```

   A publishable/anon key is intended for the browser. Never place a secret or service-role key in a `VITE_*` variable or in frontend code.
5. In Supabase **Authentication → URL Configuration**, set Site URL to `http://localhost:5173`. Add these Redirect URLs:
   - `http://localhost:5173/auth/callback`
   - `http://localhost:5173/reset-password`
6. Enable email/password sign-in. Keep email confirmation enabled and set the password minimum to at least 10 characters to match the form. Configure a custom SMTP provider for reliable email delivery outside testing. Supabase's default mail service has delivery restrictions; a successful UI request does not prove email delivery.
7. Open a terminal **inside `scholarconnect-ai`** and run:

   ```bash
   npm ci
   npm run dev
   ```


   to run "npm.cmd run dev"

   Open `http://localhost:5173`. Restart Vite after editing environment variables. There is no separate Express server to start: Supabase provides the backend and authorization.

## First complete workflow

1. Register a **Provider** account and confirm its email. Sign in and complete Organization Profile.
2. Create a scholarship. Set a future deadline, description, benefit, structured eligibility rules and required document types. Save with status **published**. No example government schemes are automatically published.
3. In another browser profile or after signing out, register and confirm a **Student** account.
4. Complete Student Profile with name, education level, domicile state, annual income and percentage. Upload the required PDF/JPG/PNG documents (10 MB maximum each).
5. Open Explore or the Student Dashboard. Matching uses the saved profile and current published scholarship rules. Open a scholarship to inspect the result and document readiness, then Apply.
6. Student Applications shows the submitted application and history. Repeated submissions to the same scholarship are rejected, including withdrawn applications.
7. Sign in as the provider. Open Applications → Start Review → Approve or Reject, with an optional note. Inspect the student's **submitted profile snapshot** and attached documents. The student can refresh their Applications screen to see the decision.
8. A student may withdraw a submitted or under-review application. The provider loses access to its document files after withdrawal; the application and its audit history remain retained.

## What is implemented

- Email/password signup, confirmation callback, login, password reset and logout.
- Persistent Supabase sessions, automatic refresh and cross-tab auth updates. Sign out on shared devices. This version persists sessions by default and removes the old nonfunctional Remember Me checkbox.
- Role-based route guards and server-enforced data access. Roles are set at account creation and cannot be changed by updating user metadata or profile columns.
- Persisted student and provider profiles, with validation and edit/reload behavior.
- Provider draft/create/edit/delete, publish and close operations. Drafts with applications cannot be deleted.
- Public scholarship catalog, text search, filters, details and real profile-based matching.
- Private document upload, metadata, signed viewing links, safe deletion and version retention. New uploads are new immutable versions; the most recent version of each required type is selected at submission. Unattached old versions can be removed.
- Atomic application submission, duplicate prevention, deadline/eligibility/document checks, immutable snapshots and attachment linkage.
- Provider review, sequential status changes, student withdrawal and an append-only status history.
- Explicit loading, empty, failure, retry and missing-configuration states.

## Matching and data boundaries

Matching is a deterministic, explainable **rule engine**, not a trained model or an LLM. It checks profile completeness, category, education level, domicile, maximum income and minimum marks. All configured rules must pass to submit. The displayed score starts at 100 and subtracts 20 per failed check, floored at zero; it is a rule summary, not an award probability. Additional provider-written eligibility text requires manual review. Document readiness measures file availability, not authenticity.

The old `src/data/scholarships.js` is retained solely as an unused original reference. Its claimed verification dates, fixed match scores and scheme descriptions are **not** imported into the live application or database. `src/data/scholarshipGuide.js` displays the user-supplied scheme list grouped by study stage and category; it is an informational guide, not live availability or a direct application form. Only published database opportunities can be applied for in this portal. Only the project administrator may set the database's `verified` flag; providers cannot self-verify. New scholarships default to unverified.

A provider can read application snapshots and selected attachments for scholarships they own, but cannot browse live student profiles or other students' vault files. Other students cannot see applications. Submission and status changes are restricted RPC functions; direct application table writes are denied. Files are private, and signed links expire after 60 seconds. A link already issued can remain usable until its expiry even after a withdrawal.

## Build and verification

```bash
npm test
npm run build
npm run preview
```

`npm test` runs the database and UI test suites. The database suite executes the actual migrations and authorization scenarios in PGlite (embedded Postgres), using a minimal Auth/Storage schema harness. It tests account isolation, role/verification escalation, scholarship ownership, category eligibility, storage isolation, immutable snapshots, missing documents, duplicate applications, status transitions, deadlines, withdrawal and audit visibility. This is **not** a test of Supabase's hosted Auth email service, Storage HTTP service or PostgREST relationship embedding. Use `docs/ACCEPTANCE.md` to verify those against your project.

Production build, eight local database security scenarios and nine frontend/session tests passed during implementation. Frontend tests run in jsdom with mocked Supabase responses; a full Chromium visual check was unavailable because the browser download failed. No hosted Supabase project credentials were supplied, so no live migration, email delivery or hosted end-to-end verification has been claimed.

## Production setup

Build with your production Supabase public variables. Serve `dist/` using an HTTPS static host with a fallback to `index.html` for routes such as `/student/dashboard` and `/auth/callback`. Add your exact production callback/reset URLs to Supabase Auth and change the Site URL. Vite variables are embedded at build time: rebuild after changing them. Keep development and production projects separate.

Before accepting real student records, define a retention/deletion policy, organization verification process, backup strategy and operational ownership. File type/size checks are implemented, but file content is not malware-scanned or authenticity-verified. This version does not implement payments, Aadhaar/DigiLocker/PFMS integration, fraud detection, provider approval onboarding or government-scheme ingestion.

The app refreshes lists on navigation and after writes; application screens also provide a Refresh button. It does not require Supabase Realtime replication configuration.

## Project map

- `supabase/migrations/202609290001_initial.sql`: database, RLS, Storage and business RPCs.
- `src/lib/supabase.js`: one shared auth/client instance and error handling.
- `src/context/AuthContext.jsx`: session and account state.
- `src/lib/api.js`: typed field mapping, profile validation, uploads, catalog and application calls.
- `src/components/common/ProtectedRoute.jsx`: route authorization UX.
- `src/pages/student/`, `src/pages/provider/`, `src/pages/Applications.jsx`: connected workflows.
- `tests/database.test.mjs`: Postgres/RLS regression coverage.
- `docs/ACCEPTANCE.md`: live-project acceptance checklist and troubleshooting.

## Official references

- https://supabase.com/docs/guides/auth/quickstarts/react
- https://supabase.com/docs/reference/javascript/auth-onauthstatechange
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/storage/security/access-control



## SIH feature rebuild

This version includes ScholarShield, Explainable Eligibility, Scholarship Passport, Opportunity Rescue, and a Visual Rule Builder. See `SIH_FEATURES.md` for the demo flow and architecture notes.

The Supabase migration, storage model, RPCs, authentication backend, and existing API layer were not changed for these features.

### Offline Scholarship Passport

The student Passport now includes **Download Offline Passport** and **Print / Save as PDF**. The downloaded file is a self-contained HTML snapshot with inline styling, so it can be opened and printed without internet access. It includes candidate profile details, readiness metrics for all ten Google Doc checklist types, eligible-opportunity snapshot, generation date, and a Passport reference. The supplied 14 schemes are shown as category/study-stage guide references; only approved published ScholarConnect opportunities accept in-app applications. No new database tables, columns, RPCs, or Storage behavior are required.

## Student portal visual identity

The student workspace now uses `src/assets/student-portal-graduates.png` as its student-only visual identity. The image is applied to the student workspace shell, navigation, page hero banners, student scholarship discovery, and student scholarship details. Provider/NGO screens intentionally remain unchanged so a separate NGO visual can be applied independently.


## Role-based portal imagery

- Student accounts use `src/assets/student-portal-graduates.png` across the student workspace and student-signed-in scholarship screens.
- NGO/provider accounts use `src/assets/provider-portal-team.png` across the provider workspace and provider-signed-in scholarship screens.
- Public/anonymous pages keep the neutral ScholarConnect visual treatment.
