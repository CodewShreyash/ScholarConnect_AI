import test from 'node:test';
import assert from 'node:assert/strict';
import { coreDocumentKinds, documentKindDescriptions } from '../src/lib/documentTypes.js';
import { buildPassportSnapshot } from '../src/lib/passportExport.js';

test('all ten Google Doc checklist items have upload types and descriptions', () => {
  assert.equal(coreDocumentKinds.length, 10);
  assert.ok(coreDocumentKinds.every(kind => documentKindDescriptions[kind]));
  assert.ok(coreDocumentKinds.includes('Gap Certificate'));
  assert.ok(coreDocumentKinds.includes('Ration Card'));
  assert.ok(coreDocumentKinds.includes('Passport-size Photograph'));
  assert.ok(!coreDocumentKinds.includes('ST Certificate'));
});

test('passport readiness checklist covers all ten uploadable document types', () => {
  const snapshot = buildPassportSnapshot({
    userId: 'student-id',
    documents: [{ kind: 'Gap Certificate', name: 'gap.pdf' }],
  });
  assert.equal(snapshot.documents.length, 10);
  assert.equal(snapshot.documents.find(item => item.kind === 'Gap Certificate').ready, true);
  assert.equal(snapshot.documents.filter(item => item.ready).length, 1);
});
