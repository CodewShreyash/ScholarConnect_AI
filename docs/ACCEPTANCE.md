# Live Supabase acceptance checks

Run these with a fresh nonproduction Supabase project after applying the initial migration and both subsequent upgrade migrations, then set environment variables. Use two students (S1/S2) and two providers (P1/P2), each with separate browser sessions. These checks are intentionally not marked completed: the build was delivered without live Supabase credentials.

| Scenario | Expected outcome |
|---|---|
| Register each account and confirm email | Exactly one base profile and one role-specific profile per auth user |
| Refresh a protected route and open it in a new tab | Session restored; no login loop |
| Sign out in one tab | Protected pages in other tabs require login |
| Visit provider pages as a student | Redirected to student dashboard |
| Request password reset and open emailed link | Reset screen updates password; new password signs in |
| Use expired/invalid confirmation or reset link | Error/retry guidance, no false successful login |
| P1 creates a draft | Visible to P1, absent for public visitors, S1 and P2 |
| P1 publishes future scholarship with income/marks/state constraints | Catalog loads from database and filters work |
| S1 updates their profile and refreshes | Persisted values and matching result update |
| S1 fails one criterion | Explanatory reason displayed; direct submission RPC also fails |
| S1 uploads a PDF/JPG/PNG ≤10 MB | File and metadata appear in private vault |
| Upload unsupported type or oversized file | Rejected; no success banner |
| S2/P2 tries S1 storage path or document ID | No access |
| Submit without required attachments | Rejected server-side |
| Submit with S2 document IDs | Rejected server-side |
| Apply twice / double-click / two concurrent tabs | Only one application exists |
| Apply after deadline or after closure | Rejected server-side |
| S1 edits profile or uploads new file after submission | Existing application snapshot and attachments unchanged |
| P1 opens own submitted application | Submitted snapshot and selected attachments are readable |
| P2 requests P1 application | No rows returned / access denied |
| S1 tries to delete a submitted file via UI or direct Storage API | Denied; submitted version remains |
| P1 changes submitted → under_review → approved/rejected | Each change recorded once with actor/time/note |
| P1 skips review or edits a terminal decision | Denied |
| S1 withdraws a separate pending application | Provider file access ends; issued signed URLs expire within 60 seconds |
| User tries to modify profile role / owner / verified flag | Permission denied |
| Network interrupted during save/upload | Error shown; retry possible; no false success |
| Production direct link `/scholarships/<id>` | Static host serves app via SPA fallback |

## Troubleshooting

- **Supabase setup required**: check `.env.local` names, project URL and public key; restart Vite. Do not use the database connection password.
- **Database error saving new user**: check the migration and Auth logs; the signup trigger must be able to insert profiles. Apply the migration before creating test accounts. Accounts predating the migration need administrator backfill or fresh test registration.
- **Email not received**: check confirmation settings, SMTP configuration, spam folder, Auth logs and mail rate limits. The frontend cannot bypass email confirmation.
- **No scholarships**: sign in as a provider and publish one. Drafts stay private; the original reference data is not seeded as verified opportunities.
- **No eligible matches**: save student name, education, domicile, income and percentage, then compare the structured scholarship criteria. Text fields do not automatically become machine-enforced rules.
- **Storage RLS error**: verify the bucket and policies were created. Sign in as a student; file paths must begin with that student's user ID.
- **File uploaded but row save failed**: the client attempts to remove the uploaded object. If the network also blocks cleanup, an administrator may remove orphan objects that have no `documents.path` reference. Do not remove referenced objects manually.
- **Cannot delete a document**: files referenced by applications are retained to preserve the submission, including terminal and withdrawn applications. Upload a new version for future applications.
- **Cannot delete a scholarship**: only drafts with no applications can be removed. Close scholarships with application history.
- **Relationship error in application list**: verify all migration foreign keys exist and reload the PostgREST schema cache after database changes (`notify pgrst, 'reload schema';` in SQL Editor).
- **Cannot open file**: allow a new tab for the app and retry. Signed links expire after 60 seconds.
- **Provider signup without organization profile**: check trigger provisioning and Auth logs rather than granting broad table writes to clients.

## Tested locally

The production frontend build and eight migration-based database regression scenarios and nine frontend/session tests pass. Frontend tests use jsdom and mocked service responses. A full Chromium visual check was not completed because the browser download failed. The harness runs real Postgres policies/functions in PGlite but simulates the Supabase Auth and Storage catalog tables. It does not replace these live-project checks.
