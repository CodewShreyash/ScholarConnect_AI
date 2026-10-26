import {
  AppWindow, BookOpen, BriefcaseBusiness, Building2, ChevronRight,
  FileText, FolderOpen, GraduationCap, LayoutDashboard, LogOut, Menu, Plus, UserRound, ShieldCheck, Sparkles, X
} from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import studentPortalImage from "../../assets/student-portal-graduates.png";
import providerPortalImage from "../../assets/provider-portal-team.png";
import DisplayPreferences from "./DisplayPreferences";
import { usePreferences } from "../../context/PreferencesContext";
import Footer from "./Footer";

export const inputClass = "sc-input";
export const buttonClass = "sc-primary";
export const cardClass = "sc-card p-5 sm:p-6";

const studentLinks = [
  ["/student/dashboard", "Overview", LayoutDashboard],
  ["/scholarships", "Discover", BookOpen],
  ["/student/profile-setup", "My profile", UserRound],
  ["/student/passport", "Scholarship Passport", ShieldCheck],
  ["/student/rescue", "Opportunity Rescue", Sparkles],
  ["/student/documents", "Document vault", FolderOpen],
  ["/student/applications", "Applications", BriefcaseBusiness],
];
const providerLinks = [
  ["/provider/dashboard", "Overview", LayoutDashboard],
  ["/scholarships", "Explore", BookOpen],
  ["/provider/profile", "Organization", Building2],
  ["/provider/scholarships/new", "Create scholarship", Plus],
  ["/provider/applications", "Applications", FileText],
];

export default function AccountLayout({ title, children }) {
  const { profile, user, signOut } = useAuth();
  const { t } = usePreferences();
  const location = useLocation();
  const [signOutError, setSignOutError] = useState("");
  const provider = profile?.role === "provider";
  const accountName = profile?.full_name?.trim()
    || user?.user_metadata?.full_name?.trim()
    || user?.email?.split("@")[0]
    || "";
  const links = provider ? providerLinks : studentLinks;
  const subtitle = provider ? "NGO / Provider workspace" : t("studentWorkspace");
  const portalImage = provider ? providerPortalImage : studentPortalImage;
  const signOutUser = async () => {
    setSignOutError("");
    try {
      await signOut();
    } catch (error) {
      setSignOutError(error.message || "Unable to sign out. Please try again.");
    }
  };
  const displayLinks = provider ? links : links.map(([to, label, Icon]) => {
    const translated = {
      Overview: "overview",
      Discover: "discover",
      "My profile": "myProfile",
      "Scholarship Passport": "passport",
      "Opportunity Rescue": "opportunityRescue",
      "Document vault": "documentVault",
      Applications: "applications",
    };
    return [to, t(translated[label] || label), Icon];
  });

  return (
    <div
      className={`min-h-screen lg:grid lg:grid-cols-[260px_minmax(0,1fr)] ${provider ? "provider-portal-shell" : "student-portal-shell"}`}
      style={provider ? { "--provider-portal-image": `url(${providerPortalImage})` } : { "--student-portal-image": `url(${studentPortalImage})` }}
    >
      <aside
        className={`hidden lg:flex flex-col text-white min-h-screen sticky top-0 p-5 ${provider ? "provider-portal-sidebar" : "student-portal-sidebar"}`}
        style={{ backgroundImage: provider
          ? `linear-gradient(180deg, rgba(35,54,45,.84), rgba(35,54,45,.98)), url(${providerPortalImage})`
          : `linear-gradient(180deg, rgba(35,54,45,.91), rgba(35,54,45,.98)), url(${studentPortalImage})` }}
      >
        <Link to="/" className="flex items-center gap-3 px-2 py-2">
          <div className="w-10 h-10 rounded-xl bg-[#d8ad63] text-[#24362d] flex items-center justify-center"><GraduationCap size={22}/></div>
          <div><p className="font-extrabold tracking-tight">ScholarConnect</p><p className="text-[10px] uppercase tracking-[.15em] text-slate-400">{subtitle}</p></div>
        </Link>

        <div className="mt-9">
          <p className="px-3 text-[10px] uppercase tracking-[.18em] text-slate-500 font-extrabold mb-3">{t("workspace")}</p>
          <nav className="space-y-1.5">
            {displayLinks.map(([to, label, Icon]) => {
              const active = location.pathname === to || (to.endsWith('/dashboard') && location.pathname === '/dashboard');
              return <NavLink key={to} to={to} className={`group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition ${active ? "bg-white text-[#24362d]" : "text-slate-300 hover:text-white hover:bg-white/8"}`}>
                <Icon size={18} className={active ? "text-[#315e4d]" : "text-slate-500 group-hover:text-slate-300"}/>
                <span className="flex-1">{label}</span>
                {active && <ChevronRight size={15} className="text-slate-400"/>}
              </NavLink>;
            })}
          </nav>
        </div>

        <div className="mt-auto rounded-2xl bg-[#182245] border border-white/8 p-4">
          <div className="w-9 h-9 rounded-lg bg-[#179c82]/20 text-[#77dec9] flex items-center justify-center mb-3"><AppWindow size={18}/></div>
          <p className="font-bold text-sm">{provider ? "One mission, more student impact." : "One profile, less paperwork."}</p>
          <p className="text-xs text-slate-400 leading-5 mt-1">{provider ? "Create transparent opportunities, define clear rules, and help more students reach submission." : "Keep your details and documents ready for the next opportunity."}</p>
        </div>
      </aside>

      <div className="min-w-0 relative">
        <div className="lg:hidden"><NavbarMobile portalImage={portalImage} provider={provider} onSignOut={signOutUser} /></div>
        <main className="max-w-[1320px] mx-auto px-4 sm:px-7 lg:px-10 py-7 lg:py-10">
          <header className="sc-account-topbar mb-5 hidden items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/75 px-5 py-3 shadow-sm backdrop-blur lg:flex">
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[#747d8c]">{subtitle}</p>
              <p className="truncate text-sm font-extrabold text-[#10162f]">{title}</p>
            </div>
            <div className="flex items-center gap-4">
              {accountName && <span aria-label="Account name" className="hidden max-w-48 truncate text-xs font-semibold text-[#737c8c] xl:block">{accountName}</span>}
              <DisplayPreferences light />
              <button type="button" onClick={signOutUser} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-[#596579] transition hover:bg-[#f0f1f5] hover:text-[#10162f]">
                <LogOut size={16} /> {t("signOut")}
              </button>
            </div>
          </header>
          {signOutError && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{signOutError}</p>}
          <section
            className={`${provider ? "provider-portal-hero" : "student-portal-hero"} mb-8 lg:mb-10`}
            style={{ backgroundImage: provider
              ? `linear-gradient(90deg, rgba(13,21,48,.94) 0%, rgba(13,21,48,.77) 44%, rgba(13,21,48,.22) 100%), url(${providerPortalImage})`
              : `linear-gradient(90deg, rgba(13,21,48,.94) 0%, rgba(13,21,48,.78) 43%, rgba(13,21,48,.24) 100%), url(${studentPortalImage})` }}
          >
            <div className={provider ? "provider-portal-hero-copy" : "student-portal-hero-copy"}>
              <p className={`${provider ? "text-[#f3c477]" : "text-[#9ce8d8]"} text-[11px] uppercase tracking-[.18em] font-extrabold`}>{subtitle}</p>
              <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-[-.04em]">{title}</h1>
              <p className="mt-3 max-w-xl text-sm sm:text-base text-slate-200/90 leading-6">{provider ? "Turn your mission into discoverable, transparent scholarship opportunities with configurable rules and a clear applicant workflow." : t("studentPortalDescription")}</p>
            </div>
          </section>
          <div className={provider ? "provider-portal-content" : "student-portal-content"}>{children}</div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

function NavbarMobile({ portalImage, provider, onSignOut }){
  const { t } = usePreferences();
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const links = provider ? providerLinks : studentLinks;
  const translatedLabel = label => {
    const keys = {
      Overview: "overview",
      Discover: "discover",
      "My profile": "myProfile",
      "Scholarship Passport": "passport",
      "Opportunity Rescue": "opportunityRescue",
      "Document vault": "documentVault",
      Applications: "applications",
    };
    return provider ? label : t(keys[label] || label);
  };
  return <header
    className="sticky top-0 z-40 bg-[#24362d] px-4 py-3 text-white shadow-lg"
    style={portalImage ? { backgroundImage: `linear-gradient(90deg, rgba(35,54,45,.96), rgba(35,54,45,.9)), url(${portalImage})`, backgroundSize: 'cover', backgroundPosition: provider ? 'center 48%' : 'center 38%' } : undefined}
  >
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 flex-col">
        <Link to="/" className="flex min-w-0 items-center gap-2 font-extrabold"><GraduationCap size={20}/> <span className="truncate">ScholarConnect</span></Link>
        {profile?.full_name && <span className="ml-7 max-w-40 truncate text-[11px] font-semibold text-slate-300">{profile.full_name}</span>}
      </div>
      <div className="flex items-center gap-2">
        <DisplayPreferences compact />
        <button type="button" onClick={() => setOpen(value => !value)} aria-label={open ? "Close workspace menu" : "Open workspace menu"} aria-expanded={open} className="rounded-lg p-2 text-slate-200 hover:bg-white/10">
          {open ? <X size={20}/> : <Menu size={20}/>}
        </button>
      </div>
    </div>
    {open && <nav aria-label="Workspace navigation" className="sc-mobile-menu mt-3 grid gap-1 border-t border-white/10 pt-3">
      {links.map(([to, label, Icon]) => <NavLink key={to} onClick={() => setOpen(false)} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${isActive ? "bg-white text-[#10162f]" : "text-slate-200 hover:bg-white/10"}`}>
        <Icon size={17}/>{translatedLabel(label)}
      </NavLink>)}
      {user && <button type="button" onClick={onSignOut} className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-300 hover:bg-white/10">
        <LogOut size={17}/>{t("signOut")}
      </button>}
    </nav>}
  </header>;
}
