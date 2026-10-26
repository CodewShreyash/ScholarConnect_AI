import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPassportSnapshot,
  createOfflinePassportHtml,
  offlinePassportFileName,
  passportReference,
} from '../src/lib/passportExport.js';

const profile = {
  full_name: 'Asha <Madi>',
  date_of_birth: '2004-01-01',
  gender: 'Female',
  state: 'Maharashtra',
  district: 'Pune',
  education_level: 'Undergraduate',
  course: 'BCA',
  year_of_study: '2',
  institution: 'Demo College',
  percentage: 78,
  category: 'Scheduled Tribe',
  family_income: 240000,
  domicile_state: 'Maharashtra',
};

const passport = {
  readiness: 86,
  profileState: { percentage: 90 },
  eligibleCount: 3,
  readyCount: 2,
  needActionCount: 1,
};

const documents = [
  { kind: 'Category Certificate', name: 'category-certificate.pdf', created_at: '2026-09-30T10:00:00.000Z' },
  { kind: 'Marksheet', name: 'marksheet.pdf', created_at: '2026-09-30T10:00:00.000Z' },
];

const scholarships = [
  { id: 's1', displayName: 'Top Class Scholarship', eligible: true, match: 100, deadlineAt: '2026-12-31T00:00:00.000Z' },
];

test('builds an offline passport snapshot from existing frontend data', () => {
  const snapshot = buildPassportSnapshot({
    userId: '11111111-2222-4333-8444-555555555555',
    profile,
    documents,
    scholarships,
    applications: [],
    passport,
    generatedAt: new Date('2026-10-01T05:30:00.000Z'),
  });

  assert.equal(snapshot.readiness, 86);
  assert.equal(snapshot.documents.filter(item => item.ready).length, 2);
  assert.equal(snapshot.topEligible[0].name, 'Top Class Scholarship');
  assert.match(snapshot.reference, /^ST-/);
});

test('offline HTML is self-contained, printable and escapes candidate-provided content', () => {
  const snapshot = buildPassportSnapshot({
    userId: 'student-id',
    profile,
    documents,
    scholarships,
    applications: [],
    passport,
    generatedAt: new Date('2026-10-01T05:30:00.000Z'),
  });
  const html = createOfflinePassportHtml(snapshot);

  assert.match(html, /Print \/ Save as PDF/);
  assert.match(html, /Offline snapshot/);
  assert.match(html, /Asha &lt;Madi&gt;/);
  assert.doesNotMatch(html, /Asha <Madi>/);
  assert.match(html, /@media print/);
});

test('offline passport filename is safe and reference is deterministic', () => {
  const snapshot = {
    generatedAt: '2026-10-01T05:30:00.000Z',
    candidate: { fullName: 'Asha Madi / Student' },
  };
  assert.equal(offlinePassportFileName(snapshot), 'ScholarConnect-Passport-Asha-Madi-Student-2026-10-01.html');
  assert.equal(passportReference('abc-123'), passportReference('abc-123'));
  assert.match(passportReference('abc-123', 'OBC'), /^OBC-/);
  assert.match(passportReference('abc-123', 'Other Backward Class (OBC)'), /^OBC-/);
});
