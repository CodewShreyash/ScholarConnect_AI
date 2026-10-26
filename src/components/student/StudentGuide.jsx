import { useState } from "react";
import { Bot, FileText, Send, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { usePreferences } from "../../context/PreferencesContext";

export default function StudentGuide({ matches, passport }) {
  const { t, language } = usePreferences();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [topic, setTopic] = useState("");
  const firstMatch = matches[0];

  const respond = selectedTopic => {
    setTopic(selectedTopic);
    setQuestion("");
    if (selectedTopic === "matches") {
      if (!firstMatch) {
        setAnswer(t("guideNoMatchesAnswer"));
        return;
      }
      setAnswer(t("guideMatchingAnswer")
        .replace("{count}", String(matches.length))
        .replace("{name}", firstMatch.displayName)
        .replace("{score}", String(firstMatch.match ?? 0)));
      return;
    }
    if (selectedTopic === "documents") {
      setAnswer(t("guideDocumentsAnswer")
        .replace("{ready}", String(passport.documentCount))
        .replace("{total}", String(passport.documentTotal))
        .replace("{nextStep}", t("guideDocumentsNext")));
      return;
    }
    if (selectedTopic === "profile") {
      setAnswer(t("guideProfileAnswer").replace("{readiness}", String(passport.readiness)));
      return;
    }
    setAnswer(t("guideFallbackAnswer"));
  };

  const ask = event => {
    event.preventDefault();
    const value = question.trim().toLocaleLowerCase(language === "mr" ? "mr-IN" : "en");
    if (!value) return;
    if (/match|eligible|scholarship|संधी|शिष्यवृत्ती|पात्र/.test(value)) respond("matches");
    else if (/document|file|कागदपत्र|दस्तऐवज/.test(value)) respond("documents");
    else if (/profile|passport|प्रोफाइल|पासपोर्ट/.test(value)) respond("profile");
    else respond("other");
  };

  const prompts = [
    ["matches", "guideMatchPrompt", Sparkles],
    ["documents", "guideDocumentsPrompt", FileText],
    ["profile", "guideProfilePrompt", ShieldCheck],
  ];

  return (
    <section className="sc-card overflow-hidden" aria-labelledby="student-guide-title">
      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eeeeff] text-[#5b5bd6]">
              <Bot size={22} />
            </span>
            <div>
              <p className="sc-eyebrow">{t("askGuide")}</p>
              <h2 id="student-guide-title" className="mt-1 text-lg font-black text-[#10162f]">{t("guideDescription")}</h2>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {prompts.map(([key, label, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => respond(key)}
                className="inline-flex items-center gap-2 rounded-xl border border-[#dce0e6] bg-white/70 px-3 py-2 text-left text-xs font-bold text-[#43506a] transition hover:border-[#b9b9ef] hover:bg-[#f5f5ff]"
              >
                <Icon size={14} className="shrink-0 text-[#5b5bd6]" />
                {t(label)}
              </button>
            ))}
          </div>
        </div>
        <div>
          {answer && <div role="status" className="mb-3 rounded-xl border border-[#dce0e6] bg-[#f7f8fc] p-4 text-sm leading-6 text-[#3e485b]">
            {answer}
            {topic === "matches" && firstMatch && <Link className="ml-1 font-extrabold text-[#5b5bd6]" to={`/scholarships/${firstMatch.id}`}>{t("explainEligibility")}</Link>}
            {topic === "documents" && <Link className="ml-1 font-extrabold text-[#5b5bd6]" to="/student/documents">{t("documentVault")}</Link>}
            {topic === "profile" && <Link className="ml-1 font-extrabold text-[#5b5bd6]" to="/student/passport">{t("passport")}</Link>}
          </div>}
          <form className="flex gap-2" onSubmit={ask}>
            <label className="sr-only" htmlFor="student-guide-question">{t("guidePlaceholder")}</label>
            <input
              id="student-guide-question"
              value={question}
              onChange={event => setQuestion(event.target.value)}
              placeholder={t("guidePlaceholder")}
              className="sc-input min-w-0 flex-1"
            />
            <button type="submit" className="sc-primary shrink-0 px-4" aria-label={t("send")}>
              <Send size={16} /><span className="hidden sm:inline">{t("send")}</span>
            </button>
          </form>
          <p className="mt-2 text-[11px] leading-5 text-[#7a8393]">{t("guidePrivacyNote")}</p>
        </div>
      </div>
    </section>
  );
}
