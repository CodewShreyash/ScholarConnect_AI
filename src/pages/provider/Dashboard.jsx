import {useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowUpRight, FilePenLine, Plus, Trash2} from 'lucide-react';
import {useAuth} from '../../context/AuthContext';
import {useResource} from '../../lib/useResource';
import {client,unwrap,errorMessage} from '../../lib/supabase';
import AccountLayout from '../../components/layout/AccountLayout';
import Feedback from '../../components/common/Feedback';

export default function ProviderDashboard(){
 const {user}=useAuth(),[actionError,setActionError]=useState(''),[busy,setBusy]=useState(false);
 const {data,error,loading,reload}=useResource(async()=>unwrap(await client().from('scholarships').select('*').eq('provider_id',user.id).order('created_at',{ascending:false})),[user.id]);
 const remove=async id=>{if(!window.confirm('Delete this draft scholarship?'))return;setBusy(true);setActionError('');try{const deleted=unwrap(await client().from('scholarships').delete().eq('id',id).select('id'));if(!deleted.length)throw new Error('Only unused drafts can be deleted.');reload();}catch(err){setActionError(errorMessage(err));}finally{setBusy(false);}};
 const published=(data||[]).filter(s=>s.status==='published').length;
 const drafts=(data||[]).filter(s=>s.status==='draft').length;
 return <AccountLayout title="Provider workspace">
   <Feedback error={error||actionError} loading={loading}/>{error&&<button className="sc-secondary" onClick={reload}>Retry</button>}
   {data&&<>
     <div className="grid sm:grid-cols-3 gap-4 mb-7">
       {[['Total opportunities',data.length],['Published',published],['Drafts',drafts]].map(([label,value])=><div className="sc-card p-5" key={label}><p className="text-sm text-[#737c8c]">{label}</p><p className="mt-2 text-3xl font-black text-[#10162f]">{value}</p></div>)}
     </div>
     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5"><div><p className="sc-eyebrow">Opportunity management</p><h2 className="text-2xl font-black tracking-tight text-[#10162f] mt-1">Your scholarships</h2></div><Link to="/provider/scholarships/new" className="sc-primary"><Plus size={17}/> Create scholarship</Link></div>
     {data.length===0?<div className="sc-card p-8 text-center"><div className="w-12 h-12 mx-auto rounded-xl bg-[#eeeeff] text-[#5b5bd6] flex items-center justify-center"><FilePenLine size={21}/></div><h3 className="font-black text-xl mt-4">Create your first scholarship</h3><p className="text-[#737c8c] text-sm mt-2">Start with a draft, use the visual Rule Builder to test structured eligibility, then publish it for students.</p></div>:
     <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{data.map(s=><article key={s.id} className="sc-card p-5 flex flex-col min-h-[230px]"><div className="flex items-center justify-between gap-3"><span className={`sc-pill capitalize ${s.status==='published'?'bg-[#e4f5ef] text-[#147c68]':s.status==='closed'?'bg-[#eceef1] text-[#606978]':'bg-[#fff1d4] text-[#946316]'}`}>{s.status}</span><span className="text-xs text-[#8a92a0]">{new Date(s.deadline).toLocaleDateString()}</span></div><h3 className="font-black text-xl text-[#10162f] mt-4 leading-snug">{s.display_name}</h3><p className="text-sm text-[#747d8c] mt-2">Deadline {new Date(s.deadline).toLocaleString()}</p><div className="mt-auto pt-5 flex items-center gap-4 flex-wrap text-sm"><Link to={'/provider/scholarships/'+s.id+'/edit'} className="font-extrabold text-[#5b5bd6] inline-flex items-center gap-1">Rule Builder <ArrowUpRight size={14}/></Link><Link to="/provider/applications" className="font-bold text-[#526078]">Applications</Link>{s.status==='draft'&&<button disabled={busy} onClick={()=>remove(s.id)} className="text-[#b34b53] inline-flex items-center gap-1"><Trash2 size={14}/> Delete</button>}</div></article>)}</div>}
   </>}
 </AccountLayout>;
}
