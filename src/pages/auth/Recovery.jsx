import {useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {useAuth} from '../../context/AuthContext';
import {client,unwrap,errorMessage} from '../../lib/supabase';
import Feedback from '../../components/common/Feedback';
import {buttonClass,inputClass,cardClass} from '../../components/layout/AccountLayout';
export default function Recovery() {
 const {user,loading}=useAuth(),navigate=useNavigate();
 const [error,setError]=useState(''),[busy,setBusy]=useState(false);
 const submit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);if(f.get('password')!==f.get('confirmation')){setError('Passwords do not match.');return;}setBusy(true);setError('');try{unwrap(await client().auth.updateUser({password:f.get('password')}));navigate('/dashboard',{replace:true});}catch(err){setError(errorMessage(err));}finally{setBusy(false);}};
 return <main className="min-h-screen bg-[#f4f5f1] flex items-center justify-center p-6"><div className={cardClass+' w-full max-w-md'}><h1 className="text-2xl font-bold">Reset Password</h1><Feedback error={error} loading={loading}/>{user?<form onSubmit={submit} className="space-y-4 mt-5"><label className="block">New password<input name="password" type="password" autoComplete="new-password" minLength={10} required className={inputClass}/></label><label className="block">Confirm password<input name="confirmation" type="password" autoComplete="new-password" minLength={10} required className={inputClass}/></label><button disabled={busy} className={buttonClass}>Save Password</button></form>:<p className="mt-5">Open the latest reset link sent to your email. <Link to="/login" className="text-[#5151c7]">Return to sign in</Link></p>}</div></main>;
}
export function AuthCallback() {
 const {loading,user,error}=useAuth();
 const params=new URLSearchParams(window.location.hash.slice(1));
 return <main className="p-10"><Feedback loading={loading} error={error||params.get('error_description')}/>{!loading&&<><h1 className="text-2xl font-bold">{user?'Email confirmed':'Confirm your account'}</h1><Link className="text-[#5151c7]" to={user?'/dashboard':'/login'}>Continue to {user?'dashboard':'sign in'}</Link></>}</main>;
}
