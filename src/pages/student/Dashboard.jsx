import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, ArrowUpRight, BadgeCheck, BriefcaseBusiness, FileCheck2, ShieldCheck, Sparkles, Target } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useResource } from '../../lib/useResource';
import { listScholarships, applications, listDocuments, loadStudent, isStudentProfileComplete } from '../../lib/api';
import { opportunityRescue, scholarshipPassport } from '../../lib/featureEngine';
import AccountLayout from '../../components/layout/AccountLayout';
import Feedback from '../../components/common/Feedback';
import { usePreferences } from '../../context/PreferencesContext';
import StudentGuide from '../../components/student/StudentGuide';

export default function StudentDashboard(){
 const {user}=useAuth();
 const {t}=usePreferences();
 const {data,error,loading,reload}=useResource(async()=>{
   const [matches,apps,documents,student]=await Promise.all([listScholarships(true),applications(),listDocuments(user.id),loadStudent(user.id)]);
   return {matches,applications:apps,documents,student};
 },[user.id]);
 const matches=(data?.matches||[]).filter(s=>s.eligible).sort((a,b)=>(b.match||0)-(a.match||0));
 const profileComplete=isStudentProfileComplete(data?.student);
 const passport=data?scholarshipPassport(data.student,data.documents,data.matches,data.applications):null;
 const rescue=data?opportunityRescue(data.matches,data.documents,data.applications):[];
 const stats=data?[
   [t('applications'),data.applications.length,BriefcaseBusiness,'bg-[#eeeeff] text-[#5b5bd6]'],
   [t('approved'),data.applications.filter(a=>a.status==='approved').length,BadgeCheck,'bg-[#e5f6f1] text-[#147d69]'],
   [t('eligibleMatches'),matches.length,Target,'bg-[#fff1d4] text-[#9a6714]']
 ]:[];
 return <AccountLayout title={t('opportunityDashboard')}>
   <Feedback loading={loading} error={error}/>{error&&<button className="sc-secondary" onClick={reload}>Retry</button>}
   {data&&<>
     <section className="grid sm:grid-cols-3 gap-4 mb-6">
       {stats.map(([label,value,Icon,tone])=><div key={label} className="sc-card p-5"><div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tone}`}><Icon size={19}/></div><div className="mt-5"><p className="text-3xl font-black tracking-tight text-[#10162f]">{value}</p><p className="text-sm text-[#737c8c] mt-1">{label}</p></div></div>)}
     </section>

     <section aria-labelledby="signature-features-title" className="mb-7">
       <h2 id="signature-features-title" className="mb-3 text-lg font-black tracking-tight text-[#10162f]">{t('signatureFeatures')}</h2>
       <div className="grid gap-3 md:grid-cols-3">
         <article className="sc-card p-5">
           <div className="flex items-center justify-between gap-3">
             <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eeeeff] text-[#5b5bd6]"><Target size={19}/></span>
             <span className="text-lg font-black text-[#5b5bd6]">{matches.length}</span>
           </div>
           <h3 className="mt-4 font-extrabold text-[#10162f]">{t('matchingSpotlight')}</h3>
           <p className="mt-1 text-sm text-[#737c8c]">{t('matchCount')}</p>
           <p className="mt-3 text-sm leading-5 text-[#526078]">{matches[0] ? `${t('strongestMatch')}: ${matches[0].displayName} · ${matches[0].match ?? 0}%` : t('noMatchSpotlight')}</p>
         </article>
         <Link to={matches[0] ? `/scholarships/${matches[0].id}` : '/scholarships'} className="sc-card sc-feature-card p-5">
           <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e5f6f1] text-[#147d69]"><Sparkles size={19}/></span>
           <h3 className="mt-4 font-extrabold text-[#10162f]">{t('explainableEligibility')}</h3>
           <p className="mt-2 text-sm leading-5 text-[#737c8c]">{t('explainableEligibilityCopy')}</p>
           {matches[0] && <span className="mt-3 block text-xs font-bold text-[#5b5bd6]">{matches[0].displayName} → {t('explainEligibility')}</span>}
         </Link>
         <Link to="/student/passport" className="sc-card sc-feature-card p-5">
           <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff1d4] text-[#9a6714]"><FileCheck2 size={19}/></span>
           <h3 className="mt-4 font-extrabold text-[#10162f]">{t('reusableProfile')}</h3>
           <p className="mt-2 text-sm leading-5 text-[#737c8c]">{t('reusableProfileCopy')}</p>
           <span className="mt-3 block text-xs font-bold text-[#5b5bd6]">{passport.readiness}% {t('profileReadiness')}</span>
         </Link>
       </div>
     </section>

     <div className="mb-8">
       <StudentGuide matches={matches} passport={passport} />
     </div>

     <section className="grid xl:grid-cols-[1.05fr_.95fr] gap-5 mb-8">
       <Link to="/student/passport" className="sc-card p-6 group overflow-hidden relative"><div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-[#5b5bd6]/8"/><div className="relative flex items-start justify-between gap-5"><div><div className="w-11 h-11 rounded-xl bg-[#eeeeff] text-[#5b5bd6] flex items-center justify-center"><ShieldCheck size={21}/></div><p className="sc-eyebrow mt-5">{t('passport')}</p><h2 className="text-2xl font-black text-[#10162f] mt-1">{passport.readiness}% {t('profileReadiness')}</h2><p className="text-sm text-[#737c8c] mt-2 leading-6">{passport.documentCount}/{passport.documentTotal} {t('coreDocumentsReady')} · {passport.readyCount} {t('readyOpportunities')}.</p></div><ArrowUpRight size={20} className="text-[#5b5bd6] group-hover:translate-x-1 group-hover:-translate-y-1 transition"/></div><div className="h-2 bg-[#ebecef] rounded-full mt-6 overflow-hidden"><div className="h-full bg-[#5b5bd6] rounded-full" style={{width:`${passport.readiness}%`}}/></div></Link>

       <Link to="/student/rescue" className="sc-card-dark rounded-[1.5rem] p-6 group"><div className="flex items-start justify-between gap-4"><div className="w-11 h-11 rounded-xl bg-[#f5bf55]/15 text-[#f5bf55] flex items-center justify-center"><Sparkles size={21}/></div><ArrowUpRight size={20} className="text-slate-400 group-hover:text-white transition"/></div><p className="text-[11px] uppercase tracking-[.15em] text-[#77dec9] font-extrabold mt-5">{t('opportunityRescue')}</p><h2 className="text-2xl font-black mt-1">{rescue.length ? `${rescue.length} ${t('opportunitiesAttention')}` : t('caughtUp')}</h2><p className="text-sm text-slate-400 leading-6 mt-2">{rescue[0]?`${rescue[0].displayName} is your highest rescue priority at ${rescue[0].rescue.priority}/100.`:t('rescueDetail')}</p></Link>
     </section>

     <section>
       <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4"><div><p className="sc-eyebrow">{t('personalizedDiscovery')}</p><h2 className="text-2xl font-black tracking-tight text-[#10162f] mt-1">{t('matchedToYou')}</h2></div><Link className="text-sm font-extrabold text-[#5b5bd6] inline-flex items-center gap-1" to="/scholarships">{t('viewAll')} <ArrowUpRight size={15}/></Link></div>
       {matches.length===0?<div className="sc-card p-7"><AlertTriangle className="text-[#9a6714]"/><h3 className="font-black text-xl mt-4">{t('noMatches')}</h3><p className="text-sm text-[#737c8c] mt-2 leading-6">{t('noMatchesHelp')}</p><Link className="sc-primary mt-5" to="/student/profile-setup">{profileComplete?t('editProfile'):t('completeProfile')}</Link></div>:
       <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{matches.slice(0,6).map(s=><article key={s.id} className="sc-card p-5 flex flex-col min-h-[240px]"><div className="flex justify-between gap-3 items-start"><span className="sc-pill bg-[#e6f6f1] text-[#157c69]">{t('eligible')}</span>{s.match!==null&&<span className="text-sm font-black text-[#5b5bd6]">{s.match}% match</span>}</div><h3 className="text-lg font-black text-[#10162f] mt-4 leading-snug">{s.displayName}</h3><p className="text-sm text-[#737c8c] mt-2">{s.provider}</p><p className="text-xs text-[#526078] leading-5 mt-4 line-clamp-2">{s.reasons.join('. ')}</p><div className="mt-auto pt-5 flex flex-wrap items-center justify-between gap-3"><Link className="text-sm text-[#5b5bd6] font-extrabold inline-flex items-center gap-1" to={'/scholarships/'+s.id}>{t('explainEligibility')} <ArrowUpRight size={14}/></Link><Link className="sc-primary px-3 py-2 text-sm" to={'/scholarships/'+s.id}>{t('reviewAndApply')} <ArrowRight size={15}/></Link></div></article>)}</div>}
     </section>
   </>}
 </AccountLayout>;
}
