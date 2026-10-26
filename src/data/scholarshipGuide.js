export const scholarshipGuideStages = [
  {
    id: "school",
    title: "Primary & Secondary (Classes 1–10)",
    schemes: [
      {
        name: "Pre-Matric Scholarship for Minorities",
        authority: "Central scheme (NSP)",
        audience: "Students from Muslim, Christian, Sikh, Buddhist, Jain, or Parsi communities.",
        categories: ["Minority"],
      },
      {
        name: "Pre-Matric Scholarship for SC/ST/OBC/VJNT",
        authority: "Maharashtra state scheme (MahaDBT)",
        audience: "Reserved-category students studying in Maharashtra schools.",
        categories: ["Scheduled Caste", "Scheduled Tribe", "OBC", "VJNT"],
      },
      {
        name: "Right to Education (RTE) Scheme",
        authority: "State Education Department",
        audience: "Economically weaker sections seeking admission through the 25% quota.",
        categories: ["EWS"],
      },
    ],
  },
  {
    id: "higher-secondary",
    title: "Higher Secondary (Classes 11 & 12)",
    schemes: [
      {
        name: "Post-Matric Scholarship for SC/ST/OBC/VJNT",
        authority: "Maharashtra state scheme (MahaDBT)",
        audience: "Reserved-category students pursuing Class 11 or 12.",
        categories: ["Scheduled Caste", "Scheduled Tribe", "OBC", "VJNT"],
      },
      {
        name: "Rajarshi Shahu Maharaj Merit Scholarship",
        authority: "Maharashtra state scheme (MahaDBT)",
        audience: "High-achieving SC, SBC, or VJNT students.",
        categories: ["Scheduled Caste", "SBC", "VJNT"],
      },
      {
        name: "Begum Hazrat Mahal National Scholarship",
        authority: "Central scheme (NSP)",
        audience: "Meritorious girl students from minority communities.",
        categories: ["Minority", "Women/Girls"],
      },
    ],
  },
  {
    id: "graduation",
    title: "Graduation (Undergraduate degree)",
    schemes: [
      {
        name: "Rajarshi Chhatrapati Shahu Maharaj EBC Scholarship",
        authority: "Maharashtra state scheme (MahaDBT)",
        audience: "EBC students in professional or non-professional courses.",
        categories: ["EBC"],
      },
      {
        name: "Central Sector Scheme of Scholarships",
        authority: "Central scheme (NSP)",
        audience: "Students meeting the notified Class 12 board-percentile criteria.",
        categories: ["Merit"],
        openToAllCategories: true,
      },
      {
        name: "Dr. Panjabrao Deshmukh Hostel Maintenance Allowance",
        authority: "Maharashtra state scheme (MahaDBT)",
        audience: "Eligible hostel residents who are children of small farmers or registered labourers.",
        categories: ["EBC"],
      },
      {
        name: "AICTE Swanath Scholarship Scheme",
        authority: "Central technical-education scheme",
        audience: "Eligible orphans, children whose parents died of COVID-19, and children of Armed Forces or Paramilitary personnel.",
        categories: ["Special circumstances"],
        openToAllCategories: true,
      },
    ],
  },
  {
    id: "post-graduation",
    title: "Post-Graduation (MCA, MSc, MA, and more)",
    schemes: [
      {
        name: "Government of India Post-Matric Scholarship for PG",
        authority: "Maharashtra state scheme (MahaDBT)",
        audience: "Reserved-category students pursuing postgraduate education.",
        categories: ["Scheduled Caste", "Scheduled Tribe", "OBC", "VJNT"],
      },
      {
        name: "National Scholarship for Post Graduate Studies",
        authority: "Central scheme (NSP)",
        audience: "Eligible first-year postgraduate students.",
        categories: ["Merit"],
        openToAllCategories: true,
      },
      {
        name: "AICTE Pragati Scholarship for Girl Students",
        authority: "Central technical-education scheme",
        audience: "Eligible female students admitted to technical diploma or degree programmes.",
        categories: ["Women/Girls"],
        openToAllCategories: true,
      },
      {
        name: "State Minority Scholarship Part II",
        authority: "Maharashtra state scheme (MahaDBT)",
        audience: "Minority students in postgraduate professional or technical programmes.",
        categories: ["Minority"],
      },
    ],
  },
];

export const scholarshipGuideCategories = [
  "All categories",
  "Scheduled Caste",
  "Scheduled Tribe",
  "OBC",
  "VJNT",
  "SBC",
  "EBC",
  "EWS",
  "General/Open",
  "Minority",
  "Women/Girls",
  "Merit",
  "Special circumstances",
];

export const commonScholarshipDocuments = [
  ["Aadhaar card", "Aadhaar must be active and linked to a mobile number for OTP where required."],
  ["Bank passbook", "Check that the account is Aadhaar-seeded / NPCI-mapped for DBT where required."],
  ["Income certificate", "Current financial year certificate from the competent authority, where required."],
  ["Caste certificate and validity", "For reserved-category schemes that require these documents."],
  ["Domicile and nationality proof", "Use documents accepted by the applicable scheme."],
  ["Previous-year marksheets", "Academic records required for the scheme's qualifying criteria."],
  ["Current fee receipt and bonafide certificate", "Proof of current admission and fee payment, where required."],
  ["Gap certificate", "May be required if there was a break in formal education."],
  ["Ration card", "Keep available if requested for family details."],
  ["Passport-size photograph", "Follow the relevant application form's image requirements."],
];

export function filterScholarshipGuide(stages, stageId, category) {
  const communityCategories = new Set([
    "Scheduled Caste",
    "Scheduled Tribe",
    "OBC",
    "VJNT",
    "SBC",
    "EBC",
    "EWS",
    "General/Open",
    "Minority",
  ]);
  return stages
    .filter(stage => stageId === "all" || stage.id === stageId)
    .map(stage => ({
      ...stage,
      schemes: stage.schemes.filter(scheme =>
        category === "All categories"
        || scheme.categories.includes(category)
        || (communityCategories.has(category) && scheme.openToAllCategories)
      ),
    }))
    .filter(stage => stage.schemes.length > 0);
}
