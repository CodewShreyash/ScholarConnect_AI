import { ExternalLink, GraduationCap, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-white/10 bg-[#252832] text-white">
      <div className="sc-container py-8 sm:py-10">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#5b5bd6]">
              <GraduationCap size={21} />
            </span>
            <div>
              <p className="font-extrabold tracking-tight">ScholarConnect AI</p>
              <p className="mt-1 text-sm text-slate-300">Created by Team Grand Genious</p>
              <p className="mt-2 text-sm font-semibold text-slate-300">Name: Shreyash H Pohokar</p>
              <a
                className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-300 transition hover:text-white"
                href="https://github.com/CodewShreyash"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit my account GitHub: CodewShreyash <ExternalLink size={14} />
              </a>
            </div>
          </div>
          <a
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            href="tel:+919022164715"
          >
            <Phone size={16} /> +91 9022164715
          </a>
        </div>
        <div className="mt-7 border-t border-white/10 pt-5 text-xs text-slate-400">
          © {new Date().getFullYear()} ScholarConnect AI
        </div>
      </div>
    </footer>
  );
}
