import { ArrowUpRight, GraduationCap, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import DisplayPreferences from "./DisplayPreferences";
import { usePreferences } from "../../context/PreferencesContext";

const navLink = ({ isActive }) =>
  `sc-nav-link text-sm font-semibold transition ${isActive ? "text-[#315e4d]" : "text-[#536078] hover:text-[#315e4d]"}`;

export default function Navbar() {
  const { user, signOut } = useAuth();
  const { t } = usePreferences();
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const logout = () => signOut().catch((err) => setError(err.message));

  return (
    <header className="sticky top-0 z-50 px-3 pt-3">
      <div
        className="sc-navbar-frame max-w-7xl mx-auto rounded-2xl bg-[#fffdf8]/95 backdrop-blur-xl border border-[#e1e5eb] shadow-[0_12px_40px_rgba(16,22,47,.10)] overflow-hidden"
      >
        <div className="h-[68px] px-4 sm:px-6 flex items-center justify-between gap-5">
          <Link to="/" className="sc-navbar-brand flex items-center gap-3 min-w-0">
            <div className="sc-navbar-brand-icon w-10 h-10 rounded-xl bg-[#e8efe9] flex items-center justify-center shadow-sm shrink-0">
              <GraduationCap className="text-[#315e4d]" size={22} />
            </div>
            <div className="min-w-0">
              <p className="font-extrabold text-[17px] text-[#172036] tracking-tight truncate">ScholarConnect</p>
              <p className="text-[10px] uppercase tracking-[.16em] text-[#7a8393] font-bold">Opportunity OS</p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-7">
            <NavLink className={({ isActive }) => `${navLink({ isActive })} sc-nav-link`} to="/scholarships">{t("scholarships")}</NavLink>
            {!user && <a className="sc-nav-link text-sm font-semibold text-[#536078] hover:text-[#315e4d]" href="/#how-it-works">{t("howItWorks")}</a>}
          </nav>

          <div className="hidden lg:flex items-center">
            <DisplayPreferences light />
          </div>

          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-[#315e4d] px-3 py-2 rounded-xl hover:bg-[#e8efe9]">
                  <LayoutDashboard size={16} /> {t("dashboard")}
                </Link>
                <button onClick={logout} className="inline-flex items-center gap-2 text-sm font-semibold text-[#536078] hover:text-[#172036] px-3 py-2">
                  <LogOut size={16} /> {t("signOut")}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-[#536078] hover:text-[#172036] px-2 py-2">{t("signIn")}</Link>
                <Link to="/register" className="inline-flex items-center gap-2 bg-[#315e4d] hover:bg-[#244a3c] text-white px-4 py-2.5 rounded-xl text-sm font-extrabold transition">
                  {t("createProfile")} <ArrowUpRight size={16} />
                </Link>
              </>
            )}
          </div>

          <button className="lg:hidden text-[#315e4d] p-2 rounded-lg hover:bg-[#e8efe9]" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu" aria-expanded={open}>
            {open ? <X size={21}/> : <Menu size={21}/>} 
          </button>
        </div>

        {open && (
          <div className="sc-mobile-menu lg:hidden border-t border-[#e5e7ed] p-4 grid gap-2">
            <DisplayPreferences compact />
            <Link onClick={() => setOpen(false)} className="text-[#43506a] font-semibold py-2" to="/scholarships">{t("scholarships")}</Link>
            {user ? (
              <>
                <Link onClick={() => setOpen(false)} className="text-[#172036] font-semibold py-2" to="/dashboard">{t("dashboard")}</Link>
                <button onClick={logout} className="text-left text-[#536078] font-semibold py-2">{t("signOut")}</button>
              </>
            ) : (
              <>
                <Link onClick={() => setOpen(false)} className="text-[#43506a] font-semibold py-2" to="/login">{t("signIn")}</Link>
                <Link onClick={() => setOpen(false)} className="bg-[#315e4d] text-white font-extrabold rounded-xl px-4 py-3 mt-1 text-center" to="/register">{t("createProfile")}</Link>
              </>
            )}
          </div>
        )}
      </div>
      {error && <div role="alert" className="max-w-7xl mx-auto mt-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</div>}
    </header>
  );
}
