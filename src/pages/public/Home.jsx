import { Accessibility, ArrowRight, Award, BookOpen, FileCheck2, GraduationCap, Landmark, ListFilter, MapPin, School, ShieldCheck, Sparkles, Target, Users, WandSparkles } from "lucide-react";
import { Link } from "react-router-dom";
import ScholarshipHelpChat from "../../components/public/ScholarshipHelpChat";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { usePreferences } from "../../context/PreferencesContext";
import studentImage from "../../assets/student-portal-graduates.png";

const Home = () => {
  const { t } = usePreferences();
  const categories = [
    ["school", "schoolCategoryCopy", School, "school|pre-matric|primary"],
    ["college", "collegeCategoryCopy", GraduationCap, "undergraduate|postgraduate|university"],
    ["merit", "meritCategoryCopy", Award, "merit"],
    ["scSt", "scStCategoryCopy", Users, "Scheduled Caste|Scheduled Tribe"],
    ["obcEbc", "obcEbcCategoryCopy", Landmark, "OBC|EBC|VJNT|SBC|Nomadic"],
    ["minority", "minorityCategoryCopy", Sparkles, "minority"],
    ["disability", "disabilityCategoryCopy", Accessibility, "disability|PwD"],
    ["incomeBased", "incomeBasedCategoryCopy", Award, "income|EBC|EWS|Economically Weaker"],
    ["womenGirls", "womenGirlsCategoryCopy", Users, "women|girl"],
    ["maharashtra", "maharashtraCategoryCopy", MapPin, "Maharashtra"],
  ];
  const stages = [
    { key: "primary", detail: "primaryDetail", icon: School, query: "primary" },
    { key: "secondary", detail: "secondaryDetail", icon: BookOpen, query: "secondary" },
    { key: "graduation", detail: "graduationDetail", icon: GraduationCap, query: "graduation" },
    { key: "postGraduation", detail: "postGraduationDetail", icon: Sparkles, query: "postgraduate" },
  ];

  return (
    <div className="sc-shell">
      <Navbar />
      <main>
        <section className="sc-home-hero relative isolate overflow-hidden px-4 py-12 sm:px-6 sm:py-16 lg:py-24">
          <div
            aria-hidden="true"
            className="sc-home-backdrop"
            style={{ backgroundImage: `url(${studentImage})` }}
          />
          <div className="sc-home-student-badge" aria-hidden="true">
            <img src={studentImage} alt="" />
            <span>{t("studentsFirst")}</span>
          </div>
          <div className="sc-container relative grid items-center gap-8 lg:grid-cols-[1.1fr_.9fr] lg:gap-14">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d9d9f6] bg-white/85 px-3.5 py-2 text-xs font-extrabold text-[#4848b6] shadow-sm backdrop-blur">
                <Sparkles size={15} /> {t("studentSupport")}
              </span>
              <h1 className="sc-display mt-6 max-w-2xl text-4xl font-black tracking-[-.045em] text-[#10162f] sm:text-5xl lg:text-6xl">
                {t("findScholarship")}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#596579] sm:text-lg">
                {t("homeIntro")}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link to="/register" className="sc-primary px-5 py-3.5">
                  {t("buildProfile")} <ArrowRight size={17} />
                </Link>
                <Link to="/scholarships" className="sc-secondary px-5 py-3.5">
                  {t("browseScholarships")}
                </Link>
              </div>
            </div>

            <div id="how-it-works" className="sc-home-highlight">
              <p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#5b5bd6]">{t("simpleSteps")}</p>
              <ol className="mt-5 space-y-4">
                {[
                  ["stepOneTitle", "stepOneCopy"],
                  ["stepTwoTitle", "stepTwoCopy"],
                  ["stepThreeTitle", "stepThreeCopy"],
                ].map(([title, copy], index) => (
                  <li key={title} className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eeeeff] text-sm font-black text-[#5b5bd6]">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-extrabold text-[#10162f]">{t(title)}</p>
                      <p className="mt-1 text-sm leading-5 text-[#737c8c]">{t(copy)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="sc-container py-12 sm:py-16">
          <div className="mb-6 max-w-2xl">
            <p className="sc-eyebrow">{t("stageTitle")}</p>
            <p className="mt-2 text-sm leading-6 text-[#687285]">{t("stageDescription")}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {stages.map(({ key, detail, icon: Icon, query }) => (
              <Link
                key={key}
                to={`/scholarships?track=${query}`}
                className="sc-card sc-stage-card group flex items-center gap-4 p-4 sm:p-5"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eeeeff] text-[#5b5bd6] transition group-hover:scale-105">
                  <Icon size={21} />
                </span>
                <span className="min-w-0">
                  <span className="block font-extrabold text-[#10162f]">{t(key)}</span>
                  <span className="mt-1 block text-xs leading-5 text-[#737c8c]">{t(detail)}</span>
                </span>
                <ArrowRight size={16} className="ml-auto shrink-0 text-[#8b92a0] transition group-hover:translate-x-1 group-hover:text-[#5b5bd6]" />
              </Link>
            ))}
          </div>
          <div className="mt-5 text-center">
            <Link className="inline-flex items-center gap-2 text-sm font-extrabold text-[#5b5bd6] hover:text-[#4646ba]" to="/scholarships">
              {t("exploreAll")} <ArrowRight size={15} />
            </Link>
          </div>
        </section>

        <section className="sc-container py-12 sm:py-16" aria-labelledby="category-title">
          <div className="mb-6 max-w-2xl">
            <p className="sc-eyebrow">{t("categoryEyebrow")}</p>
            <h2 id="category-title" className="mt-2 text-3xl font-black tracking-tight text-[#10162f] sm:text-4xl">{t("categoryHeading")}</h2>
            <p className="mt-3 text-sm leading-6 text-[#687285]">{t("categoryDescription")}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {categories.map(([title, copy, Icon, search]) => (
              <Link key={title} to={`/scholarships?search=${encodeURIComponent(search)}`} className="sc-card sc-category-card group flex items-start gap-3 p-4 sm:p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8efe9] text-[#315e4d] transition group-hover:scale-105"><Icon size={19}/></span>
                <span><span className="block font-extrabold text-[#10162f]">{t(title)}</span><span className="mt-1 block text-xs leading-5 text-[#737c8c]">{t(copy)}</span></span>
                <ArrowRight size={15} className="ml-auto mt-1 shrink-0 text-[#8b92a0] transition group-hover:translate-x-1 group-hover:text-[#315e4d]"/>
              </Link>
            ))}
          </div>
        </section>

        <section className="sc-home-features px-4 py-12 sm:px-6 sm:py-16">
          <div className="sc-container">
            <div className="mb-7 max-w-2xl">
              <p className="sc-eyebrow">{t("featureEyebrow")}</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-[#10162f] sm:text-4xl">{t("featureHeading")}</h2>
              <p className="mt-3 text-sm leading-6 text-[#687285] sm:text-base">{t("featureDescription")}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[
                [Target, "smartMatching", "smartMatchingCopy", "/scholarships", "bg-[#eeeeff] text-[#5555c7]"],
                [ListFilter, "sorting", "sortingCopy", "/scholarships", "bg-[#e9f2ff] text-[#3267a2]"],
                [ShieldCheck, "explainableEligibility", "explainableEligibilityCopy", "/scholarships", "bg-[#e5f6f1] text-[#147d69]"],
                [FileCheck2, "reusableProfile", "reusableProfileCopy", "/register", "bg-[#fff1d4] text-[#9a6714]"],
                [Sparkles, "scholarShield", "scholarShieldCopy", "/scholarships", "bg-[#f1eaff] text-[#7546a8]"],
                [WandSparkles, "opportunityRescue", "rescueCopy", "/register", "bg-[#e9f2ff] text-[#3267a2]"],
                [BookOpen, "studentGuide", "studentGuideCopy", "/register", "bg-[#e5f6f1] text-[#147d69]"],
              ].map(([Icon, title, copy, to, tone]) => (
                <Link key={title} to={to} className="sc-card sc-feature-card group p-5 sm:p-6">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone} transition group-hover:scale-105`}><Icon size={20}/></span>
                  <h3 className="mt-4 font-extrabold text-[#10162f]">{t(title)}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#737c8c]">{t(copy)}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-extrabold text-[#5b5bd6]">{t("learnMore")} <ArrowRight size={14}/></span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="sc-container py-12 sm:py-16">
          <ScholarshipHelpChat />
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default Home;
