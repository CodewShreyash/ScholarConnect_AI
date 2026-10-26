import test from 'node:test';
import assert from 'node:assert/strict';
import { explainEligibility, scholarShieldReport, scholarshipPassport, opportunityRescue } from '../src/lib/featureEngine.js';

const profile={full_name:'Asha Madi',date_of_birth:'2004-01-01',gender:'Female',state:'Maharashtra',district:'Pune',education_level:'Undergraduate',course:'BCA',year_of_study:'2',institution:'Demo College',percentage:78,category:'Scheduled Tribe',family_income:240000,domicile_state:'Maharashtra'};
const scholarship={id:'s1',displayName:'Demo Scholarship',categories:['Scheduled Tribe'],education_levels:['Undergraduate'],states:['Maharashtra'],max_income:300000,min_percentage:60,requiredDocuments:['ST Certificate','Income Certificate'],deadlineAt:new Date(Date.now()+5*86400000).toISOString(),eligible:true,match:100};
const documents=[{id:'d1',kind:'ST Certificate',created_at:new Date().toISOString()}];

test('eligibility explanation mirrors structured rule fields',()=>{
 const result=explainEligibility(scholarship,profile);
 assert.equal(result.eligible,true);
 assert.equal(result.score,100);
 assert.ok(result.checks.filter(c=>c.configured).every(c=>c.passed));
});

test('OBC students are not eligible for ST-only opportunities even when category labels use aliases',()=>{
 const obcProfile={...profile,category:'OBC'};
 const explicit=explainEligibility(scholarship,obcProfile);
 assert.equal(explicit.eligible,false);
 assert.equal(explicit.checks.find(check=>check.key==='category').passed,false);

 const legacy=explainEligibility({
  ...scholarship,
  categories:[],
  displayName:'Post-Matric ST Scholarship',
  description:'Support for Scheduled Tribe students',
 },obcProfile);
 assert.equal(legacy.eligible,false);
 assert.equal(legacy.checks.find(check=>check.key==='category').requirement,'Scheduled Tribe');

 const obcScholarship={...scholarship,categories:['Other Backward Class (OBC)']};
 assert.equal(explainEligibility(obcScholarship,obcProfile).eligible,true);
});

test('ScholarShield detects required-document risk',()=>{
 const report=scholarShieldReport(scholarship,profile,documents);
 assert.equal(report.documents.percentage,50);
 assert.ok(report.risks.some(r=>r.title.includes('Income Certificate')));
 assert.equal(report.applicationReady,false);
});

test('passport and rescue reuse current records without persistence changes',()=>{
 const passport=scholarshipPassport(profile,documents,[scholarship],[]);
 assert.equal(passport.eligibleCount,1);
 const rescue=opportunityRescue([scholarship],documents,[]);
 assert.equal(rescue.length,1);
 assert.deepEqual(rescue[0].rescue.missing,['Income Certificate']);
});
