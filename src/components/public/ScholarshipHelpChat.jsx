import { useState } from "react";
import { Bot, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { usePreferences } from "../../context/PreferencesContext";

const prompts = [
  ["publicGuideStart", "publicGuideStartAnswer", "/register"],
  ["publicGuideSearch", "publicGuideSearchAnswer", "/scholarships"],
  ["publicGuideEligibility", "publicGuideEligibilityAnswer", "/scholarships"],
];

export default function ScholarshipHelpChat() {
  const { t } = usePreferences();
  const [response, setResponse] = useState(null);

  return (
    <section className="sc-card overflow-hidden" aria-labelledby="public-guide-title">
      <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
        <div>
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eeeeff] text-[#5555c7]"><Bot size={22}/></span>
          <h2 id="public-guide-title" className="mt-4 text-xl font-black text-[#10162f] sm:text-2xl">{t("publicGuideTitle")}</h2>
          <p className="mt-2 text-sm leading-6 text-[#737c8c]">{t("publicGuideDescription")}</p>
        </div>
        <div>
          <div className="flex flex-wrap gap-2">
            {prompts.map(([question, answer, link]) => (
              <button
                key={question}
                type="button"
                onClick={() => setResponse({ answer, link })}
                className="inline-flex items-center gap-2 rounded-xl border border-[#dce0e6] bg-white/70 px-3 py-2.5 text-left text-xs font-bold text-[#43506a] transition hover:border-[#b9b9ef] hover:bg-[#f5f5ff]"
              >
                <MessageCircle size={14} className="shrink-0 text-[#5b5bd6]"/>
                {t(question)}
              </button>
            ))}
          </div>
          {response && <div role="status" className="mt-3 rounded-xl border border-[#dce0e6] bg-[#f7f8fc] p-4 text-sm leading-6 text-[#3e485b]">
            {t(response.answer)}
            <Link to={response.link} className="ml-1 font-extrabold text-[#5b5bd6]">{response.link === "/register" ? t("buildProfile") : t("browseScholarships")}</Link>
          </div>}
        </div>
      </div>
    </section>
  );
}
