import { Moon, Sun } from "lucide-react";
import { usePreferences } from "../../context/PreferencesContext";

export default function DisplayPreferences({ compact = false, light = false }) {
  const { language, setLanguage, theme, toggleTheme, t } = usePreferences();

  return (
    <div className={`flex items-center gap-2 ${compact ? "flex-wrap" : ""}`}>
      <div className={`inline-flex items-center rounded-xl border p-1 ${light ? "border-[#e1e5eb] bg-[#f4f5f8]" : "border-white/15 bg-white/5"}`} aria-label={t("language")}>
        <button
          type="button"
          onClick={() => setLanguage("en")}
          aria-label={t("switchToEnglish")}
          aria-pressed={language === "en"}
          className={`rounded-lg px-2.5 py-1.5 text-xs font-extrabold transition ${language === "en" ? "bg-white text-[#10162f] shadow-sm" : light ? "text-[#536078] hover:text-[#172036]" : "text-slate-300 hover:text-white"}`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLanguage("mr")}
          aria-label={t("switchToMarathi")}
          aria-pressed={language === "mr"}
          className={`rounded-lg px-2.5 py-1.5 text-xs font-extrabold transition ${language === "mr" ? "bg-white text-[#10162f] shadow-sm" : light ? "text-[#536078] hover:text-[#172036]" : "text-slate-300 hover:text-white"}`}
        >
          मराठी
        </button>
      </div>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === "dark" ? t("lightMode") : t("darkMode")}
        title={theme === "dark" ? t("lightMode") : t("darkMode")}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition ${light ? "border-[#e1e5eb] bg-[#f4f5f8] text-[#536078] hover:bg-[#e9ebf1] hover:text-[#172036]" : "border-white/15 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"}`}
      >
        {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
      </button>
    </div>
  );
}
