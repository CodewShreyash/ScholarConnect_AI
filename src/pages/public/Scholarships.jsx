import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  Sparkles,
  CheckCircle2,
  GraduationCap,
  ArrowLeft,
  BookOpen,
  MapPin,
  ArrowRight,
  CalendarDays,
  Wallet,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from '../../context/AuthContext';
import { listScholarships } from '../../lib/api';
import { useResource } from '../../lib/useResource';
import Feedback from '../../components/common/Feedback';
import ScholarshipReferenceGuide from "../../components/public/ScholarshipReferenceGuide";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { usePreferences } from "../../context/PreferencesContext";
import studentPortalImage from "../../assets/student-portal-graduates.png";
import providerPortalImage from "../../assets/provider-portal-team.png";

export function sortScholarships(items, sortBy, student) {
  return [...items].sort((a, b) => {
    if (sortBy === "name") return a.displayName.localeCompare(b.displayName);
    if (sortBy === "deadline") {
      const aDeadline = Date.parse(a.deadlineAt || a.deadline);
      const bDeadline = Date.parse(b.deadlineAt || b.deadline);
      if (Number.isNaN(aDeadline)) return Number.isNaN(bDeadline) ? 0 : 1;
      if (Number.isNaN(bDeadline)) return -1;
      return aDeadline - bDeadline;
    }
    if (student) return (b.match ?? -1) - (a.match ?? -1);
    return a.displayName.localeCompare(b.displayName);
  });
}

const Scholarships = () => {
  const [searchParams] = useSearchParams();
  const {profile}=useAuth();
  const {t}=usePreferences();
  const student = profile?.role === 'student';
  const provider = profile?.role === 'provider';
  const roleImage = student ? studentPortalImage : provider ? providerPortalImage : null;
  const {data,error,loading,reload}=useResource(()=>listScholarships(student),[profile?.id]);
  const scholarships=data||[];
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const track = searchParams.get("track") || "";
  const [providerType, setProviderType] = useState("All");
  const [educationLevel, setEducationLevel] = useState("All");
  const [sortBy, setSortBy] = useState("recommended");

  const providerTypes = [...new Set([
    "All",
    ...scholarships.map((item) => item.providerType).filter(Boolean),
  ])];

  const educationLevels = [...new Set([
    "All",
    ...scholarships.map((item) => item.educationLevel).filter(Boolean),
  ])];
  const activeFilterCount = Number(Boolean(search.trim())) + Number(providerType !== "All") + Number(educationLevel !== "All");
  const clearFilters = () => {
    setSearch("");
    setProviderType("All");
    setEducationLevel("All");
    setSortBy("recommended");
  };

  const filteredScholarships = useMemo(() => {
    return scholarships.filter((item) => {
      const value = search.toLowerCase();
      const searchTerms = value.split("|").map(term => term.trim()).filter(Boolean);
      const education = (item.educationLevel || "").toLowerCase();
      const tags = [...(item.tags || []), ...(item.categories || [])].join(" ").toLowerCase();
      const searchableText = [
        item.displayName,
        item.officialName,
        item.provider,
        item.stream,
        item.educationLevel,
        ...(item.tags || []),
        ...(item.categories || []),
        ...(item.states || []),
      ].filter(Boolean).join(" ").toLowerCase();
      const matchesTrack = !track
        || (track === "primary" && /primary|class\s*[1-5]/i.test(item.educationLevel || ""))
        || (track === "secondary" && (/school|pre-matric|class\s*(?:ix|x|9|10)\b/i.test(`${item.educationLevel} ${tags}`)))
        || (track === "graduation" && (/undergraduate|\bug\b/i.test(education) || /\bug\b/i.test(tags)))
        || (track === "postgraduate" && /postgraduate|phd|research/i.test(education));

      const matchesSearch = !searchTerms.length || searchTerms.some(term => searchableText.includes(term));

      const matchesProvider =
        providerType === "All" ||
        item.providerType === providerType;

      const matchesEducation =
        educationLevel === "All" ||
        item.educationLevel === educationLevel;

      return (
        matchesSearch &&
        matchesTrack &&
        matchesProvider &&
        matchesEducation
      );
    });
  }, [search, providerType, educationLevel, data, track]);

  const sortedScholarships = useMemo(
    () => sortScholarships(filteredScholarships, sortBy, student),
    [filteredScholarships, sortBy, student]
  );

  return (
    <div
      className={student ? "student-discovery-shell" : provider ? "provider-discovery-shell" : "min-h-screen bg-[#f4f5f1]"}
      style={student ? { "--student-portal-image": `url(${studentPortalImage})` } : provider ? { "--provider-portal-image": `url(${providerPortalImage})` } : undefined}
    >

      <Navbar />

      <section className="px-3 pt-5 sm:px-6 sm:pt-8">
        <div
          className={`sc-discovery-hero max-w-7xl mx-auto rounded-[1.75rem] sm:rounded-[2rem] text-white px-5 sm:px-8 lg:px-10 py-7 sm:py-11 relative overflow-hidden ${student ? "student-discovery-hero" : provider ? "provider-discovery-hero" : "bg-[#10162f]"}`}
          style={roleImage ? { backgroundImage: `linear-gradient(90deg, rgba(13,21,48,.95) 0%, rgba(13,21,48,.78) 48%, rgba(13,21,48,.25) 100%), url(${roleImage})` } : undefined}
        >
          <div className="absolute -right-20 -top-24 w-72 h-72 rounded-full border-[46px] border-[#5b5bd6]/20" />
          <div className="relative grid lg:grid-cols-[1fr_.78fr] gap-6 sm:gap-8 items-end">
            <div>
              <p className="text-[#b8b8ff] text-[10px] sm:text-xs font-extrabold uppercase tracking-[.16em] flex items-center gap-2"><Sparkles size={15}/> Opportunity explorer <span className="rounded-full border border-white/15 bg-white/10 px-2 py-1 text-[9px] tracking-normal">ScholarConnect</span></p>
              <h2 className="mt-3 sm:mt-4 text-[2rem] leading-[1.08] sm:text-5xl font-black tracking-[-.04em] max-w-2xl">{provider ? "See the opportunity landscape you are contributing to." : "Find scholarships you can actually finish."}</h2>
              <p className="mt-3 sm:mt-4 text-slate-300/85 text-sm sm:text-base leading-6 sm:leading-7 max-w-2xl">{provider ? "Explore published schemes and compare how organizations describe eligibility, support, and deadlines across the ecosystem." : "Discover published opportunities, then open one to explain every eligibility rule and run ScholarShield before you submit."}</p>
            </div>
            <div className="relative">
              <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input type="search" value={search} onChange={(e)=>setSearch(e.target.value)} aria-label="Search scholarships" placeholder="Search scholarship, stream or provider…" className="w-full h-12 sm:h-14 pl-12 pr-4 bg-white text-[#172036] rounded-xl border border-white/10 outline-none focus:ring-4 focus:ring-[#5b5bd6]/30"/>
              <p className="mt-2 px-1 text-[11px] text-slate-300/80">Try a course, provider, category, or scholarship name</p>
            </div>
          </div>
          <div className="relative mt-6 grid grid-cols-3 gap-2 sm:gap-3">
            {[
              [<BookOpen size={14}/>, "Stage-wise guide"],
              [<Sparkles size={14}/>, "Explainable matching"],
              [<ShieldCheck size={14}/>, "Private document vault"],
            ].map(([icon,label])=>(
              <div key={label} className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[.07] px-2 py-2 text-center text-[9px] font-bold text-white/90 sm:gap-2 sm:text-xs">
                <span className="shrink-0 text-[#e8c887]">{icon}</span>{label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-3 py-6 sm:px-6 sm:py-10 lg:px-8">

        <Feedback error={error} loading={loading}/>{error&&<button onClick={reload}>Retry</button>}
        {profile?.role && <Link className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#dadddf] bg-white/80 px-3 py-2 text-xs font-bold text-[#5151c7] transition hover:-translate-x-0.5 hover:bg-white" to="/dashboard"><ArrowLeft size={14}/> My Dashboard</Link>}
        {/* FILTERS */}
        <div className="sc-card p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8efe9] text-[#315e4d]"><Filter size={18}/></span>
              <div><h2 className="font-black text-[#172036]">Find your best fit</h2><p className="text-xs text-slate-500">Narrow results by organization, study level, or priority.</p></div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#eef0f7] px-3 py-1.5 text-xs font-bold text-[#596579]">{activeFilterCount} filters active</span>
              {activeFilterCount>0&&<button type="button" onClick={clearFilters} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-bold text-[#5151c7] transition hover:bg-[#eeeeff]"><RotateCcw size={13}/> Reset</button>}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 mt-4">
            <div>
              <label htmlFor="scholarship-provider-filter" className="text-xs font-semibold text-slate-500">
                Provider Type
              </label>

              <select
                id="scholarship-provider-filter"
                value={providerType}
                onChange={(e) =>
                  setProviderType(e.target.value)
                }
                className="sc-input mt-2 h-12"
              >
                {providerTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="scholarship-education-filter" className="text-xs font-semibold text-slate-500">
                Education Level
              </label>

              <select
                id="scholarship-education-filter"
                value={educationLevel}
                onChange={(e) =>
                  setEducationLevel(e.target.value)
                }
                className="sc-input mt-2 h-12"
              >
                {educationLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="scholarship-sort" className="text-xs font-semibold text-slate-500">{t("sortBy")}</label>
              <select
                id="scholarship-sort"
                value={sortBy}
                onChange={event => setSortBy(event.target.value)}
                className="sc-input mt-2 h-12"
              >
                <option value="recommended">{t("sortRecommended")}</option>
                <option value="deadline">{t("sortDeadline")}</option>
                <option value="name">{t("sortName")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* COUNT */}
        {track && <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#dadddf] bg-[#fffdf8] px-4 py-3 text-sm">
          <p className="text-[#596579]">{sortedScholarships.length} matching opportunities in this education stage.</p>
          <Link className="font-extrabold text-[#5b5bd6]" to="/scholarships">Show all scholarships</Link>
        </div>}

        <ScholarshipReferenceGuide />

        <div id="published-opportunities" className="mt-10 mb-5 scroll-mt-28 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="sc-eyebrow">Published catalog</p>
            <h3 className="mt-1 text-2xl font-black tracking-tight text-[#172036] sm:text-3xl">Available Opportunities</h3>
            <p className="mt-1 text-sm text-slate-500">Open a listing to review rules and required documents before applying.</p>
          </div>
          <span aria-live="polite" className="rounded-full border border-[#dadddf] bg-white px-3 py-2 text-xs font-bold text-[#596579]">{sortedScholarships.length} {sortedScholarships.length===1?'opportunity':'opportunities'} found</span>
        </div>

        {/* CARDS */}
        {sortedScholarships.length > 0 ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
            {sortedScholarships.map((scholarship) => (
              <article
                key={scholarship.id}
                className="sc-opportunity-card flex min-h-[440px] flex-col rounded-2xl border border-[#dadddf] bg-[#fffdf8] p-5 sm:p-6"
              >
                {/* TOP BADGES */}
                <div className="flex items-center justify-between gap-3">
                  <span className="bg-[#eeeeff] text-[#5151c7] px-3 py-1 rounded-full text-xs font-semibold">
                    {scholarship.providerType}
                  </span>

                  {scholarship.verified && (
                    <span className="flex items-center gap-1 text-xs text-emerald-700 font-medium">
                      <CheckCircle2 size={14} />
                      Verified
                    </span>
                  )}
                </div>

                {/* TITLE */}
                <div className="mt-4">
                  <h4 className="text-lg font-bold text-slate-950 leading-snug">
                    {scholarship.displayName}
                  </h4>

                  <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                    {scholarship.provider}
                  </p>
                </div>

                {/* EDUCATION + LOCATION */}
                <div className="grid grid-cols-2 gap-2.5 mt-5">
                  <div className="bg-[#f4f5f1] rounded-xl p-3 min-h-[82px]">
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <BookOpen size={13} />
                      Education
                    </p>

                    <p className="text-sm font-semibold mt-1 line-clamp-3">
                      {scholarship.educationLevel}
                    </p>
                  </div>

                  <div className="bg-[#f4f5f1] rounded-xl p-3 min-h-[82px]">
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin size={13} />
                      Location
                    </p>

                    <p className="text-sm font-semibold mt-1 line-clamp-3">
                      {scholarship.location}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  <div className="rounded-xl border border-[#e7e9e3] bg-white/70 p-3">
                    <p className="flex items-center gap-1.5 text-xs text-slate-500"><Wallet size={13}/> Support</p>
                    <p className="mt-1 text-sm font-bold text-[#172036] line-clamp-2">{scholarship.amount || 'Details on listing'}</p>
                  </div>
                  <div className="rounded-xl border border-[#e7e9e3] bg-white/70 p-3">
                    <p className="flex items-center gap-1.5 text-xs text-slate-500"><CalendarDays size={13}/> Deadline</p>
                    <p className="mt-1 text-sm font-bold text-[#172036] line-clamp-2">{scholarship.deadlineAt ? new Date(scholarship.deadlineAt).toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'}) : scholarship.deadline || 'See details'}</p>
                  </div>
                </div>

                {/* MATCH */}
                <div className="mt-4 bg-[#eeeeff] border border-[#dedefc] rounded-xl p-4 flex items-center justify-between gap-3 min-h-[82px]">
                  <div>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Sparkles
                        size={13}
                        className="text-[#5151c7]"
                      />
                      Explainable Rule Match
                    </p>

                    <p className="text-[#5151c7] font-bold mt-1 text-sm">
                      {scholarship.match === null ? 'Sign in / complete profile' : scholarship.eligible ? `${scholarship.match}% · Eligible` : `${scholarship.match}% · Review rules`}
                    </p>
                  </div>

                  <div className="h-11 w-11 shrink-0 rounded-full bg-[#fffdf8] border-4 border-[#cfcff8] flex items-center justify-center text-[10px] font-bold text-[#5151c7]">
                    {scholarship.match === null ? '—' : `${scholarship.match}%`}
                  </div>
                </div>

                {/* TAGS */}
                <div className="flex flex-wrap content-start gap-2 mt-4">
                  {[...(scholarship.tags||[]),...(scholarship.categories||[])].slice(0, 4)
                    .slice(0, 3)
                    .map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg h-fit"
                      >
                        {tag}
                      </span>
                    ))}
                </div>

                {/* BUTTON */}
                <div className="mt-auto pt-5">
                  <Link
                    to={`/scholarships/${scholarship.id}`}
                    className="sc-opportunity-action w-full bg-slate-950 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition"
                  >
                    {profile?.role==='student'?'Explain & pre-check':'View Details'}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="sc-card p-8 text-center sm:p-12">
            <Search
              size={36}
              className="mx-auto text-slate-300"
            />

            <h3 className="font-bold text-xl mt-4">
              No scholarships found
            </h3>

            <p className="text-sm text-slate-500 mt-2">
              Try changing your search or filters.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Scholarships;