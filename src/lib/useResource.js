import {useCallback,useEffect,useState} from 'react';
import {errorMessage} from './supabase';
export function useResource(loader,deps=[]) {
 const [data,setData]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[revision,setRevision]=useState(0);
 useEffect(()=>{let active=true;setLoading(true);setError('');setData(null);Promise.resolve().then(loader).then(value=>{if(active)setData(value);}).catch(err=>{if(active)setError(errorMessage(err));}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[...deps,revision]);
 const reload=useCallback(()=>setRevision(v=>v+1),[]);
 return {data,error,loading,reload};
}
