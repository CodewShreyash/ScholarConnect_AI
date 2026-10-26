import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, ArrowUpRight, BookOpen, CalendarDays, CheckCircle2, Download,
  FileText, IndianRupee, MapPin, Printer, ShieldCheck, UserRound, WifiOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useResource } from '../../lib/useResource';
import { applications, listDocuments, listScholarships, loadStudent } from '../../lib/api';
import { scholarshipPassport } from '../../lib/featureEngine';
import { buildPassportSnapshot, downloadOfflinePassport } from '../../lib/passportExport';
import AccountLayout from '../../components/layout/AccountLayout';
import Feedback from '../../components/common/Feedback';

function Ring({ value }) {
  return <div className="passport-ring relative w-36 h-36 shrink-0" style={{ background: `conic-gradient(#5b5bd6 ${value * 3.6}deg,#e6e8ee 0deg)`, borderRadius: '999px' }}>
    <div className="absolute inset-[12px] bg-[#fffdf8] rounded-full flex flex-col items-center justify-center">
      <span className="text-3xl font-black text-[#10162f]">{value}%</span>
      <span className="text-[11px] uppercase tracking-[.14em] text-[#737c8c] font-bold">ready</span>
    </div>
  </div>;
}

function Detail({ label, value, icon: Icon }) {
  return <div className="passport-detail border-b border-[#eceef2] py-3 flex items-start justify-between gap-4">
    <div className="flex items-center gap-2 text-[#687285] text-sm">{Icon && <Icon size={15} className="text-[#7a82a0]" />}<span>{label}</span></div>
    <strong className="text-sm text-[#10162f] text-right max-w-[60%] break-words">{value || 'Not provided'}</strong>
  </div>;
}

export default function Passport() {
  const { user } = useAuth();
  const [exportError, setExportError] = useState('');
  const [message, setMessage] = useState('');

  const { data, error, loading, reload } = useResource(async () => {
    const [profile, documents, scholarships, apps] = await Promise.all([
      loadStudent(user.id),
      listDocuments(user.id),
      listScholarships(true),
      applications(),
    ]);
    return { profile, documents, scholarships, apps };
  }, [user.id]);

  const passport = data ? scholarshipPassport(data.profile, data.documents, data.scholarships, data.apps) : null;
  const snapshot = useMemo(() => data && passport ? buildPassportSnapshot({
    userId: user.id,
    profile: data.profile,
    documents: data.documents,
    scholarships: data.scholarships,
    applications: data.apps,
    passport,
  }) : null, [data, passport, user.id]);

  const sections = data && [
    ['Identity', Boolean(data.profile.full_name && data.profile.date_of_birth && data.profile.domicile_state), UserRound, 'Name, date of birth and domicile'],
    ['Community category', Boolean(data.profile.category), ShieldCheck, 'Eligibility category and domicile'],
    ['Academic profile', Boolean(data.profile.education_level && data.profile.percentage !== null && data.profile.institution), BookOpen, 'Education, institution and marks'],
    ['Income profile', data.profile.family_income !== null && data.profile.family_income !== undefined, IndianRupee, 'Annual family income'],
    ['Document vault', passport.documentPercentage >= 70, FileText, `${passport.documentCount} of ${passport.documentTotal} core document types ready`],
  ];

  const downloadPassport = () => {
    setExportError('');
    setMessage('');
    try {
      downloadOfflinePassport(snapshot);
      setMessage('Offline Passport downloaded. It can be opened and printed even without internet access.');
    } catch (err) {
      setExportError(err?.message || 'Unable to download the offline passport.');
    }
  };

  const printPassport = () => {
    setExportError('');
    if (typeof window === 'undefined') return;
    const cleanup = () => document.body.classList.remove('passport-printing');
    document.body.classList.add('passport-printing');
    window.addEventListener('afterprint', cleanup, { once: true });
    try {
      window.print();
    } catch (err) {
      cleanup();
      setExportError(err?.message || 'Unable to open the print dialog.');
    }
  };

  const profile = data?.profile || {};
  const readyDocuments = snapshot?.documents?.filter(document => document.ready).length || 0;

  return <AccountLayout title="Scholarship Passport">
    <Feedback loading={loading} error={error || exportError} message={message} />
    {error && <button onClick={reload} className="sc-secondary">Retry</button>}

    {data && <>
      <div className="passport-screen-actions flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6 rounded-2xl border border-[#dfe1f4] bg-[#f5f5ff] p-4 sm:p-5">
        <div className="flex gap-3">
          <div className="w-11 h-11 shrink-0 rounded-xl bg-[#5b5bd6] text-white flex items-center justify-center"><WifiOff size={20} /></div>
          <div>
            <p className="font-extrabold text-[#10162f]">Keep your Passport available offline</p>
            <p className="text-sm text-[#687285] mt-1 leading-6">Download a self-contained snapshot for offline access, or print it directly and choose <strong>Save as PDF</strong>.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 xl:justify-end shrink-0">
          <button type="button" onClick={downloadPassport} className="sc-primary"><Download size={17} /> Download Offline Passport</button>
          <button type="button" onClick={printPassport} className="sc-secondary"><Printer size={17} /> Print / Save as PDF</button>
        </div>
      </div>

      <div id="scholarship-passport-print" className="passport-print-root">
        <section className="sc-card overflow-hidden mb-6 passport-hero-card">
          <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-center p-6 sm:p-8 bg-[linear-gradient(120deg,rgba(91,91,214,.10),rgba(23,156,130,.07),transparent)]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="sc-eyebrow">Reusable student identity</p>
                <span className="passport-print-badge sc-pill bg-[#e5f6f1] text-[#147d69]">Offline-ready</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-[-.04em] text-[#10162f] mt-2">{profile.full_name || 'Your scholarship identity'}</h2>
              <p className="text-[#687285] mt-3 max-w-2xl leading-7">Complete your profile and vault once. ScholarConnect reuses the same information to evaluate published opportunities and prepare an offline scholarship identity snapshot. This category-prefixed ID is for ScholarConnect reference only, not a government ID.</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5 text-sm text-[#596377]">
                <span><strong className="text-[#10162f]">ScholarConnect ID:</strong> {snapshot.reference}</span>
                <span><strong className="text-[#10162f]">Generated:</strong> {new Date(snapshot.generatedAt).toLocaleString('en-IN')}</span>
              </div>
              <div className="passport-screen-only flex flex-wrap gap-3 mt-6"><Link to="/student/profile-setup" className="sc-primary">Update profile <ArrowUpRight size={16} /></Link><Link to="/student/documents" className="sc-secondary">Manage documents</Link></div>
            </div>
            <Ring value={passport.readiness} />
          </div>
        </section>

        <section className="grid sm:grid-cols-4 gap-4 mb-7 passport-metrics">
          <div className="sc-card p-5"><p className="text-sm text-[#737c8c]">Profile complete</p><p className="text-3xl font-black text-[#5151c7] mt-2">{passport.profileState.percentage}%</p></div>
          <div className="sc-card p-5"><p className="text-sm text-[#737c8c]">Eligible opportunities</p><p className="text-3xl font-black text-[#10162f] mt-2">{passport.eligibleCount}</p></div>
          <div className="sc-card p-5"><p className="text-sm text-[#737c8c]">Application-ready</p><p className="text-3xl font-black text-[#147d69] mt-2">{passport.readyCount}</p></div>
          <div className="sc-card p-5"><p className="text-sm text-[#737c8c]">Need action</p><p className="text-3xl font-black text-[#a66b12] mt-2">{passport.needActionCount}</p></div>
        </section>

        <section className="grid xl:grid-cols-2 gap-6 mb-6 passport-two-column">
          <div className="sc-card p-6 passport-section">
            <p className="sc-eyebrow">Candidate identity</p>
            <h3 className="text-2xl font-black mt-1 text-[#10162f]">Personal details</h3>
            <div className="mt-5">
              <Detail label="Full name" value={profile.full_name} icon={UserRound} />
              <Detail label="Date of birth" value={profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('en-IN') : ''} icon={CalendarDays} />
              <Detail label="Gender" value={profile.gender} icon={UserRound} />
              <Detail label="Category" value={profile.category} icon={ShieldCheck} />
              <Detail label="State" value={profile.state} icon={MapPin} />
              <Detail label="District" value={profile.district} icon={MapPin} />
              <Detail label="Domicile" value={profile.domicile_state} icon={MapPin} />
            </div>
          </div>

          <div className="sc-card p-6 passport-section">
            <p className="sc-eyebrow">Academic & eligibility</p>
            <h3 className="text-2xl font-black mt-1 text-[#10162f]">Reusable profile data</h3>
            <div className="mt-5">
              <Detail label="Education level" value={profile.education_level} icon={BookOpen} />
              <Detail label="Course / stream" value={profile.course} icon={BookOpen} />
              <Detail label="Year of study" value={profile.year_of_study} icon={BookOpen} />
              <Detail label="Institution" value={profile.institution} icon={BookOpen} />
              <Detail label="Latest percentage" value={profile.percentage !== null && profile.percentage !== undefined ? `${profile.percentage}%` : ''} icon={BookOpen} />
              <Detail label="Annual family income" value={snapshot.candidate.familyIncome} icon={IndianRupee} />
            </div>
          </div>
        </section>

        <div className="grid xl:grid-cols-[1fr_340px] gap-6 mb-6 passport-sections-grid">
          <section className="sc-card p-6 passport-section">
            <div className="flex items-center justify-between gap-4">
              <div><p className="sc-eyebrow">Passport sections</p><h3 className="text-2xl font-black mt-1 text-[#10162f]">What is reusable</h3></div>
              <span className="sc-pill bg-[#eeeeff] text-[#5151c7]">{passport.profileState.percentage}% profile complete</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mt-6">{sections.map(([label, ready, Icon, detail]) => <div key={label} className="border border-[#dde1e7] rounded-2xl p-4 flex gap-3 passport-status-card">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ready ? 'bg-[#e5f6f1] text-[#147d69]' : 'bg-[#fff3da] text-[#9a6714]'}`}><Icon size={18} /></div>
              <div><div className="flex items-center gap-2"><p className="font-extrabold text-[#10162f]">{label}</p>{ready ? <CheckCircle2 size={15} className="text-[#147d69]" /> : <AlertTriangle size={15} className="text-[#b37a18]" />}</div><p className="text-xs text-[#737c8c] mt-1 leading-5">{detail}</p></div>
            </div>)}</div>
          </section>
          <aside className="sc-card-dark rounded-[1.5rem] p-6 h-fit passport-advantage"><ShieldCheck size={24} className="text-[#77dec9]" /><h3 className="text-xl font-black mt-5">Passport advantage</h3><p className="text-sm text-slate-400 leading-6 mt-2">Your Passport turns repeated scholarship form-filling into a reusable readiness layer. Opportunity Rescue uses it to surface what needs action next.</p><p className="text-xs text-slate-400 mt-5">{readyDocuments}/{snapshot.documents.length} core documents are available in this snapshot.</p><Link to="/student/rescue" className="passport-screen-only mt-6 inline-flex items-center gap-2 font-extrabold text-sm text-white">Open Opportunity Rescue <ArrowUpRight size={15} /></Link></aside>
        </div>

        <section className="sc-card p-6 mb-6 passport-section">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div><p className="sc-eyebrow">Document readiness</p><h3 className="text-2xl font-black mt-1 text-[#10162f]">Core offline checklist</h3></div>
            <span className="sc-pill bg-[#f3f4f6] text-[#4e586b]">{readyDocuments}/{snapshot.documents.length} available</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6 passport-document-grid">
            {snapshot.documents.map(document => <div key={document.kind} className={`rounded-2xl border p-4 ${document.ready ? 'border-[#cce9e2] bg-[#f1fbf8]' : 'border-[#f0dfbd] bg-[#fffaf0]'}`}>
              <div className="flex items-start justify-between gap-3"><FileText size={18} className={document.ready ? 'text-[#147d69]' : 'text-[#a66b12]'} /><span className={`text-[10px] font-black tracking-[.08em] rounded-full px-2 py-1 ${document.ready ? 'bg-[#dff3ed] text-[#147d69]' : 'bg-[#fbeaca] text-[#99620f]'}`}>{document.ready ? 'READY' : 'MISSING'}</span></div>
              <p className="font-extrabold text-sm text-[#10162f] mt-3">{document.kind}</p>
              <p className="text-xs text-[#737c8c] mt-1 break-words">{document.ready ? (document.name || 'Available in vault') : 'Not available in this snapshot'}</p>
            </div>)}
          </div>
        </section>

        <section className="sc-card p-6 mb-6 passport-section">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div><p className="sc-eyebrow">Opportunity snapshot</p><h3 className="text-2xl font-black mt-1 text-[#10162f]">Eligible opportunities at download time</h3></div>
            <span className="sc-pill bg-[#eeeeff] text-[#5151c7]">Top {snapshot.topEligible.length || 0} shown</span>
          </div>
          <div className="overflow-x-auto mt-5">
            <table className="w-full min-w-[580px] text-sm passport-table">
              <thead><tr className="text-left text-[#737c8c] border-b border-[#e2e5ea]"><th className="py-3 pr-3">Scholarship</th><th className="py-3 px-3">Match</th><th className="py-3 pl-3">Deadline</th></tr></thead>
              <tbody>{snapshot.topEligible.length ? snapshot.topEligible.map(item => <tr key={`${item.name}-${item.deadline}`} className="border-b border-[#eef0f3] last:border-0"><td className="py-3 pr-3 font-bold text-[#10162f]">{item.name}</td><td className="py-3 px-3 text-[#147d69] font-extrabold">{item.match === null || item.match === undefined ? 'Eligible' : `${item.match}%`}</td><td className="py-3 pl-3 text-[#687285]">{item.deadline ? new Date(item.deadline).toLocaleDateString('en-IN') : 'Not provided'}</td></tr>) : <tr><td colSpan="3" className="py-5 text-[#737c8c]">No eligible opportunities were included in this snapshot.</td></tr>}</tbody>
            </table>
          </div>
        </section>

        <div className="passport-offline-note rounded-2xl border border-[#dfe1f4] bg-[#f5f5ff] p-5 text-sm text-[#596377] leading-6">
          <strong className="text-[#10162f]">Offline snapshot:</strong> This Scholarship Passport is a convenience record generated from the candidate's current ScholarConnect profile. It is not a government-issued certificate and does not replace original documents. Scholarship rules, deadlines and eligibility can change; reconnect to ScholarConnect for the latest status.
        </div>
      </div>
    </>}
  </AccountLayout>;
}
