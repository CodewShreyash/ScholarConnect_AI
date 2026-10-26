export const coreDocumentKinds = [
  'Category Certificate',
  'Income Certificate',
  'Marksheet',
  'Admission Proof',
  'Identity Proof',
  'Bank Details',
  'Domicile Document',
  'Gap Certificate',
  'Ration Card',
  'Passport-size Photograph',
];

export const documentKinds = coreDocumentKinds;

export const documentKindDescriptions = {
  'Category Certificate': 'Caste certificate and validity, when required.',
  'Income Certificate': 'Current financial-year certificate, when required.',
  Marksheet: 'Previous-year academic marksheets.',
  'Admission Proof': 'Current-year fee receipt and bonafide certificate.',
  'Identity Proof': 'Aadhaar card; keep its mobile number active for OTP where needed.',
  'Bank Details': 'Bank passbook; check Aadhaar seeding / NPCI mapping for DBT where required.',
  'Domicile Document': 'Domicile and nationality certificate, when required.',
  'Gap Certificate': 'For a break in formal education, when required.',
  'Ration Card': 'Family-details document, when requested by the scheme.',
  'Passport-size Photograph': 'Recent photo that meets the application form specifications.',
};
