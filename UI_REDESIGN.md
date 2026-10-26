# ScholarConnect UI Redesign

This build keeps the existing Supabase/authentication/application logic and replaces the generic white-heavy visual system with a more distinctive product UI.

## New visual direction
- Deep ink/navy application chrome (`#10162f`)
- ScholarConnect indigo (`#5b5bd6`) as the primary action color
- Teal eligibility/success accents (`#179c82`)
- Warm amber call-to-action accents (`#f5bf55`)
- Warm off-white workspace canvas (`#f4f5f1`) instead of plain white
- Editorial typography, stronger hierarchy, denser SaaS cards and intentional whitespace
- Desktop workspace sidebar for student/provider areas
- Responsive dark floating public navigation

## Major redesigned areas
- Landing page
- Public navigation
- Scholarship explorer
- Scholarship details
- Login
- Registration
- Student dashboard
- Provider dashboard
- Shared student/provider account shell
- Profile setup visual system
- Supporting forms/cards through shared component styles

## Functional behavior preserved
No database schema or Supabase service behavior was intentionally changed by this UI pass. Existing authentication, roles, profiles, documents, scholarship data, matching, application submission and provider review flows remain wired to the existing code.

## Running locally
Install dependencies for your own operating system instead of using a copied `node_modules` directory:

```bash
npm install
npm run dev
```

For a production check:

```bash
npm run build
```
