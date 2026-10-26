import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, GraduationCap, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { client, unwrap, errorMessage } from '../../lib/supabase';
import Feedback from '../../components/common/Feedback';

export default function Login() {
  const navigate=useNavigate(),location=useLocation();
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
  const [showPassword,setShowPassword]=useState(false);

  const submit=async e=>{e.preventDefault();setBusy(true);setError('');try {unwrap(await client().auth.signInWithPassword({email,password}));const target=location.state?.from;navigate(typeof target==='string'&&target.startsWith('/')&&!target.startsWith('//') ? target : '/dashboard',{replace:true});}catch(err){setError(errorMessage(err));}finally{setBusy(false);}};
  const reset=async()=>{setError('');setMessage('');if(!email){setError('Enter your email address first.');return;}setBusy(true);try {unwrap(await client().auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+'/reset-password'}));setMessage('If the account exists, a password reset link will arrive by email.');}catch(err){setError(errorMessage(err));}finally{setBusy(false);}};

  return (
    <div className="min-h-screen bg-[#f4f5f1] grid lg:grid-cols-[.92fr_1.08fr]">
      <section className="hidden lg:flex relative overflow-hidden bg-[#10162f] text-white p-10 xl:p-14 flex-col min-h-screen">
        <div className="absolute -right-28 -top-28 w-[420px] h-[420px] rounded-full border-[70px] border-[#5b5bd6]/20"/>
        <div className="absolute left-20 bottom-28 w-36 h-36 rounded-full bg-[#179c82]/10 blur-2xl"/>

        <Link to="/" className="relative flex items-center gap-3 w-fit">
          <div className="w-11 h-11 rounded-xl bg-[#5b5bd6] flex items-center justify-center"><GraduationCap size={24}/></div>
          <div><p className="font-extrabold text-lg">ScholarConnect</p><p className="text-[10px] uppercase tracking-[.16em] text-slate-400 font-bold">Opportunity OS</p></div>
        </Link>

        <div className="relative my-auto max-w-xl">
          <div className="inline-flex items-center gap-2 text-[#a9a9ff] text-xs font-extrabold uppercase tracking-[.15em]"><Sparkles size={15}/> Your scholarship workspace</div>
          <h1 className="mt-5 text-5xl xl:text-6xl font-black leading-[1.02] tracking-[-.045em]">Pick up where your opportunity search left off.</h1>
          <p className="mt-6 text-slate-400 text-lg leading-8 max-w-lg">Your profile, document vault, scholarship matches and application history stay together in one secure workspace.</p>
          <div className="mt-10 grid grid-cols-2 gap-3 max-w-lg">
            <div className="rounded-2xl border border-white/10 bg-white/[.055] p-4"><p className="font-extrabold">Profile-based</p><p className="text-xs text-slate-400 mt-1">Recommendations use your saved details.</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[.055] p-4"><p className="font-extrabold">Private vault</p><p className="text-xs text-slate-400 mt-1">Documents stay under your account.</p></div>
          </div>
        </div>

        <div className="relative flex items-center gap-2 text-xs text-slate-500"><ShieldCheck size={15}/> Secure authentication powered by Supabase</div>
      </section>

      <section className="flex items-center justify-center px-5 sm:px-8 py-10 lg:py-16">
        <div className="w-full max-w-[470px]">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#6c7484] hover:text-[#5b5bd6] mb-8"><ArrowLeft size={17}/> Back to home</Link>

          <div className="lg:hidden flex items-center gap-3 mb-9">
            <div className="w-10 h-10 rounded-xl bg-[#10162f] text-white flex items-center justify-center"><GraduationCap size={21}/></div>
            <div><p className="font-extrabold">ScholarConnect</p><p className="text-[10px] uppercase tracking-[.14em] text-[#7c8493]">Opportunity OS</p></div>
          </div>

          <p className="sc-eyebrow">Welcome back</p>
          <h2 className="mt-2 text-4xl sm:text-5xl font-black tracking-[-.045em] text-[#10162f]">Sign in to continue.</h2>
          <p className="mt-4 text-[#6c7484] leading-7">Access your personalized scholarship workspace.</p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-bold mb-2 text-[#2d374d]">Email address</label>
              <div className="relative"><Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b93a2]"/><input className="sc-input h-13 pl-11" type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2"><label className="text-sm font-bold text-[#2d374d]">Password</label><button type="button" onClick={reset} disabled={busy} className="text-sm text-[#5b5bd6] font-bold hover:text-[#4646ba]">Forgot password?</button></div>
              <div className="relative"><Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b93a2]"/><input className="sc-input h-13 pl-11 pr-12" type={showPassword?'text':'password'} required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password"/><button type="button" onClick={()=>setShowPassword(v=>!v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b93a2] hover:text-[#172036]">{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></div>
            </div>

            <Feedback error={error} message={message}/>
            <button type="submit" disabled={busy} className="sc-primary w-full py-3.5">{busy?'Signing in…':'Sign in'}</button>
          </form>

          <div className="my-7 flex items-center gap-4"><div className="h-px bg-[#d8dce3] flex-1"/><span className="text-[11px] uppercase tracking-[.13em] font-bold text-[#9097a4]">New here?</span><div className="h-px bg-[#d8dce3] flex-1"/></div>
          <Link to="/register" className="sc-secondary w-full py-3.5">Create a new account</Link>
        </div>
      </section>
    </div>
  );
}
