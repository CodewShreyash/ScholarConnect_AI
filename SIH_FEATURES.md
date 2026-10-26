# ScholarConnect AI — SIH Differentiation Pack

This rebuild adds five SIH-focused product features **without changing the existing Supabase schema, migration, RPCs, storage bucket, authentication flow, or backend API contract**.

## 1. ScholarShield — pre-submission rejection prevention

Location: scholarship detail page.

ScholarShield combines the existing structured eligibility fields, the student's existing profile, required document metadata, and the scholarship deadline into a readiness score. It surfaces concrete blockers such as:

- configured eligibility rules that do not match the current profile;
- missing required documents;
- incomplete Passport/profile fields;
- urgent or expired deadlines.

The existing `submit_application` RPC remains authoritative and unchanged.

## 2. Explainable Eligibility Engine

Location: scholarship detail page.

The frontend explains the same existing structured rule fields used by the current backend matcher:

- `categories`
- `education_levels`
- `states`
- `max_income`
- `min_percentage`

Each rule shows the configured requirement, the student's current value, and a pass/fail state. This is an explanation layer only; it does not replace the server-side `match_scholarships()` result.

## 3. Scholarship Digital Passport

Route: `/student/passport`

The Passport summarizes the student's reusable scholarship identity from the existing `student_profiles` row and `documents` records. It reports:

- profile completeness;
- document readiness;
- eligible opportunity count;
- currently application-ready opportunity count;
- opportunities that still need action.

No new persistence is introduced.

## 4. Opportunity Rescue

Route: `/student/rescue`

Opportunity Rescue ranks currently eligible, unapplied opportunities using:

- backend match score;
- existing required-document readiness;
- deadline urgency.

It tells the student which opportunity to act on and which documents are blocking readiness.

## 5. Visual Rule Builder

Location: provider Create/Edit Scholarship page.

The previous structured rule inputs are rebuilt as a visual rule builder. It still saves into the exact same existing scholarship columns and therefore continues to work with the existing Supabase RPCs. A local sample-profile tester lets providers preview a rule set before saving without creating or modifying student records.

## Backend integrity

The following backend files are intentionally unchanged in this feature rebuild:

- `supabase/migrations/202609290001_initial.sql`
- `src/lib/api.js`
- `src/lib/supabase.js`
- `src/context/AuthContext.jsx`

The new decision-support logic lives in `src/lib/featureEngine.js` and is presentation/readiness logic only. Backend authorization and submission enforcement remain unchanged.

## SIH demo flow

1. Sign in as a student with a completed profile.
2. Open **Scholarship Passport** to show the reusable identity/readiness score.
3. Open **Opportunity Rescue** and choose the top priority opportunity.
4. On the scholarship page, show the **Explainable Eligibility Engine**.
5. Run through **ScholarShield**, showing a missing document or other blocker.
6. Upload the missing document in the existing Document Vault.
7. Reopen the scholarship and show the readiness improvement.
8. Sign in as a provider and open a scholarship editor.
9. Demonstrate the **Rule Builder** and its test-profile preview.


## Digital Passport — offline download and print

The Scholarship Passport now supports offline ownership without any database or backend changes.

### Download Offline Passport

The student can download a self-contained `.html` snapshot containing:

- Passport reference and generation date;
- overall Passport readiness and profile completeness;
- candidate identity and domicile details;
- academic and income information;
- core document readiness checklist;
- current eligible-opportunity snapshot;
- an offline-use disclaimer.

The downloaded file contains all styling inline, so it opens without internet access and includes its own **Print / Save as PDF** button.

### Print / Save as PDF

The live Passport page also has a print action. Print-specific CSS isolates the Passport itself, so the ScholarConnect sidebar, navigation and interactive controls are excluded from the printed copy. The browser's print dialog can be used to print on paper or choose **Save as PDF**.

The offline Passport is deliberately described as a snapshot rather than a government-issued certificate. Students should reconnect to ScholarConnect for current scholarship rules, deadlines and eligibility status.

### Updated SIH demo moment

After showing Passport readiness, click **Download Offline Passport**, disconnect the network (or open the file on another machine), open the downloaded file, and use its built-in **Print / Save as PDF** action. This demonstrates that a student can carry their scholarship readiness record even in low-connectivity environments.
