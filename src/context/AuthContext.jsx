import { createContext, useContext, useEffect, useState } from 'react';
import { client, supabase, unwrap } from '../lib/supabase';
const AuthContext=createContext(null);
export function AuthProvider({children}) {
 const [session,setSession]=useState(null),[profile,setProfile]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[revision,setRevision]=useState(0);
 const [initialized,setInitialized]=useState(false);
 useEffect(()=>{
  if (!supabase) {setInitialized(true);setLoading(false);return;}
  let active=true;
  const {data:{subscription}}=supabase.auth.onAuthStateChange((event,next)=>{
    if (!active) return;
    setSession(next); setInitialized(true);
    if (!next) {setProfile(null);setLoading(false);}
    if (event==='PASSWORD_RECOVERY' && window.location.pathname!=='/reset-password') window.location.replace('/reset-password'+window.location.hash);
  });
  supabase.auth.getSession().then(({data,error})=>{if(active){if(error)setError(error.message);setSession(data.session);setInitialized(true);}}).catch(err=>{if(active){setError(err.message);setInitialized(true);setLoading(false);}});
  return ()=>{active=false;subscription.unsubscribe();};
 },[]);
 useEffect(()=>{
  if (!initialized) return;
  let active=true; setProfile(null);setError('');
  if(!session?.user?.id){setLoading(false);return;}
  setLoading(true);
  client().from('profiles').select('*').eq('id',session.user.id).single().then(result=>{
   if(!active)return;
   if(result.error)setError('Unable to load your account: '+result.error.message);else setProfile(result.data);
   setLoading(false);
  }).catch(err=>{if(active){setError(err.message);setLoading(false);}});
  return ()=>{active=false;};
 },[session?.user?.id,initialized,revision]);
 const signOut=async()=>{unwrap(await client().auth.signOut());setProfile(null);setSession(null);};
 return <AuthContext.Provider value={{session,user:session?.user,profile,loading:!initialized||loading,error,signOut,retry:()=>setRevision(v=>v+1)}}>{children}</AuthContext.Provider>;
}
export const useAuth=()=>useContext(AuthContext);
