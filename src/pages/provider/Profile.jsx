import {useState} from 'react';
import {useAuth} from '../../context/AuthContext';
import {useResource} from '../../lib/useResource';
import {client,unwrap,errorMessage} from '../../lib/supabase';
import AccountLayout,{cardClass,inputClass,buttonClass} from '../../components/layout/AccountLayout';
import Feedback from '../../components/common/Feedback';
export default function ProviderProfile(){
 const {user}=useAuth();const {data,error,loading,reload}=useResource(async()=>unwrap(await client().from('provider_profiles').select('*').eq('id',user.id).single()),[user.id]);
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[actionError,setActionError]=useState('');
 const save=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);setBusy(true);setActionError('');setMessage('');try{unwrap(await client().from('provider_profiles').update({organization_name:f.get('organization_name').trim(),website:f.get('website').trim(),description:f.get('description').trim()}).eq('id',user.id).select().single());setMessage('Organization profile saved.');reload();}catch(err){setActionError(errorMessage(err));}finally{setBusy(false);}};
 return <AccountLayout title="Organization Profile"><Feedback error={error||actionError} loading={loading} message={message}/>{error&&<button onClick={reload}>Retry</button>}{data&&<form onSubmit={save} className={cardClass+' max-w-2xl space-y-5'}>{[['organization_name','Organization name'],['website','Website'],['description','About your organization']].map(([name,label])=><label className="block" key={name}>{label}{name==='description'?<textarea name={name} defaultValue={data[name]} maxLength={3000} className={inputClass}/>:<input name={name} type={name==='website'?'url':'text'} required={name==='organization_name'} defaultValue={data[name]} maxLength={300} className={inputClass}/>}</label>)}<button disabled={busy} className={buttonClass}>Save Profile</button></form>}</AccountLayout>;
}
