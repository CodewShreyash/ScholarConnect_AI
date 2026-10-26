import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Eye, EyeOff, GraduationCap, Lock, Mail, Phone, User, Users, CheckCircle2 } from "lucide-react";
import { client, unwrap, errorMessage } from '../../lib/supabase';
import Feedback from '../../components/common/Feedback';
import Footer from '../../components/layout/Footer';

export default function Register(){
  const navigate=useNavigate();
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
  const [accountType,setAccountType]=useState('student');
  const [showPassword,setShowPassword]=useState(false);
  const [phoneNumber,setPhoneNumber]=useState('');
  const submit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);setBusy(true);setError('');setMessage('');try{const data=unwrap(await client().auth.signUp({email:f.get('email'),password:f.get('password'),options:{emailRedirectTo:window.location.origin+'/auth/callback',data:{role:accountType,full_name:f.get('full_name'),phone:phoneNumber?`+91${phoneNumber}`:'',organization_name:f.get('organization_name')||''}}}));if(data.session)navigate('/dashboard',{replace:true});else setMessage('Check your email to confirm your account, then sign in.');}catch(err){setError(errorMessage(err));}finally{setBusy(false);}};

  return <div className="min-h-screen bg-[#f4f5f1]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6"><Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#6f7786] hover:text-[#5b5bd6]"><ArrowLeft size={17}/> Back to home</Link></div>
    <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-14 grid lg:grid-cols-[.9fr_1.1fr] gap-8 lg:gap-12 items-start">
      <section className="lg:sticky lg:top-8 pt-4 lg:pt-16">
        <div className="w-12 h-12 rounded-2xl bg-[#10162f] text-white flex items-center justify-center"><GraduationCap size={24}/></div>
        <p className="sc-eyebrow mt-7">Create your workspace</p>
        <h1 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-black tracking-[-.045em] leading-[1.02] text-[#10162f]">One account.<br/>A clearer path.</h1>
        <p className="mt-5 text-[#697386] leading-7 max-w-md">Choose how you use ScholarConnect, then create your secure account. Your role determines the workspace and tools you see.</p>
        <div className="mt-8 space-y-3 max-w-md">
          {["Students get profile-based scholarship matching","Providers can publish and manage opportunities","Accounts and sessions are handled securely"].map(t=><div key={t} className="flex gap-3 items-start text-sm font-semibold text-[#43506a]"><CheckCircle2 size={18} className="text-[#179c82] mt-0.5 shrink-0"/>{t}</div>)}
        </div>
      </section>

      <section className="sc-card p-5 sm:p-7 lg:p-8">
        <div className="flex items-end justify-between gap-4 mb-6"><div><p className="text-xs font-extrabold uppercase tracking-[.15em] text-[#777f8e]">Step 1 of 1</p><h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1 text-[#10162f]">Create account</h2></div><span className="sc-pill bg-[#ececfc] text-[#4e4eb8]">Free to join</span></div>

        <p className="text-sm font-extrabold text-[#2d374d]">I am joining as</p>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          {[
            ['student','Student','Find and apply for scholarships',Users],
            ['provider','Scholarship provider','Publish and manage opportunities',Building2]
          ].map(([type,title,copy,Icon])=><button key={type} type="button" onClick={()=>setAccountType(type)} className={`text-left p-4 rounded-2xl border transition ${accountType===type?'border-[#5b5bd6] bg-[#eeeeff] shadow-[0_0_0_3px_rgba(91,91,214,.08)]':'border-[#dce0e6] bg-[#fffdf8] hover:border-[#c4c9d3]'}`}><div className="flex gap-3"><div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accountType===type?'bg-[#5b5bd6] text-white':'bg-[#eceeea] text-[#5e6878]'}`}><Icon size={19}/></div><div><p className="font-extrabold text-[#10162f]">{title}</p><p className="text-xs text-[#747d8c] mt-1 leading-5">{copy}</p></div></div></button>)}
        </div>

        <form onSubmit={submit} className="mt-7 space-y-5">
          <Field label={accountType==='student'?'Full name':'Contact person name'} icon={User}><input className="sc-input pl-11" name="full_name" required maxLength={120} placeholder="Enter full name"/></Field>
          {accountType==='provider'&&<Field label="Organization name" icon={Building2}><input className="sc-input pl-11" name="organization_name" required maxLength={200} placeholder="NGO, CSR, foundation or institution"/></Field>}
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Email" icon={Mail}><input className="sc-input pl-11" type="email" name="email" required autoComplete="email" placeholder="you@example.com"/></Field>
            <Field label="Phone number" icon={Phone}><span aria-hidden="true" className="absolute left-11 top-1/2 -translate-y-1/2 border-r border-[#d7dce4] pr-2 text-sm font-semibold text-[#626c7d]">+91</span><input className="sc-input pl-11 sc-phone-input" type="tel" name="phone" inputMode="numeric" autoComplete="tel-national" aria-label="10-digit Indian mobile number" pattern="[0-9]{10}" maxLength={10} value={phoneNumber} onChange={e=>setPhoneNumber(e.target.value.replace(/\D/g,'').slice(0,10))} placeholder="Enter 10 digit mobile number"/></Field>
          </div>
          <div><label className="block text-sm font-extrabold text-[#2d374d] mb-2">Password</label><div className="relative"><Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8c94a2]"/><input className="sc-input pl-11 pr-12" type={showPassword?'text':'password'} name="password" required minLength={10} autoComplete="new-password" placeholder="At least 10 characters"/><button type="button" onClick={()=>setShowPassword(v=>!v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8c94a2]">{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></div>
          <label className="flex items-start gap-3 text-sm text-[#626c7d]"><input type="checkbox" required className="mt-1 accent-[#5b5bd6]"/><span>I agree to the Terms of Service and Privacy Policy.</span></label>
          <Feedback error={error} message={message}/>
          <button type="submit" disabled={busy} className="sc-primary w-full py-3.5">{busy?'Creating account…':`Create ${accountType==='student'?'student':'provider'} account`}</button>
        </form>
        <p className="text-center text-sm text-[#7b8493] mt-6">Already registered? <Link className="font-extrabold text-[#5b5bd6]" to="/login">Sign in</Link></p>
      </section>
    </main>
    <Footer />
  </div>;
}

function Field({label,icon:Icon,children}){return <div><label className="block text-sm font-extrabold text-[#2d374d] mb-2">{label}</label><div className="relative"><Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8c94a2] z-10"/>{children}</div></div>}
