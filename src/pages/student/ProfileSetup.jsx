import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  FileText,
  GraduationCap,
  IndianRupee,
  MapPin,
  School,
  User,
} from "lucide-react";

import { useAuth } from '../../context/AuthContext';
import { loadStudent, saveStudent, profileToForm, isStudentProfileComplete, listDocuments, uploadDocument, validateFile } from '../../lib/api';
import { errorMessage } from '../../lib/supabase';
import Feedback from '../../components/common/Feedback';
const ProfileSetup = () => {
  const {user}=useAuth(),navigate=useNavigate();
  const [busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState('');
  const [profileComplete,setProfileComplete]=useState(false);
  useEffect(()=>{let active=true;Promise.all([loadStudent(user.id),listDocuments(user.id)]).then(([profile,docs])=>{if(active){setProfileComplete(isStudentProfileComplete(profile));setFormData(old=>({...old,...profileToForm(profile),...Object.fromEntries(Object.entries(fileMap).map(([field,kind])=>[field,docs.find(d=>d.kind===kind)||null]))}));}}).catch(err=>{if(active)setError(errorMessage(err));}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[user.id]);
  const fileMap={categoryCertificate:'Category Certificate',incomeCertificate:'Income Certificate',marksheet:'Marksheet',admissionProof:'Admission Proof'};
  const save=async()=>{if(!formData.category){setError('Choose your category to get relevant scholarship matches.');return;}setBusy(true);setError('');try{await saveStudent(user.id,formData);for(const [field,kind] of Object.entries(fileMap)){if(formData[field] instanceof File){const uploaded=await uploadDocument(user.id,kind,formData[field]);setFormData(old=>({...old,[field]:uploaded}));}}navigate('/student/dashboard');}catch(err){setError(errorMessage(err));}finally{setBusy(false);}};

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    state: "",
    district: "",

    educationLevel: "",
    course: "",
    yearOfStudy: "",
    institution: "",
    percentage: "",

    category: "",
    familyIncome: "",
    domicileState: "",

    categoryCertificate: null,
    incomeCertificate: null,
    marksheet: null,
    admissionProof: null,
  });

  const totalSteps = 5;

  const progress = useMemo(() => {
    return Math.round((step / totalSteps) * 100);
  }, [step]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleFile = (event) => {
    const { name, files } = event.target;

    try { if(files?.[0])validateFile(files[0]);setError('');setFormData(previous=>({...previous,[name]:files?.[0]||null})); } catch(err){setError(errorMessage(err));event.target.value='';}
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep((previous) => previous + 1);
    }
  };

  const previousStep = () => {
    if (step > 1) {
      setStep((previous) => previous - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f1]">

      {/* HEADER */}
      <header className="bg-[#24362d] text-white border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <div className="w-11 h-11 rounded-xl bg-[#d8ad63] text-[#24362d] flex items-center justify-center">
              <GraduationCap
                size={24}
                className="text-white"
              />
            </div>

            <div>
              <h1 className="font-bold text-lg sm:text-xl">
                ScholarConnect AI
              </h1>

              <p className="hidden sm:block text-xs text-slate-400">
                Student Profile Setup
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/student/dashboard"
              className="flex items-center gap-2 text-sm font-semibold text-slate-200 hover:text-white"
            >
              <ArrowLeft size={17} />
              Back to dashboard
            </Link>
            <Link to="/" className="hidden sm:inline text-sm font-semibold text-slate-400 hover:text-white">Home</Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Feedback error={error} loading={loading}/>
        <Link to="/student/documents" className="text-[#5151c7]">Manage all documents in your vault</Link>

        {/* TOP */}
        <div>
          <p className="text-sm font-semibold text-[#5151c7]">
            STUDENT ONBOARDING
          </p>

          <h2 className="text-3xl sm:text-4xl font-bold mt-2">
            {profileComplete ? "Edit your scholarship profile" : "Build your scholarship profile"}
          </h2>

          <p className="text-slate-500 mt-3 leading-7">
            Complete your profile once. ScholarConnect AI will later use this
            information to identify relevant scholarships and check your
            application readiness.
          </p>
        </div>

        {/* PROGRESS */}
        <div className="mt-8 bg-[#10162f] text-white border border-white/10 rounded-[1.5rem] p-5 sm:p-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">
              Step {step} of {totalSteps}
            </span>

            <span className="text-[#5151c7] font-bold">
              {progress}%
            </span>
          </div>

          <div className="h-2 bg-white/10 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-[#5b5bd6] rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div className="grid grid-cols-5 gap-2 mt-5">
            {[
              "Basic",
              "Academic",
              "Eligibility",
              "Documents",
              "Review",
            ].map((label, index) => {
              const currentStep = index + 1;

              return (
                <div
                  key={label}
                  className="text-center"
                >
                  <div
                    className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${
                      currentStep < step
                        ? "bg-emerald-600 text-white"
                        : currentStep === step
                        ? "bg-[#5b5bd6] text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {currentStep < step ? (
                      <Check size={15} />
                    ) : (
                      currentStep
                    )}
                  </div>

                  <p className="hidden sm:block text-[11px] text-slate-400 mt-2">
                    {label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* FORM CARD */}
        <div className="bg-[#fffdf8] border border-[#dadddf] rounded-3xl p-5 sm:p-8 mt-6">

          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-[#eeeeff] rounded-xl flex items-center justify-center">
                  <User
                    size={21}
                    className="text-[#5151c7]"
                  />
                </div>

                <div>
                  <h3 className="font-bold text-xl">
                    Basic Information
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    Tell us a little about yourself.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mt-7">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold mb-2">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full h-13 px-4 border border-[#dadddf] rounded-xl outline-none focus:border-[#6868e5] focus:ring-4 focus:ring-[#dedefc]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Date of Birth
                  </label>

                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full h-13 px-4 border border-[#dadddf] rounded-xl outline-none focus:border-[#6868e5]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Gender
                  </label>

                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full h-13 px-4 border border-[#dadddf] rounded-xl bg-[#fffdf8] outline-none focus:border-[#6868e5]"
                  >
                    <option value="">
                      Select gender
                    </option>
                    <option value="Male">
                      Male
                    </option>
                    <option value="Female">
                      Female
                    </option>
                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    State
                  </label>

                  <div className="relative">
                    <MapPin
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="e.g. Maharashtra"
                      className="w-full h-13 pl-11 pr-4 border border-[#dadddf] rounded-xl outline-none focus:border-[#6868e5]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    District
                  </label>

                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="Enter district"
                    className="w-full h-13 px-4 border border-[#dadddf] rounded-xl outline-none focus:border-[#6868e5]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-[#eeeeff] rounded-xl flex items-center justify-center">
                  <BookOpen
                    size={21}
                    className="text-[#5151c7]"
                  />
                </div>

                <div>
                  <h3 className="font-bold text-xl">
                    Academic Information
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    Help us understand your current education.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mt-7">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Education Level
                  </label>

                  <select
                    name="educationLevel"
                    value={formData.educationLevel}
                    onChange={handleChange}
                    className="w-full h-13 px-4 border border-[#dadddf] rounded-xl bg-[#fffdf8] outline-none focus:border-[#6868e5]"
                  >
                    <option value="">
                      Select level
                    </option>
                    <option value="School">
                      School
                    </option>
                    <option value="Class XI-XII">
                      Class XI-XII
                    </option>
                    <option value="Diploma">
                      Diploma
                    </option>
                    <option value="Undergraduate">
                      Undergraduate
                    </option>
                    <option value="Postgraduate">
                      Postgraduate
                    </option>
                    <option value="Research / PhD">
                      Research / PhD
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Course / Stream
                  </label>

                  <input
                    type="text"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    placeholder="e.g. MCA, B.Tech, Science"
                    className="w-full h-13 px-4 border border-[#dadddf] rounded-xl outline-none focus:border-[#6868e5]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Year of Study
                  </label>

                  <input
                    type="text"
                    name="yearOfStudy"
                    value={formData.yearOfStudy}
                    onChange={handleChange}
                    placeholder="e.g. 1st Year"
                    className="w-full h-13 px-4 border border-[#dadddf] rounded-xl outline-none focus:border-[#6868e5]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Latest Percentage
                  </label>

                  <input
                    type="number"
                    name="percentage" min="0" max="100" step="0.01"
                    value={formData.percentage}
                    onChange={handleChange}
                    placeholder="e.g. 72"
                    className="w-full h-13 px-4 border border-[#dadddf] rounded-xl outline-none focus:border-[#6868e5]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold mb-2">
                    Institution / College Name
                  </label>

                  <div className="relative">
                    <School
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      name="institution"
                      value={formData.institution}
                      onChange={handleChange}
                      placeholder="Enter institution name"
                      className="w-full h-13 pl-11 pr-4 border border-[#dadddf] rounded-xl outline-none focus:border-[#6868e5]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-[#eeeeff] rounded-xl flex items-center justify-center">
                  <IndianRupee
                    size={21}
                    className="text-[#5151c7]"
                  />
                </div>

                <div>
                  <h3 className="font-bold text-xl">
                    Scholarship Eligibility
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    Information used for eligibility matching.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mt-7">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Category
                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full h-13 px-4 border border-[#dadddf] rounded-xl bg-[#fffdf8] outline-none focus:border-[#6868e5]"
                  >
                    <option value="">Select your category</option>
                    <option value="General / Open">General / Open</option>
                    <option value="Scheduled Caste">Scheduled Caste (SC)</option>
                    <option value="Scheduled Tribe">Scheduled Tribe (ST)</option>
                    <option value="OBC">Other Backward Class (OBC)</option>
                    <option value="EBC">Economically Backward Class (EBC)</option>
                    <option value="VJNT / NT">VJNT / Nomadic Tribes</option>
                    <option value="SBC">Special Backward Class (SBC)</option>
                    <option value="EWS">Economically Weaker Section (EWS)</option>
                    <option value="Minority">Minority community</option>
                    <option value="Person with Disability">Person with disability</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Annual Family Income
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                      ₹
                    </span>

                    <input
                      type="number"
                      name="familyIncome" min="0"
                      value={formData.familyIncome}
                      onChange={handleChange}
                      placeholder="e.g. 200000"
                      className="w-full h-13 pl-9 pr-4 border border-[#dadddf] rounded-xl outline-none focus:border-[#6868e5]"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold mb-2">
                    Domicile State
                  </label>

                  <input
                    type="text"
                    name="domicileState"
                    value={formData.domicileState}
                    onChange={handleChange}
                    placeholder="Enter domicile state"
                    className="w-full h-13 px-4 border border-[#dadddf] rounded-xl outline-none focus:border-[#6868e5]"
                  />
                </div>
              </div>

              <div className="mt-6 bg-[#eeeeff] border border-[#dedefc] rounded-xl p-4">
                <p className="text-sm font-semibold text-[#35358f]">
                  How this information will be used
                </p>

                <p className="text-sm text-[#4040a7] mt-2 leading-6">
                  ScholarConnect AI will compare your category, education,
                  income, state and academic details with scholarship rules to
                  generate explainable eligibility matches.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-[#eeeeff] rounded-xl flex items-center justify-center">
                  <FileText
                    size={21}
                    className="text-[#5151c7]"
                  />
                </div>

                <div>
                  <h3 className="font-bold text-xl">
                    Document Vault
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    Upload once and reuse documents across eligible scholarships.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mt-7">
                {[
                  {
                    name: "categoryCertificate",
                    label: "Category Certificate",
                  },
                  {
                    name: "incomeCertificate",
                    label: "Income Certificate",
                  },
                  {
                    name: "marksheet",
                    label: "Latest Marksheet",
                  },
                  {
                    name: "admissionProof",
                    label: "Admission Proof",
                  },
                ].map((document) => (
                  <div
                    key={document.name}
                    className="border border-[#dadddf] rounded-2xl p-4"
                  >
                    <p className="font-semibold text-sm">
                      {document.label}
                    </p>

                    <input
                      type="file"
                      name={document.name}
                      onChange={handleFile}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="mt-4 block w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-[#eeeeff] file:text-[#5151c7] file:font-semibold"
                    />

                    {formData[document.name] && (
                      <p className="text-xs text-emerald-700 mt-3">
                        ✓ {formData[document.name].name}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                <p className="text-sm font-semibold text-emerald-900">
                  Reusable Document Vault
                </p>

                <p className="text-sm text-emerald-800 mt-2 leading-6">
                  These documents will be stored securely and linked to
                  multiple scholarship applications instead of being uploaded
                  repeatedly.
                </p>
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div>
              <h3 className="font-bold text-2xl">
                Review Your Profile
              </h3>

              <p className="text-sm text-slate-500 mt-2">
                Confirm the information before completing your profile.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mt-7">
                {[
                  ["Full Name", formData.fullName || "Not provided"],
                  ["State", formData.state || "Not provided"],
                  ["Education", formData.educationLevel || "Not provided"],
                  ["Course", formData.course || "Not provided"],
                  ["Year", formData.yearOfStudy || "Not provided"],
                  [
                    "Percentage",
                    formData.percentage
                      ? `${formData.percentage}%`
                      : "Not provided",
                  ],
                  ["Category", formData.category],
                  [
                    "Family Income",
                    formData.familyIncome
                      ? `₹${formData.familyIncome}`
                      : "Not provided",
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="bg-[#f4f5f1] rounded-xl p-4"
                  >
                    <p className="text-xs text-slate-500">
                      {label}
                    </p>

                    <p className="font-semibold mt-1">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 border border-[#dadddf] rounded-2xl p-5">
                <p className="font-semibold">
                  Documents Selected
                </p>

                <div className="space-y-3 mt-4 text-sm">
                  {[
                    ["Category Certificate", formData.categoryCertificate],
                    ["Income Certificate", formData.incomeCertificate],
                    ["Latest Marksheet", formData.marksheet],
                    ["Admission Proof", formData.admissionProof],
                  ].map(([label, file]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="text-slate-600">
                        {label}
                      </span>

                      <span
                        className={
                          file
                            ? "text-emerald-700 font-semibold"
                            : "text-amber-700 font-semibold"
                        }
                      >
                        {file ? "Ready" : "Missing"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={save} disabled={busy || loading}
                className="mt-7 w-full bg-[#5b5bd6] hover:bg-[#4646ba] text-white py-3.5 rounded-xl font-semibold transition"
              >
                {busy ? "Saving…" : profileComplete ? "Save profile changes" : "Complete Profile"}
              </button>

              <p className="text-xs text-slate-400 text-center mt-3">
                {profileComplete
                  ? "Your profile and selected documents are saved securely when you save your changes."
                  : "Your profile and selected documents are saved securely when you complete this step."}
              </p>
            </div>
          )}

          {/* NAV BUTTONS */}
          <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={previousStep}
              disabled={step === 1}
              className={`px-5 py-3 rounded-xl font-semibold text-sm ${
                step === 1
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "border border-[#dadddf] bg-[#fffdf8] text-slate-700 hover:bg-[#f4f5f1]"
              }`}
            >
              Previous
            </button>

            {step < totalSteps && (
              <button
                type="button"
                onClick={nextStep}
                className="bg-[#5b5bd6] hover:bg-[#4646ba] text-white px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition"
              >
                Continue
                <ArrowRight size={17} />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileSetup;