begin;

alter table public.scholarships drop constraint scholarships_required_documents_check;
alter table public.scholarships add constraint scholarships_required_documents_check
 check(required_documents <@ array['Category Certificate','ST Certificate','Income Certificate','Marksheet','Admission Proof','Identity Proof','Bank Details','Domicile Document','Gap Certificate','Ration Card','Passport-size Photograph']);

alter table public.documents drop constraint documents_kind_check;
alter table public.documents add constraint documents_kind_check
 check(kind in ('Category Certificate','ST Certificate','Income Certificate','Marksheet','Admission Proof','Identity Proof','Bank Details','Domicile Document','Gap Certificate','Ration Card','Passport-size Photograph'));

commit;
