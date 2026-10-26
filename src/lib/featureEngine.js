import { coreDocumentKinds } from './documentTypes.js';

const formatMoney = (value) => value === null || value === undefined || value === ''
  ? 'Not configured'
  : `₹${Number(value).toLocaleString('en-IN')}`;

const text = value => String(value ?? '').trim();
const lower = value => text(value).toLowerCase();

export function normalizeCategory(value) {
  const category = lower(value).replace(/[()]/g, '').replace(/\s+/g, ' ');
  const aliases = new Map([
    ['sc', 'scheduled caste'],
    ['scheduled castes', 'scheduled caste'],
    ['st', 'scheduled tribe'],
    ['scheduled tribes', 'scheduled tribe'],
    ['other backward class', 'obc'],
    ['other backward classes', 'obc'],
    ['other backward class obc', 'obc'],
    ['other backward classes obc', 'obc'],
    ['obc', 'obc'],
    ['economically backward class', 'ebc'],
    ['ebc', 'ebc'],
    ['economically weaker section', 'ews'],
    ['ews', 'ews'],
    ['special backward class', 'sbc'],
    ['sbc', 'sbc'],
    ['vj/nt', 'vjnt'],
    ['nt', 'vjnt'],
    ['vjnt', 'vjnt'],
    ['open', 'general/open'],
    ['general', 'general/open'],
    ['general/open', 'general/open'],
  ]);
  return aliases.get(category) || category;
}

function scholarshipCategories(scholarship) {
  const configured = scholarship?.categories || [];
  if (configured.length) return configured;

  const source = [
    scholarship?.displayName,
    scholarship?.display_name,
    scholarship?.officialName,
    scholarship?.official_name,
    scholarship?.description,
    ...(scholarship?.tags || []),
    ...(scholarship?.eligibility || []),
    ...(scholarship?.requiredDocuments || scholarship?.required_documents || []),
  ].join(' ').toLowerCase();
  const inferred = [
    [/\b(?:scheduled[ -]caste|sc)\b/, 'Scheduled Caste'],
    [/\b(?:scheduled[ -]tribe|st)\b/, 'Scheduled Tribe'],
    [/\b(?:other backward classes?|obc)\b/, 'OBC'],
    [/\b(?:economically backward class|ebc)\b/, 'EBC'],
    [/\b(?:economically weaker section|ews)\b/, 'EWS'],
    [/\b(?:special backward class|sbc)\b/, 'SBC'],
    [/\b(?:vimukta jati|nomadic tribes?|vjnt|vj\/nt)\b/, 'VJNT'],
    [/\bminorit(?:y|ies)\b/, 'Minority'],
    [/\b(?:persons? with disabilit(?:y|ies)|pwd|divyang)\b/, 'Person with disability'],
  ].filter(([pattern]) => pattern.test(source)).map(([, category]) => category);
  return inferred;
}

export function daysUntil(deadline) {
  const target = new Date(deadline);
  if (Number.isNaN(target.getTime())) return null;
  return Math.ceil((target.getTime() - Date.now()) / 86400000);
}

export function explainEligibility(scholarship, profile) {
  const checks = [];
  const add = (key, label, configured, passed, requirement, actual, weight) => {
    checks.push({ key, label, configured, passed: configured ? Boolean(passed) : true, requirement, actual, weight });
  };

  const categories = scholarshipCategories(scholarship);
  add(
    'category',
    'Community category',
    categories.length > 0,
    categories.some(v => normalizeCategory(v) === normalizeCategory(profile?.category)),
    categories.length ? categories.join(', ') : 'No category restriction',
    text(profile?.category) || 'Not provided',
    25,
  );

  const educationLevels = scholarship?.education_levels || [];
  add(
    'education',
    'Education level',
    educationLevels.length > 0,
    educationLevels.some(v => lower(v) === lower(profile?.education_level)),
    educationLevels.length ? educationLevels.join(', ') : 'All education levels',
    text(profile?.education_level) || 'Not provided',
    20,
  );

  const states = scholarship?.states || [];
  add(
    'domicile',
    'Domicile state',
    states.length > 0,
    states.some(v => lower(v) === lower(profile?.domicile_state)),
    states.length ? states.join(', ') : 'All states / UTs',
    text(profile?.domicile_state) || 'Not provided',
    15,
  );

  add(
    'income',
    'Annual family income',
    scholarship?.max_income !== null && scholarship?.max_income !== undefined,
    profile?.family_income !== null && profile?.family_income !== undefined && Number(profile.family_income) <= Number(scholarship.max_income),
    scholarship?.max_income !== null && scholarship?.max_income !== undefined ? `Up to ${formatMoney(scholarship.max_income)}` : 'No income ceiling configured',
    profile?.family_income !== null && profile?.family_income !== undefined ? formatMoney(profile.family_income) : 'Not provided',
    20,
  );

  add(
    'percentage',
    'Academic percentage',
    scholarship?.min_percentage !== null && scholarship?.min_percentage !== undefined,
    profile?.percentage !== null && profile?.percentage !== undefined && Number(profile.percentage) >= Number(scholarship.min_percentage),
    scholarship?.min_percentage !== null && scholarship?.min_percentage !== undefined ? `${Number(scholarship.min_percentage)}% or above` : 'No minimum percentage configured',
    profile?.percentage !== null && profile?.percentage !== undefined ? `${Number(profile.percentage)}%` : 'Not provided',
    20,
  );

  const configured = checks.filter(c => c.configured);
  const earned = configured.reduce((sum, c) => sum + (c.passed ? c.weight : 0), 0);
  const possible = configured.reduce((sum, c) => sum + c.weight, 0);
  const score = possible ? Math.round((earned / possible) * 100) : 100;
  const eligible = configured.every(c => c.passed);
  return { checks, score, eligible, configuredCount: configured.length };
}

export function profileCompleteness(profile) {
  const fields = [
    ['Full name', profile?.full_name],
    ['Date of birth', profile?.date_of_birth],
    ['Gender', profile?.gender],
    ['State', profile?.state],
    ['District', profile?.district],
    ['Education level', profile?.education_level],
    ['Course / stream', profile?.course],
    ['Year of study', profile?.year_of_study],
    ['Institution', profile?.institution],
    ['Academic percentage', profile?.percentage],
    ['Category', profile?.category],
    ['Family income', profile?.family_income],
    ['Domicile state', profile?.domicile_state],
  ];
  const ready = fields.filter(([, value]) => value !== null && value !== undefined && text(value) !== '');
  return {
    fields: fields.map(([label, value]) => ({ label, ready: value !== null && value !== undefined && text(value) !== '' })),
    ready: ready.length,
    total: fields.length,
    percentage: Math.round((ready.length / fields.length) * 100),
  };
}

export function latestDocumentsByKind(documents = []) {
  const result = new Map();
  [...documents]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .forEach(doc => { if (!result.has(doc.kind)) result.set(doc.kind, doc); });
  return result;
}

export function documentReadiness(scholarship, documents = []) {
  const latest = latestDocumentsByKind(documents);
  const required = scholarship?.requiredDocuments || scholarship?.required_documents || [];
  const ready = required.filter(kind => latest.has(kind));
  const missing = required.filter(kind => !latest.has(kind));
  return {
    required,
    ready,
    missing,
    percentage: required.length ? Math.round((ready.length / required.length) * 100) : 100,
  };
}

export function scholarShieldReport(scholarship, profile, documents = []) {
  const eligibility = explainEligibility(scholarship, profile);
  const profileState = profileCompleteness(profile);
  const docs = documentReadiness(scholarship, documents);
  const days = daysUntil(scholarship?.deadlineAt || scholarship?.deadline);
  const risks = [];

  eligibility.checks.filter(c => c.configured && !c.passed).forEach(c => risks.push({
    severity: 'critical',
    type: 'Eligibility conflict',
    title: `${c.label} does not meet the configured rule`,
    detail: `Required: ${c.requirement}. Your profile: ${c.actual}.`,
    action: 'Update your profile if the information is incorrect, or choose another eligible scholarship.',
  }));

  docs.missing.forEach(kind => risks.push({
    severity: 'high',
    type: 'Missing document',
    title: `${kind} is required`,
    detail: 'This document is configured as mandatory for submission and is not available in your current vault.',
    action: `Upload ${kind} to your Document Vault before submitting.`,
  }));

  if (profileState.percentage < 100) {
    const missingFields = profileState.fields.filter(f => !f.ready).map(f => f.label);
    risks.push({
      severity: 'medium',
      type: 'Profile completeness',
      title: `${missingFields.length} profile field${missingFields.length === 1 ? '' : 's'} still incomplete`,
      detail: missingFields.slice(0, 4).join(', ') + (missingFields.length > 4 ? ` +${missingFields.length - 4} more` : ''),
      action: 'Complete your Scholarship Passport so future eligibility checks have better evidence.',
    });
  }

  if (days !== null && days >= 0 && days <= 7) {
    risks.push({
      severity: days <= 2 ? 'critical' : 'medium',
      type: 'Deadline risk',
      title: days === 0 ? 'Deadline is today' : `${days} day${days === 1 ? '' : 's'} remaining`,
      detail: 'A short deadline leaves limited time to correct documents or profile information.',
      action: 'Resolve the remaining issues now and submit as soon as the application is ready.',
    });
  }

  if (days !== null && days < 0) {
    risks.push({ severity: 'critical', type: 'Deadline risk', title: 'Deadline has passed', detail: 'This opportunity is no longer within its configured application window.', action: 'Return to Opportunity Rescue to find currently open scholarships.' });
  }

  const eligibilityPart = eligibility.eligible ? 35 : Math.round(35 * eligibility.score / 100);
  const profilePart = Math.round(20 * profileState.percentage / 100);
  const documentPart = Math.round(35 * docs.percentage / 100);
  const deadlinePart = days === null ? 5 : days < 0 ? 0 : days <= 2 ? 4 : days <= 7 ? 7 : 10;
  const readiness = Math.max(0, Math.min(100, eligibilityPart + profilePart + documentPart + deadlinePart));

  return {
    readiness,
    eligibility,
    profile: profileState,
    documents: docs,
    daysRemaining: days,
    risks,
    applicationReady: eligibility.eligible && docs.missing.length === 0 && profileState.percentage >= 70 && (days === null || days >= 0),
  };
}

export function scholarshipPassport(profile, documents = [], scholarships = [], applications = []) {
  const profileState = profileCompleteness(profile);
  const latest = latestDocumentsByKind(documents);
  const coreDocuments = coreDocumentKinds;
  const docPercent = Math.round((coreDocuments.filter(kind => latest.has(kind)).length / coreDocuments.length) * 100);
  const readiness = Math.round(profileState.percentage * 0.65 + docPercent * 0.35);
  const eligible = scholarships.filter(s => s.eligible);
  const appliedIds = new Set(applications.map(a => a.scholarship_id));
  const ready = eligible.filter(s => documentReadiness(s, documents).missing.length === 0 && !appliedIds.has(s.id));
  const needAction = eligible.filter(s => documentReadiness(s, documents).missing.length > 0 && !appliedIds.has(s.id));
  return {
    readiness,
    profileState,
    documentPercentage: docPercent,
    documentCount: coreDocuments.filter(kind => latest.has(kind)).length,
    documentTotal: coreDocuments.length,
    eligibleCount: eligible.length,
    readyCount: ready.length,
    needActionCount: needAction.length,
  };
}

export function opportunityRescue(scholarships = [], documents = [], applications = []) {
  const appliedIds = new Set(applications.map(a => a.scholarship_id));
  return scholarships
    .filter(s => s.eligible && !appliedIds.has(s.id))
    .map(s => {
      const docs = documentReadiness(s, documents);
      const days = daysUntil(s.deadlineAt || s.deadline);
      const deadlineScore = days === null ? 30 : days < 0 ? 0 : days <= 2 ? 100 : days <= 7 ? 85 : days <= 14 ? 65 : days <= 30 ? 45 : 25;
      const readiness = docs.percentage;
      const match = s.match ?? 100;
      const priority = Math.round(match * 0.35 + readiness * 0.35 + deadlineScore * 0.30);
      return { ...s, rescue: { priority, readiness, daysRemaining: days, missing: docs.missing } };
    })
    .filter(s => s.rescue.daysRemaining === null || s.rescue.daysRemaining >= 0)
    .sort((a, b) => b.rescue.priority - a.rescue.priority);
}
