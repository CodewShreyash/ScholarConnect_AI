import { coreDocumentKinds } from './documentTypes.js';

const CORE_DOCUMENTS = [
  ...coreDocumentKinds,
];

function asText(value, fallback = 'Not provided') {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
}

function safeDate(value) {
  if (!value) return 'Not provided';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? asText(value)
    : new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function safeMoney(value) {
  if (value === null || value === undefined || value === '') return 'Not provided';
  const amount = Number(value);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
    : asText(value);
}

export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function passportReference(userId = '', category = '') {
  const clean = String(userId).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const categoryName = String(category).trim().toLowerCase().replace(/[()]/g, '').replace(/\s*\/\s*/g, '/').replace(/\s+/g, ' ');
  const prefix = new Map([
    ['scheduled caste', 'SC'],
    ['sc', 'SC'],
    ['scheduled tribe', 'ST'],
    ['st', 'ST'],
    ['obc', 'OBC'],
    ['other backward class', 'OBC'],
    ['other backward classes', 'OBC'],
    ['other backward class obc', 'OBC'],
    ['other backward classes obc', 'OBC'],
    ['ebc', 'EBC'],
    ['economically backward class', 'EBC'],
    ['ews', 'EWS'],
    ['economically weaker section', 'EWS'],
    ['sbc', 'SBC'],
    ['special backward class', 'SBC'],
    ['vjnt', 'VJNT'],
    ['vj/nt', 'VJNT'],
    ['general', 'GEN'],
    ['general/open', 'GEN'],
    ['open', 'GEN'],
    ['minorities', 'MIN'],
    ['minority', 'MIN'],
    ['person with disability', 'PWD'],
    ['other', 'OTH'],
  ]).get(categoryName) || (categoryName ? 'OTH' : 'STUDENT');
  return `${prefix}-${(clean.slice(0, 10) || 'OFFLINE').padEnd(10, '0')}`;
}

export function buildPassportSnapshot({ userId, profile = {}, documents = [], scholarships = [], applications = [], passport = {}, generatedAt = new Date() }) {
  const docByKind = new Map();
  for (const document of documents) {
    if (!docByKind.has(document.kind)) docByKind.set(document.kind, document);
  }

  const eligible = scholarships.filter(item => item.eligible);
  const topEligible = eligible.slice(0, 5).map(item => ({
    name: item.displayName || item.display_name || item.officialName || item.official_name || 'Scholarship',
    match: item.match ?? null,
    deadline: item.deadlineAt || item.deadline || null,
  }));

  return {
    reference: passportReference(userId, profile.category),
    generatedAt: generatedAt instanceof Date ? generatedAt.toISOString() : new Date(generatedAt).toISOString(),
    readiness: Number(passport.readiness || 0),
    profileCompletion: Number(passport.profileState?.percentage || 0),
    eligibleCount: Number(passport.eligibleCount || eligible.length || 0),
    readyCount: Number(passport.readyCount || 0),
    needActionCount: Number(passport.needActionCount || 0),
    applicationCount: applications.length,
    candidate: {
      fullName: asText(profile.full_name, 'Student'),
      dateOfBirth: safeDate(profile.date_of_birth),
      gender: asText(profile.gender),
      state: asText(profile.state),
      district: asText(profile.district),
      domicileState: asText(profile.domicile_state),
      category: asText(profile.category),
      educationLevel: asText(profile.education_level),
      course: asText(profile.course),
      yearOfStudy: asText(profile.year_of_study),
      institution: asText(profile.institution),
      percentage: profile.percentage === null || profile.percentage === undefined || profile.percentage === '' ? 'Not provided' : `${profile.percentage}%`,
      familyIncome: safeMoney(profile.family_income),
    },
    documents: CORE_DOCUMENTS.map(kind => {
      const document = docByKind.get(kind);
      return {
        kind,
        ready: Boolean(document),
        name: document?.name || '',
        uploadedAt: document?.created_at ? safeDate(document.created_at) : '',
      };
    }),
    topEligible,
  };
}

function rows(items) {
  return items.map(([label, value]) => `
    <div class="detail-row">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>`).join('');
}

export function createOfflinePassportHtml(snapshot) {
  const generated = new Date(snapshot.generatedAt);
  const generatedLabel = Number.isNaN(generated.getTime())
    ? asText(snapshot.generatedAt)
    : new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(generated);

  const candidate = snapshot.candidate || {};
  const documents = snapshot.documents || [];
  const opportunities = snapshot.topEligible || [];
  const readiness = Math.max(0, Math.min(100, Number(snapshot.readiness || 0)));

  const documentCards = documents.map(document => `
    <div class="document ${document.ready ? 'ready' : 'missing'}">
      <div>
        <strong>${escapeHtml(document.kind)}</strong>
        <small>${document.ready ? escapeHtml(document.name || 'Available in vault') : 'Not available in this passport snapshot'}</small>
      </div>
      <span>${document.ready ? 'READY' : 'MISSING'}</span>
    </div>`).join('');

  const opportunityRows = opportunities.length
    ? opportunities.map(item => `
      <tr>
        <td>${escapeHtml(item.name)}</td>
        <td>${item.match === null || item.match === undefined ? 'Eligible' : `${escapeHtml(item.match)}%`}</td>
        <td>${escapeHtml(safeDate(item.deadline))}</td>
      </tr>`).join('')
    : '<tr><td colspan="3">No eligible opportunities were included in this snapshot.</td></tr>';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>ScholarConnect Passport - ${escapeHtml(candidate.fullName || 'Student')}</title>
<style>
  :root{--ink:#10162f;--indigo:#5b5bd6;--teal:#147d69;--cream:#f4f5f1;--paper:#fffdf8;--line:#dfe3e9;--muted:#687285;--amber:#9a6714}
  *{box-sizing:border-box} body{margin:0;background:var(--cream);color:#172036;font-family:Inter,Arial,sans-serif;line-height:1.45}
  .toolbar{position:sticky;top:0;z-index:5;display:flex;justify-content:center;gap:10px;padding:12px;background:rgba(16,22,47,.96)}
  .toolbar button{border:0;border-radius:10px;padding:10px 16px;font-weight:800;cursor:pointer;background:white;color:var(--ink)}
  .page{width:min(900px,calc(100% - 28px));margin:24px auto;background:var(--paper);border:1px solid var(--line);border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(16,22,47,.12)}
  .hero{padding:34px;background:linear-gradient(125deg,#10162f,#182245);color:white;display:grid;grid-template-columns:1fr auto;gap:28px;align-items:center}
  .brand{font-size:12px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:#8ce4d3}.hero h1{margin:8px 0 4px;font-size:34px;letter-spacing:-.04em}.hero p{margin:0;color:#c7cede}
  .score{width:116px;height:116px;border-radius:999px;display:grid;place-items:center;background:conic-gradient(#77dec9 ${readiness * 3.6}deg,rgba(255,255,255,.14) 0)}
  .score>div{width:92px;height:92px;border-radius:999px;background:#10162f;display:flex;flex-direction:column;align-items:center;justify-content:center}.score strong{font-size:27px}.score span{font-size:10px;letter-spacing:.12em;color:#b9c1d2}
  .content{padding:30px}.meta{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:26px}.metric{border:1px solid var(--line);border-radius:14px;padding:14px}.metric span{display:block;color:var(--muted);font-size:12px}.metric strong{font-size:20px;color:var(--ink)}
  .section{margin-top:28px}.section h2{font-size:20px;margin:0 0 12px;color:var(--ink)}.grid{display:grid;grid-template-columns:1fr 1fr;gap:0 20px;border:1px solid var(--line);border-radius:16px;padding:8px 18px}.detail-row{display:flex;justify-content:space-between;gap:16px;padding:11px 0;border-bottom:1px solid #eceef2}.detail-row:nth-last-child(-n+2){border-bottom:0}.detail-row span{color:var(--muted);font-size:13px}.detail-row strong{text-align:right;font-size:13px;color:var(--ink)}
  .documents{display:grid;grid-template-columns:1fr 1fr;gap:10px}.document{border:1px solid var(--line);border-radius:14px;padding:13px 14px;display:flex;align-items:center;justify-content:space-between;gap:12px}.document strong{display:block;font-size:13px}.document small{display:block;margin-top:3px;color:var(--muted);font-size:11px;max-width:260px;overflow-wrap:anywhere}.document>span{font-size:10px;font-weight:900;border-radius:999px;padding:5px 8px}.document.ready>span{background:#e5f6f1;color:var(--teal)}.document.missing>span{background:#fff3da;color:var(--amber)}
  table{width:100%;border-collapse:collapse;border:1px solid var(--line);border-radius:14px;overflow:hidden}th,td{padding:11px 12px;text-align:left;border-bottom:1px solid var(--line);font-size:12px}th{background:#f6f6fb;color:var(--ink)}td{color:#4f5a6d}tr:last-child td{border-bottom:0}
  .notice{margin-top:28px;padding:16px 18px;border-radius:14px;background:#f1f2fb;border:1px solid #dfe0f6;color:#4e5770;font-size:12px}.footer{padding:18px 30px;border-top:1px solid var(--line);display:flex;justify-content:space-between;gap:16px;color:var(--muted);font-size:11px}
  @media(max-width:650px){.hero{grid-template-columns:1fr}.score{width:100px;height:100px}.score>div{width:78px;height:78px}.meta,.grid,.documents{grid-template-columns:1fr}.detail-row:nth-last-child(-n+2){border-bottom:1px solid #eceef2}.detail-row:last-child{border-bottom:0}.footer{flex-direction:column}}
  @media print{@page{size:A4;margin:10mm}body{background:white}.toolbar{display:none}.page{width:100%;margin:0;border:0;border-radius:0;box-shadow:none}.hero{padding:22px 24px}.content{padding:20px 24px}.section{break-inside:avoid}.documents{grid-template-columns:1fr 1fr}.footer{padding:14px 24px}}
</style>
</head>
<body>
  <div class="toolbar"><button onclick="window.print()">Print / Save as PDF</button></div>
  <article class="page">
    <header class="hero">
      <div>
        <div class="brand">ScholarConnect Scholarship Passport</div>
        <h1>${escapeHtml(candidate.fullName || 'Student')}</h1>
        <p>Offline snapshot · Reference ${escapeHtml(snapshot.reference || '')}</p>
      </div>
      <div class="score"><div><strong>${readiness}%</strong><span>READY</span></div></div>
    </header>
    <main class="content">
      <section class="meta">
        <div class="metric"><span>Profile complete</span><strong>${escapeHtml(snapshot.profileCompletion ?? 0)}%</strong></div>
        <div class="metric"><span>Eligible opportunities</span><strong>${escapeHtml(snapshot.eligibleCount ?? 0)}</strong></div>
        <div class="metric"><span>Application-ready</span><strong>${escapeHtml(snapshot.readyCount ?? 0)}</strong></div>
      </section>

      <section class="section">
        <h2>Candidate identity</h2>
        <div class="grid">${rows([
          ['Full name', candidate.fullName],
          ['Date of birth', candidate.dateOfBirth],
          ['Gender', candidate.gender],
          ['Category', candidate.category],
          ['State', candidate.state],
          ['District', candidate.district],
          ['Domicile state', candidate.domicileState],
          ['ScholarConnect ID (not a government ID)', snapshot.reference],
        ])}</div>
      </section>

      <section class="section">
        <h2>Academic & eligibility profile</h2>
        <div class="grid">${rows([
          ['Education level', candidate.educationLevel],
          ['Course / stream', candidate.course],
          ['Year of study', candidate.yearOfStudy],
          ['Institution', candidate.institution],
          ['Latest percentage', candidate.percentage],
          ['Annual family income', candidate.familyIncome],
        ])}</div>
      </section>

      <section class="section">
        <h2>Core document readiness</h2>
        <div class="documents">${documentCards}</div>
      </section>

      <section class="section">
        <h2>Eligible opportunity snapshot</h2>
        <table><thead><tr><th>Scholarship</th><th>Match</th><th>Deadline</th></tr></thead><tbody>${opportunityRows}</tbody></table>
      </section>

      <div class="notice"><strong>Offline snapshot:</strong> This passport is a student convenience record generated from ScholarConnect data at ${escapeHtml(generatedLabel)}. It is not a government-issued certificate and does not replace original supporting documents. Eligibility, deadlines and scholarship availability can change; reconnect to ScholarConnect for current status.</div>
    </main>
    <footer class="footer"><span>Generated ${escapeHtml(generatedLabel)}</span><span>${escapeHtml(snapshot.reference || '')} · ScholarConnect AI</span></footer>
  </article>
</body>
</html>`;
}

export function offlinePassportFileName(snapshot) {
  const rawName = snapshot?.candidate?.fullName || 'Student';
  const safeName = rawName.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'Student';
  const date = new Date(snapshot?.generatedAt || Date.now()).toISOString().slice(0, 10);
  return `ScholarConnect-Passport-${safeName}-${date}.html`;
}

export function downloadOfflinePassport(snapshot) {
  if (typeof window === 'undefined' || typeof document === 'undefined') throw new Error('Offline download is only available in the browser.');
  const blob = new Blob([createOfflinePassportHtml(snapshot)], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = offlinePassportFileName(snapshot);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
