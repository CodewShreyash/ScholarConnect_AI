import { useMemo, useState } from "react";
import { ArrowDown, BookOpen, FileCheck2, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import {
  commonScholarshipDocuments,
  filterScholarshipGuide,
  scholarshipGuideCategories,
  scholarshipGuideStages,
} from "../../data/scholarshipGuide";

export default function ScholarshipReferenceGuide() {
  const [stageId, setStageId] = useState("all");
  const [category, setCategory] = useState("All categories");
  const stages = useMemo(
    () => filterScholarshipGuide(scholarshipGuideStages, stageId, category),
    [stageId, category]
  );
  const total = stages.reduce((count, stage) => count + stage.schemes.length, 0);

  return (
    <section className="sc-guide-section mt-8" aria-labelledby="scheme-guide-title">
      <div className="rounded-[1.75rem] bg-[#24362d] p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.16em] text-[#e8c887]">
              <BookOpen size={15} /> Scholarship discovery guide
            </p>
            <h2 id="scheme-guide-title" className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
              Explore schemes by education stage and category
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-200/80">
              Browse the scheme list shared for Maharashtra students. Use the filters to focus on a study stage or eligibility group.
            </p>
          </div>
          <label className="w-full md:max-w-xs">
            <span className="mb-2 block text-xs font-bold text-slate-200">Filter by student category</span>
            <select
              aria-label="Filter schemes by category"
              value={category}
              onChange={event => setCategory(event.target.value)}
              className="h-12 w-full rounded-xl border border-white/20 bg-white px-3 text-sm font-semibold text-[#24362d] outline-none transition focus:ring-4 focus:ring-[#d8ad63]/30"
            >
              {scholarshipGuideCategories.map(item => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2" aria-label="Education-stage filters">
          {[["all", "All stages"], ...scholarshipGuideStages.map(stage => [stage.id, stage.title])].map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={stageId === id}
              onClick={() => setStageId(id)}
              className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-extrabold transition duration-200 ${
                stageId === id
                  ? "bg-[#e8c887] text-[#24362d] shadow-md"
                  : "border border-white/20 bg-white/5 text-white hover:-translate-y-0.5 hover:bg-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-bold text-[#596579]">{total} scheme references</p>
        <a href="#published-opportunities" className="inline-flex items-center gap-2 text-sm font-extrabold text-[#315e4d] transition hover:gap-3">
          Browse published ScholarConnect opportunities <ArrowDown size={15} />
        </a>
      </div>

      {stages.length ? stages.map(stage => (
        <section key={stage.id} className="mt-7 scroll-mt-28" aria-labelledby={`stage-${stage.id}`}>
          <div className="mb-4 flex items-end justify-between gap-3">
            <h3 id={`stage-${stage.id}`} className="text-xl font-black tracking-tight text-[#172036] sm:text-2xl">{stage.title}</h3>
            <span className="rounded-full bg-[#e8efe9] px-3 py-1 text-xs font-extrabold text-[#315e4d]">{stage.schemes.length} schemes</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {stage.schemes.map(scheme => (
              <article key={scheme.name} className="sc-card sc-scheme-card flex h-full flex-col p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8efe9] text-[#315e4d]"><ShieldCheck size={19}/></span>
                  <span className="rounded-full bg-[#f7efdc] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#80612d]">Scheme guide</span>
                </div>
                <h4 className="mt-4 text-lg font-black leading-snug text-[#172036]">{scheme.name}</h4>
                <p className="mt-2 text-xs font-bold text-[#315e4d]">{scheme.authority}</p>
                <p className="mt-3 flex-1 text-sm leading-6 text-[#687285]">{scheme.audience}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {scheme.categories.map(item => (
                    <span key={item} className="rounded-lg bg-[#f1f2ed] px-2.5 py-1 text-[11px] font-bold text-[#526078]">{item}</span>
                  ))}
                  {scheme.openToAllCategories && (
                    <span className="rounded-lg bg-[#e8efe9] px-2.5 py-1 text-[11px] font-bold text-[#315e4d]">Open across community categories</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )) : (
        <p className="sc-card mt-6 p-6 text-sm text-[#687285]">No scheme references match this combination. Try another stage or category.</p>
      )}

      <details className="sc-card mt-7 overflow-hidden">
        <summary className="flex cursor-pointer list-none items-center gap-3 p-5 font-extrabold text-[#172036] marker:content-none sm:p-6">
          <FileCheck2 size={19} className="text-[#315e4d]"/>
          Common application-document checklist
          <span className="ml-auto text-xs font-bold text-[#315e4d]">Open / close</span>
        </summary>
        <div className="border-t border-[#e7e9e3] p-5 sm:p-6">
          <p className="mb-4 text-sm leading-6 text-[#687285]">This is a preparation guide, not a universal requirement. Check the published scheme's own document list before applying.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {commonScholarshipDocuments.map(([name, description]) => (
              <div key={name} className="rounded-xl bg-[#f4f5f1] p-4">
                <p className="font-extrabold text-[#172036]">{name}</p>
                <p className="mt-1 text-xs leading-5 text-[#687285]">{description}</p>
              </div>
            ))}
          </div>
          <Link to="/student/documents" className="sc-secondary mt-5">Open your document vault</Link>
        </div>
      </details>

      <p className="mt-4 rounded-xl border border-[#eadcb9] bg-[#fff9ec] p-4 text-xs leading-5 text-[#725c34]">
        Scheme names and audience descriptions are informational references from the shared list. They are not live availability, final eligibility decisions, or direct government application forms. Only published ScholarConnect opportunities below can be applied for through this portal.
      </p>
    </section>
  );
}
