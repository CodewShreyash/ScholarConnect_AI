import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowUpRight, CalendarDays, CheckCircle2, Clock3, FileWarning, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useResource } from '../../lib/useResource';
import { applications, listDocuments, listScholarships } from '../../lib/api';
import { opportunityRescue } from '../../lib/featureEngine';
import AccountLayout from '../../components/layout/AccountLayout';
import Feedback from '../../components/common/Feedback';

function deadlineLabel(days){if(days===null)return 'Deadline unavailable';if(days===0)return 'Deadline today';if(days===1)return '1 day remaining';return `${days} days remaining`;}

export default function OpportunityRescue(){
 const {user}=useAuth();
 const {data,error,loading,reload}=useResource(async()=>{const [scholarships,documents,apps]=await Promise.all([listScholarships(true),listDocuments(user.id),applications()]);return {scholarships,documents,apps};},[user.id]);
 const rescues=data?opportunityRescue(data.scholarships,data.documents,data.apps):[];
 const urgent=rescues.filter(s=>s.rescue.daysRemaining!==null&&s.rescue.daysRemaining<=7).length;
 const ready=rescues.filter(s=>s.rescue.missing.length===0).length;
 return <AccountLayout title="Opportunity Rescue">
   <Feedback loading={loading} error={error}/>{error&&<button onClick={reload} className="sc-secondary">Retry</button>}
   {data&&<>
    <section className="sc-card-dark rounded-[1.7rem] p-6 sm:p-8 mb-7 relative overflow-hidden"><div className="absolute -right-16 -top-20 w-72 h-72 rounded-full border-[54px] border-[#5b5bd6]/20"/><div className="relative max-w-3xl"><p className="text-[11px] uppercase tracking-[.16em] font-extrabold text-[#77dec9]">Proactive scholarship recovery</p><h2 className="text-3xl sm:text-4xl font-black tracking-[-.04em] mt-2">Don’t discover an opportunity after it closes.</h2><p className="text-slate-400 leading-7 mt-3">Rescue prioritizes scholarships you already qualify for using match strength, document readiness and deadline urgency.</p></div></section>
    <div className="grid sm:grid-cols-3 gap-4 mb-7"><div className="sc-card p-5"><p className="text-sm text-[#737c8c]">Open rescue opportunities</p><p className="text-3xl font-black mt-2">{rescues.length}</p></div><div className="sc-card p-5"><p className="text-sm text-[#737c8c]">Urgent ≤ 7 days</p><p className="text-3xl font-black text-[#b3544f] mt-2">{urgent}</p></div><div className="sc-card p-5"><p className="text-sm text-[#737c8c]">Ready to submit</p><p className="text-3xl font-black text-[#147d69] mt-2">{ready}</p></div></div>
    {rescues.length===0?<section className="sc-card p-8 text-center"><CheckCircle2 className="mx-auto text-[#147d69]" size={30}/><h3 className="text-xl font-black mt-4">No rescue action right now</h3><p className="text-[#737c8c] mt-2">You have either applied already or there are no currently eligible published opportunities.</p><Link to="/scholarships" className="sc-primary mt-5">Explore scholarships</Link></section>:
    <div className="space-y-4">{rescues.map((s,index)=><article key={s.id} className="sc-card p-5 sm:p-6"><div className="flex flex-col lg:flex-row lg:items-center gap-5"><div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${index===0?'bg-[#fff0e8] text-[#b45145]':'bg-[#eeeeff] text-[#5151c7]'}`}>{s.rescue.missing.length?<FileWarning size={23}/>:<Sparkles size={23}/>}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap gap-2 items-center"><span className="sc-pill bg-[#eeeeff] text-[#5151c7]">Priority {s.rescue.priority}/100</span><span className={`sc-pill ${s.rescue.daysRemaining!==null&&s.rescue.daysRemaining<=7?'bg-[#fff0e8] text-[#a84d43]':'bg-[#f1f2f4] text-[#626c7a]'}`}><Clock3 size={13}/>{deadlineLabel(s.rescue.daysRemaining)}</span></div><h3 className="text-xl font-black text-[#10162f] mt-3">{s.displayName}</h3><p className="text-sm text-[#737c8c] mt-1">{s.provider}</p></div><div className="grid grid-cols-2 gap-3 min-w-[230px]"><div className="bg-[#f4f5f1] rounded-xl p-3"><p className="text-[10px] uppercase tracking-wider text-[#7a8392] font-bold">Match</p><p className="font-black text-lg mt-1">{s.match??'—'}%</p></div><div className="bg-[#f4f5f1] rounded-xl p-3"><p className="text-[10px] uppercase tracking-wider text-[#7a8392] font-bold">Documents</p><p className="font-black text-lg mt-1">{s.rescue.readiness}%</p></div></div></div>
      <div className="mt-5 border-t border-[#e1e4e9] pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4"><div>{s.rescue.missing.length?<div className="flex gap-2 text-sm text-[#8a5d14]"><AlertTriangle size={17} className="shrink-0 mt-0.5"/><span><strong>Action needed:</strong> {s.rescue.missing.slice(0,3).join(', ')}{s.rescue.missing.length>3?` +${s.rescue.missing.length-3} more`:''}</span></div>:<div className="flex gap-2 text-sm text-[#147d69]"><CheckCircle2 size={17}/><span>All configured documents are already in your vault.</span></div>}</div><Link to={`/scholarships/${s.id}`} className="sc-primary shrink-0">{s.rescue.missing.length?'Fix & review':'Review & apply'} <ArrowUpRight size={15}/></Link></div>
    </article>)}</div>}
   </>}
 </AccountLayout>;
}
