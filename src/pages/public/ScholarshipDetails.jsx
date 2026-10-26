import { Link, useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ArrowUpRight, BookOpen, CalendarDays, CheckCircle2, FileText, MapPin, ShieldCheck, Sparkles, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getScholarship, listDocuments, loadStudent, apply } from '../../lib/api';
import { scholarShieldReport } from '../../lib/featureEngine';
import { useResource } from '../../lib/useResource';
import { errorMessage } from '../../lib/supabase';
import Feedback from '../../components/common/Feedback';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import studentPortalImage from '../../assets/student-portal-graduates.png';
import providerPortalImage from '../../assets/provider-portal-team.png';

const tone={critical:'bg-[#fff0ed] border-[#f0c7c0] text-[#9d463d]',high:'bg-[#fff4dd] border-[#f0d39a] text-[#8a5a10]',medium:'bg-[#f7f1ff] border-[#ded0f2] text-[#6848a1]'};
const money=v=>v===null||v===undefined?'Not restricted':`₹${Number(v).toLocaleString('en-IN')}`;

export default function ScholarshipDetails(){
  const {id}=useParams();
  const {user,profile}=useAuth(),navigate=useNavigate();
  const [busy,setBusy]=useState(false),[actionError,setActionError]=useState('');
  const student=profile?.role==='student';
  const provider=profile?.role==='provider';
  const roleImage=student?studentPortalImage:provider?providerPortalImage:null;
  const {data,error,loading,reload}=useResource(async()=>{
    const scholarship=await getScholarship(id,student);
    if(!student)return {scholarship,documents:[],studentProfile:null};
    const [documents,studentProfile]=await Promise.all([listDocuments(user.id),loadStudent(user.id)]);
    return {scholarship,documents,studentProfile};
  },[id,profile?.id]);
  const scholarship=data?.scholarship;
  const report=scholarship&&student?scholarShieldReport(scholarship,data.studentProfile,data.documents):null;
  const submit=async()=>{
    if(!user){navigate('/login',{state:{from:'/scholarships/'+id}});return;}
    if(!student){setActionError('Use a student account to apply.');return;}
    setBusy(true);setActionError('');
    try{await apply(scholarship,data.documents);navigate('/student/applications');}catch(err){setActionError(errorMessage(err));}finally{setBusy(false);}
  };

  if(loading)return <Feedback loading/>;
  if(error)return <main className="p-8"><Feedback error={error}/><button onClick={reload} className="sc-secondary">Retry</button></main>;
  if(!scholarship)return <div className="min-h-screen flex items-center justify-center bg-[#f4f5f1] px-4"><div className="text-center"><h1 className="text-3xl font-bold">Scholarship not found</h1><Link to="/scholarships" className="inline-flex mt-5 text-[#5151c7] font-semibold">Back to Scholarships</Link></div></div>;

  const docs=report?.documents;
  const canSubmit=!student || (scholarship.eligible && docs?.missing.length===0);

  return <div
    className={student ? "student-discovery-shell" : provider ? "provider-discovery-shell" : "min-h-screen bg-[#f4f5f1]"}
    style={student ? { "--student-portal-image": `url(${studentPortalImage})` } : provider ? { "--provider-portal-image": `url(${providerPortalImage})` } : undefined}
  ><Navbar/><main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
    <Feedback error={actionError}/>
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5"><Link to={student?"/student/dashboard":"/scholarships"} className="inline-flex items-center gap-2 text-sm font-bold text-[#596276]"><ArrowLeft size={16}/> {student?"Back to dashboard":"Back to opportunities"}</Link>{student&&<Link to="/student/rescue" className="inline-flex items-center gap-2 text-sm font-extrabold text-[#5b5bd6]">Opportunity Rescue <ArrowUpRight size={15}/></Link>}</div>

    <section
      className="sc-card-dark rounded-[2rem] p-6 sm:p-8 relative overflow-hidden"
      style={roleImage ? { backgroundImage: `linear-gradient(90deg, rgba(13,21,48,.96) 0%, rgba(13,21,48,.84) 48%, rgba(13,21,48,.38) 100%), url(${roleImage})`, backgroundSize: 'cover', backgroundPosition: provider ? 'center 48%' : 'center 42%' } : undefined}
    ><div className="absolute -right-24 -top-24 w-72 h-72 rounded-full border-[48px] border-[#5b5bd6]/20"/><div className="relative flex flex-col lg:flex-row lg:items-start justify-between gap-7"><div className="max-w-3xl"><div className="flex flex-wrap items-center gap-2"><span className="sc-pill bg-white/10 text-slate-200">{scholarship.providerType}</span>{scholarship.verified&&<span className="sc-pill bg-[#179c82]/16 text-[#77dec9]"><CheckCircle2 size={14}/> Verified opportunity</span>}</div><h1 className="mt-5 text-3xl sm:text-5xl font-black tracking-[-.045em] text-white">{scholarship.displayName}</h1><p className="mt-3 text-sm text-slate-400">Official scheme: {scholarship.officialName||'Not specified'}</p><p className="mt-5 text-slate-300 leading-7 max-w-2xl">{scholarship.description}</p></div>
      <div className="bg-white/[.07] border border-white/10 rounded-2xl p-5 min-w-[230px]"><p className="flex items-center gap-2 text-xs text-slate-400"><Sparkles size={15} className="text-[#f5bf55]"/> Explainable match</p><p className="text-4xl font-black mt-3">{scholarship.match===null?'—':`${scholarship.match}%`}</p><p className={`font-bold mt-2 ${scholarship.eligible?'text-[#77dec9]':'text-[#f1a69d]'}`}>{scholarship.match===null?'Sign in as a student to calculate':scholarship.eligible?'Configured rules met':'One or more rules unmet'}</p></div></div></section>

    <div className="grid xl:grid-cols-[minmax(0,1fr)_390px] gap-6 mt-6"><div className="space-y-6">
      <section className="sc-card p-6"><p className="sc-eyebrow">Opportunity overview</p><h2 className="font-black text-2xl text-[#10162f] mt-1">What this scholarship offers</h2><div className="grid sm:grid-cols-2 gap-4 mt-5">{[[BookOpen,'Education',scholarship.educationLevel],[MapPin,'Location',scholarship.location],[CalendarDays,'Deadline',scholarship.deadline],[ShieldCheck,'Provider',scholarship.provider]].map(([Icon,label,value])=><div key={label} className="bg-[#f4f5f1] rounded-xl p-4"><p className="flex items-center gap-2 text-xs text-[#737c8c]"><Icon size={15}/>{label}</p><p className="font-extrabold mt-2 text-[#10162f]">{value}</p></div>)}</div><div className="grid sm:grid-cols-2 gap-5 mt-5"><div><p className="text-[11px] uppercase tracking-wider font-extrabold text-[#7a8392]">Course coverage</p><p className="text-sm text-[#566176] mt-2 leading-6">{scholarship.stream||'As per scheme notification'}</p></div><div><p className="text-[11px] uppercase tracking-wider font-extrabold text-[#7a8392]">Financial assistance</p><p className="text-sm text-[#566176] mt-2 leading-6">{scholarship.amount||'As per scheme notification'}</p></div></div></section>

      {student&&report&&<section className="sc-card p-6"><div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4"><div><p className="sc-eyebrow">Explainable eligibility engine</p><h2 className="font-black text-2xl text-[#10162f] mt-1">Why you {report.eligibility.eligible?'qualify':'do not currently qualify'}</h2><p className="text-sm text-[#737c8c] mt-2">The explanation mirrors the scholarship’s structured rules already stored in ScholarConnect. The server-side match remains authoritative.</p></div><div className={`rounded-2xl px-5 py-4 text-center ${report.eligibility.eligible?'bg-[#e5f6f1] text-[#147d69]':'bg-[#fff0ed] text-[#a34b42]'}`}><p className="text-3xl font-black">{report.eligibility.score}%</p><p className="text-xs font-bold mt-1">rule fit</p></div></div>
        <div className="space-y-3 mt-6">{report.eligibility.checks.map(c=><div key={c.key} className={`border rounded-2xl p-4 ${!c.configured?'border-[#e1e4e9] bg-[#faf9f5]':c.passed?'border-[#cce8df] bg-[#f2fbf8]':'border-[#efc9c2] bg-[#fff5f3]'}`}><div className="flex items-start gap-3">{!c.configured?<div className="w-7 h-7 rounded-full bg-[#eceef1] flex items-center justify-center text-[#6f7888] text-xs font-black">—</div>:c.passed?<CheckCircle2 size={22} className="text-[#179c82] shrink-0"/>:<XCircle size={22} className="text-[#b65248] shrink-0"/>}<div className="flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-extrabold text-[#10162f]">{c.label}</p><span className="text-xs font-bold text-[#7a8392]">Weight {c.weight}</span></div><div className="grid sm:grid-cols-2 gap-3 mt-3 text-sm"><div><p className="text-[10px] uppercase tracking-wider font-bold text-[#89919d]">Required</p><p className="mt-1 text-[#3e485b]">{c.requirement}</p></div><div><p className="text-[10px] uppercase tracking-wider font-bold text-[#89919d]">Your passport</p><p className="mt-1 text-[#3e485b]">{c.actual}</p></div></div></div></div></div>)}</div>
      </section>}

      {!student&&<section className="sc-card p-6"><p className="sc-eyebrow">Eligibility criteria</p><h2 className="font-black text-2xl mt-1">Configured scheme conditions</h2><div className="grid sm:grid-cols-2 gap-3 mt-5">{scholarship.eligibility.map(c=><div key={c} className="flex items-start gap-3 bg-[#f4f5f1] rounded-xl p-4"><CheckCircle2 size={18} className="text-[#179c82] shrink-0 mt-0.5"/><span className="text-sm">{c}</span></div>)}</div></section>}

      {student&&report&&<section className="sc-card p-6"><div className="flex flex-col sm:flex-row justify-between gap-4"><div><p className="sc-eyebrow">Document readiness</p><h2 className="font-black text-2xl text-[#10162f] mt-1">Your vault vs. this application</h2></div><div className="sc-pill bg-[#eeeeff] text-[#5151c7] text-base">{report.documents.percentage}% Ready</div></div><div className="grid sm:grid-cols-2 gap-3 mt-5">{report.documents.required.map(kind=>{const available=report.documents.ready.includes(kind);return <div key={kind} className={`rounded-xl p-4 border flex items-center gap-3 ${available?'bg-[#f1fbf7] border-[#d0e9df]':'bg-[#fff7e9] border-[#efd9ae]'}`}>{available?<CheckCircle2 size={19} className="text-[#179c82]"/>:<AlertTriangle size={19} className="text-[#a66b12]"/>}<div><p className="font-bold text-sm">{kind}</p><p className="text-xs text-[#737c8c] mt-1">{available?'Available in your vault':'Required before submission'}</p></div></div>})}</div>{report.documents.missing.length>0&&<Link to="/student/documents" className="sc-secondary mt-5">Open Document Vault <ArrowUpRight size={15}/></Link>}</section>}
    </div>

    <aside className="space-y-5">
      {student&&report?<section className="sc-card overflow-hidden sticky top-24"><div className="bg-[#10162f] text-white p-6"><div className="flex items-center justify-between gap-3"><div><p className="text-[11px] uppercase tracking-[.15em] font-extrabold text-[#77dec9]">ScholarShield</p><h2 className="text-2xl font-black mt-1">Pre-submission scan</h2></div><ShieldCheck size={31} className="text-[#f5bf55]"/></div><div className="mt-6 flex items-end justify-between"><div><p className="text-5xl font-black">{report.readiness}%</p><p className="text-xs text-slate-400 mt-1">application readiness</p></div><span className={`sc-pill ${report.applicationReady?'bg-[#179c82]/20 text-[#77dec9]':'bg-[#f5bf55]/15 text-[#f5bf55]'}`}>{report.applicationReady?'Application ready':`${report.risks.length} risk${report.risks.length===1?'':'s'}`}</span></div><div className="h-2 bg-white/10 rounded-full mt-5 overflow-hidden"><div className={`h-full rounded-full ${report.applicationReady?'bg-[#77dec9]':'bg-[#f5bf55]'}`} style={{width:`${report.readiness}%`}}/></div></div>
        <div className="p-5"><p className="text-sm font-extrabold text-[#10162f]">What could block submission?</p>{report.risks.length===0?<div className="mt-4 bg-[#f1fbf7] border border-[#d0e9df] rounded-xl p-4 flex gap-3"><CheckCircle2 size={19} className="text-[#179c82] shrink-0"/><div><p className="font-bold text-sm">No configured blockers detected</p><p className="text-xs text-[#687285] mt-1 leading-5">All current structured rules and required-document checks pass. Provider verification still applies.</p></div></div>:<div className="space-y-3 mt-4">{report.risks.slice(0,5).map((risk,i)=><div key={i} className={`border rounded-xl p-4 ${tone[risk.severity]}`}><p className="text-[10px] uppercase tracking-wider font-black opacity-70">{risk.type}</p><p className="font-extrabold text-sm mt-1">{risk.title}</p><p className="text-xs mt-2 leading-5 opacity-80">{risk.detail}</p><p className="text-xs font-bold mt-2">Action: {risk.action}</p></div>)}</div>}
          <button onClick={submit} disabled={busy||(student&&!canSubmit)} className="sc-primary w-full mt-5">{busy?'Submitting...':'Apply Now'}</button>
          {!canSubmit&&<p className="text-xs text-[#8a5d14] mt-3 leading-5">Resolve the eligibility or required-document blockers shown above before applying. The backend will enforce the same submission rules.</p>}
        </div>
      </section>:<section className="sc-card p-6"><Sparkles className="text-[#5b5bd6]"/><h2 className="font-black text-xl mt-4">See your personalized eligibility</h2><p className="text-sm text-[#737c8c] mt-2 leading-6">Sign in with a student profile to unlock Explainable Eligibility, ScholarShield, document readiness and Opportunity Rescue.</p><button onClick={submit} className="sc-primary w-full mt-5">Apply Now</button></section>}

      <section className="sc-card p-5"><p className="text-xs uppercase tracking-wider font-extrabold text-[#7a8392]">Structured rule snapshot</p><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-3"><dt className="text-[#737c8c]">Categories</dt><dd className="font-bold text-right">{scholarship.categories?.join(', ')||'Any'}</dd></div><div className="flex justify-between gap-3"><dt className="text-[#737c8c]">Income ceiling</dt><dd className="font-bold text-right">{money(scholarship.max_income)}</dd></div><div className="flex justify-between gap-3"><dt className="text-[#737c8c]">Min. percentage</dt><dd className="font-bold text-right">{scholarship.min_percentage==null?'Not restricted':`${scholarship.min_percentage}%`}</dd></div></dl></section>
    </aside></div>
  </main><Footer /></div>;
}
