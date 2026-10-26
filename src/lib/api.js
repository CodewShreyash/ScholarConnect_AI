import { client, unwrap } from './supabase';
import { documentKinds } from './documentTypes';
export { documentKinds } from './documentTypes';
export const profileFields = {fullName:'full_name',dateOfBirth:'date_of_birth',gender:'gender',state:'state',district:'district',educationLevel:'education_level',course:'course',yearOfStudy:'year_of_study',institution:'institution',percentage:'percentage',category:'category',familyIncome:'family_income',domicileState:'domicile_state'};
export function profileToForm(row) { return Object.fromEntries(Object.entries(profileFields).map(([k,v])=>[k,row?.[v] ?? ''])); }
export function profileToRow(form) { return Object.fromEntries(Object.entries(profileFields).map(([k,v])=>[v,['percentage','familyIncome'].includes(k) ? (form[k] === '' ? null : Number(form[k])) : k==='dateOfBirth' ? form[k] || null : (form[k] || '').trim()])); }
export function isStudentProfileComplete(profile) {
  return Boolean(
    profile?.full_name?.trim()
    && profile?.education_level?.trim()
    && profile?.domicile_state?.trim()
    && profile?.category?.trim()
    && profile?.family_income !== null
    && profile?.family_income !== undefined
    && profile?.percentage !== null
    && profile?.percentage !== undefined
  );
}
export function validateProfile(form) {
  for (const key of ['fullName','educationLevel','domicileState','category']) if (!form[key]?.trim()) throw new Error('Please complete name, education, category and domicile state.');
  if (form.percentage === '' || !Number.isFinite(Number(form.percentage)) || Number(form.percentage)<0 || Number(form.percentage)>100) throw new Error('Enter an academic percentage between 0 and 100.');
  if (form.familyIncome === '' || !Number.isFinite(Number(form.familyIncome)) || Number(form.familyIncome)<0) throw new Error('Enter a valid annual family income.');
  if (form.dateOfBirth && new Date(form.dateOfBirth)>new Date()) throw new Error('Date of birth cannot be in the future.');
}
export async function loadStudent(id) { return unwrap(await client().from('student_profiles').select('*').eq('id',id).single()); }
export async function saveStudent(id,form) { validateProfile(form); return unwrap(await client().from('student_profiles').update(profileToRow(form)).eq('id',id).select().single()); }
export async function listDocuments(id) { return unwrap(await client().from('documents').select('*').eq('student_id',id).order('created_at',{ascending:false})); }
export function validateFile(file) {
 if (!['application/pdf','image/jpeg','image/png'].includes(file.type)) throw new Error('Choose a PDF, JPG or PNG file.');
 if (!file.size || file.size>10*1024*1024) throw new Error('Files must be nonempty and no larger than 10 MB.');
}
export async function uploadDocument(id,kind,file) {
 validateFile(file);
 const extension = {'application/pdf':'pdf','image/jpeg':'jpg','image/png':'png'}[file.type];
 const path = `${id}/${crypto.randomUUID()}.${extension}`;
 unwrap(await client().storage.from('student-documents').upload(path,file,{contentType:file.type,upsert:false}));
 const result = await client().from('documents').insert({student_id:id,kind,name:file.name,path,mime_type:file.type,size_bytes:file.size}).select().single();
 if (result.error) { await client().storage.from('student-documents').remove([path]); throw result.error; }
 return result.data;
}
export async function deleteDocument(doc) {
 const deleted=unwrap(await client().from('documents').delete().eq('id',doc.id).select('id'));
 if (!deleted.length) throw new Error('This document is attached to an application and cannot be deleted.');
 unwrap(await client().storage.from('student-documents').remove([doc.path]));
}
export async function documentUrl(path) { return unwrap(await client().storage.from('student-documents').createSignedUrl(path,60)).signedUrl; }
export function scholarshipView(row, match) {
 return {...row, deadlineAt:row.deadline, displayName:row.display_name,officialName:row.official_name,providerType:row.provider_type,educationLevel:row.education_level,
 requiredDocuments:row.required_documents,match:match?.score ?? null,eligible:match?.eligible ?? false,reasons:match?.reasons || [],lastVerified:row.verified ? 'provider review' : 'Not verified', deadline:new Date(row.deadline).toLocaleString()};
}
export async function listScholarships(isStudent=false) {
 const [rows,matches] = await Promise.all([
 client().from('scholarships').select('*').eq('status','published').order('deadline'),
 isStudent ? client().rpc('match_scholarships') : Promise.resolve({data:[],error:null}),
 ]);
 const mapped=new Map(unwrap(matches).map(m=>[m.scholarship_id,m]));
 return unwrap(rows).map(s=>scholarshipView(s,mapped.get(s.id)));
}
export async function getScholarship(id,isStudent=false) {
 const [row,matches] = await Promise.all([client().from('scholarships').select('*').eq('id',id).maybeSingle(),isStudent ? client().rpc('match_scholarships') : Promise.resolve({data:[],error:null})]);
 const data=unwrap(row), match=unwrap(matches).find(m=>m.scholarship_id===id);
 return data ? scholarshipView(data,match) : null;
}
export async function apply(scholarship,documents) {
 // Only share one current version of each required document, never the whole vault.
 const selected=scholarship.requiredDocuments.map(kind=>documents.find(d=>d.kind===kind)?.id).filter(Boolean);
 return unwrap(await client().rpc('submit_application',{p_scholarship_id:scholarship.id,p_document_ids:selected}));
}
export async function applications() { return unwrap(await client().from('applications').select('*,scholarships(display_name),application_documents(document_id,documents(*)),application_events(*)').order('submitted_at',{ascending:false})); }
export async function changeStatus(id,status,note='') { unwrap(await client().rpc('change_application_status',{p_application_id:id,p_status:status,p_note:note})); }
