begin;
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 role text not null check(role in ('student','provider')),
 full_name text not null default '', phone text not null default '',
 created_at timestamptz not null default now()
);
create table public.student_profiles (
 id uuid primary key references public.profiles(id) on delete cascade,
 full_name text not null default '', date_of_birth date,
 gender text not null default '', state text not null default '', district text not null default '',
 education_level text not null default '', course text not null default '', year_of_study text not null default '',
 institution text not null default '', percentage numeric check(percentage between 0 and 100),
 category text not null default '', family_income numeric check(family_income >= 0),
 domicile_state text not null default '', updated_at timestamptz not null default now()
);
create table public.provider_profiles (
 id uuid primary key references public.profiles(id) on delete cascade,
 organization_name text not null default '', website text not null default '', description text not null default '',
 updated_at timestamptz not null default now()
);
create function public.create_account() returns trigger language plpgsql security definer set search_path = '' as $$
begin
 if coalesce(new.raw_user_meta_data->>'role','student') not in ('student','provider') then raise exception 'Invalid account role'; end if;
 insert into public.profiles(id,role,full_name,phone) values(new.id,coalesce(new.raw_user_meta_data->>'role','student'),coalesce(new.raw_user_meta_data->>'full_name',''),coalesce(new.raw_user_meta_data->>'phone',''));
 if coalesce(new.raw_user_meta_data->>'role','student') = 'student' then
 insert into public.student_profiles(id,full_name) values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''));
 else insert into public.provider_profiles(id,organization_name) values(new.id,coalesce(new.raw_user_meta_data->>'organization_name','')); end if;
 return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.create_account();
create table public.scholarships (
 id uuid primary key default gen_random_uuid(), provider_id uuid not null references public.provider_profiles(id),
 display_name text not null check(length(trim(display_name)) between 3 and 200), official_name text not null default '',
 provider text not null, provider_type text not null default 'NGO', education_level text not null default 'All',
 stream text not null default '', location text not null default 'India', amount text not null default '',
 description text not null default '', deadline timestamptz not null,
 status text not null default 'draft' check(status in ('draft','published','closed')),
 verified boolean not null default false,
 eligibility text[] not null default '{}', required_documents text[] not null default '{}', tags text[] not null default '{}',
 categories text[] not null default '{}', education_levels text[] not null default '{}', states text[] not null default '{}',
 max_income numeric check(max_income >= 0), min_percentage numeric check(min_percentage between 0 and 100),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(required_documents <@ array['Category Certificate','ST Certificate','Income Certificate','Marksheet','Admission Proof','Identity Proof','Bank Details','Domicile Document','Gap Certificate','Ration Card','Passport-size Photograph'])
);
create table public.documents (
 id uuid primary key default gen_random_uuid(), student_id uuid not null references public.student_profiles(id),
 kind text not null check(kind in ('Category Certificate','ST Certificate','Income Certificate','Marksheet','Admission Proof','Identity Proof','Bank Details','Domicile Document','Gap Certificate','Ration Card','Passport-size Photograph')),
 name text not null, path text not null unique, mime_type text not null check(mime_type in ('application/pdf','image/jpeg','image/png')),
 size_bytes integer not null check(size_bytes > 0 and size_bytes <= 10485760), created_at timestamptz not null default now(),
 check(split_part(path,'/',1) = student_id::text)
);
create table public.applications (
 id uuid primary key default gen_random_uuid(), student_id uuid not null references public.student_profiles(id),
 scholarship_id uuid not null references public.scholarships(id),
 status text not null default 'submitted' check(status in ('submitted','under_review','approved','rejected','withdrawn')),
 profile_snapshot jsonb not null, scholarship_snapshot jsonb not null,
 reviewer_note text not null default '', submitted_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(student_id,scholarship_id)
);
create table public.application_documents (
 application_id uuid not null references public.applications(id) on delete cascade,
 document_id uuid not null references public.documents(id), primary key(application_id,document_id)
);
create table public.application_events (
 id uuid primary key default gen_random_uuid(), application_id uuid not null references public.applications(id) on delete cascade,
 actor_id uuid not null references public.profiles(id), status text not null, note text not null default '', created_at timestamptz not null default now()
);
create index scholarships_provider_idx on public.scholarships(provider_id);
create index scholarships_catalog_idx on public.scholarships(status,deadline);
create index documents_student_idx on public.documents(student_id);
create index applications_scholarship_idx on public.applications(scholarship_id);
create index application_documents_document_idx on public.application_documents(document_id);
create index application_events_application_idx on public.application_events(application_id);
create function public.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$ begin new.updated_at = now(); return new; end; $$;
create trigger student_touch before update on public.student_profiles for each row execute function public.touch_updated_at();
create trigger provider_touch before update on public.provider_profiles for each row execute function public.touch_updated_at();
create trigger scholarship_touch before update on public.scholarships for each row execute function public.touch_updated_at();
create trigger application_touch before update on public.applications for each row execute function public.touch_updated_at();
-- Server-side matching: no client-provided score or eligibility decision is trusted.
create function public.normalize_category(p_category text) returns text
language sql immutable set search_path = '' as $$
 select case lower(trim(coalesce(p_category,'')))
  when 'sc' then 'scheduled caste'
  when 'scheduled caste' then 'scheduled caste'
  when 'scheduled castes' then 'scheduled caste'
  when 'st' then 'scheduled tribe'
  when 'scheduled tribe' then 'scheduled tribe'
  when 'scheduled tribes' then 'scheduled tribe'
  when 'obc' then 'obc'
  when 'other backward class' then 'obc'
  when 'other backward classes' then 'obc'
  when 'other backward class (obc)' then 'obc'
  when 'ebc' then 'ebc'
  when 'economically backward class' then 'ebc'
  when 'ews' then 'ews'
  when 'economically weaker section' then 'ews'
  when 'sbc' then 'sbc'
  when 'special backward class' then 'sbc'
  when 'vjnt' then 'vjnt'
  when 'vj/nt' then 'vjnt'
  when 'nt' then 'vjnt'
  when 'general' then 'general/open'
  when 'open' then 'general/open'
  when 'general/open' then 'general/open'
  when 'open category' then 'general/open'
  else lower(trim(coalesce(p_category,'')))
 end;
$$;
create function public.inferred_scholarship_categories(
 p_categories text[], p_display_name text, p_official_name text, p_description text,
 p_tags text[], p_eligibility text[], p_required_documents text[]
) returns text[]
language sql immutable set search_path = '' as $$
 with source as (
  select lower(concat_ws(' ',p_display_name,p_official_name,p_description,
   array_to_string(p_tags,' '),array_to_string(p_eligibility,' '),
   array_to_string(p_required_documents,' '))) as text
 ), inferred as (
  select array_remove(array[
   case when text ~ '(^|[^a-z])(scheduled[ -]caste|sc)([^a-z]|$)' then 'Scheduled Caste' end,
   case when text ~ '(^|[^a-z])(scheduled[ -]tribe|st)([^a-z]|$)' then 'Scheduled Tribe' end,
   case when text ~ '(^|[^a-z])(other backward classes?|obc)([^a-z]|$)' then 'OBC' end,
   case when text ~ '(^|[^a-z])(economically backward class|ebc)([^a-z]|$)' then 'EBC' end,
   case when text ~ '(^|[^a-z])(economically weaker section|ews)([^a-z]|$)' then 'EWS' end,
   case when text ~ '(^|[^a-z])(special backward class|sbc)([^a-z]|$)' then 'SBC' end,
   case when text ~ '(^|[^a-z])(vimukta jati|nomadic tribes?|vjnt|vj/nt)([^a-z]|$)' then 'VJNT' end,
   case when text ~ '(^|[^a-z])(minority|minorities)([^a-z]|$)' then 'Minority' end,
   case when text ~ '(^|[^a-z])(persons? with disabilit(y|ies)|pwd|divyang)([^a-z]|$)' then 'Person with disability' end
  ],null) as inferred
  from source
 )
 select case when cardinality(coalesce(p_categories,'{}'))>0 then p_categories else inferred end
 from inferred;
$$;
create function public.match_scholarships() returns table(scholarship_id uuid, score integer, eligible boolean, reasons text[])
language sql stable security definer set search_path = '' as $$
 with checks as (
 select s.id, array_remove(array[
 case when p.full_name = '' or p.education_level = '' or p.domicile_state = '' or p.category = '' or p.family_income is null or p.percentage is null then 'Complete your student profile' end,
 case when cardinality(public.inferred_scholarship_categories(s.categories,s.display_name,s.official_name,s.description,s.tags,s.eligibility,s.required_documents))>0
  and not exists(select 1 from unnest(public.inferred_scholarship_categories(s.categories,s.display_name,s.official_name,s.description,s.tags,s.eligibility,s.required_documents)) c
   where public.normalize_category(c)=public.normalize_category(p.category))
 then 'Category does not match' end,
 case when cardinality(s.education_levels)>0 and not p.education_level = any(s.education_levels) then 'Education level does not match' end,
 case when cardinality(s.states)>0 and not exists(select 1 from unnest(s.states) st where lower(trim(st)) = lower(trim(p.domicile_state))) then 'Domicile state does not match' end,
 case when s.max_income is not null and (p.family_income is null or p.family_income>s.max_income) then 'Family income exceeds the limit or is missing' end,
 case when s.min_percentage is not null and (p.percentage is null or p.percentage<s.min_percentage) then 'Academic percentage is below the minimum or is missing' end
 ],null) failures
 from public.scholarships s cross join public.student_profiles p
 where p.id = auth.uid() and s.status='published' and s.deadline > now()
 ) select id, greatest(0,100-cardinality(failures)*20), cardinality(failures)=0,
 case when cardinality(failures)=0 then array['All configured eligibility rules met; provider review is still required'] else failures end from checks;
$$;
create function public.submit_application(p_scholarship_id uuid, p_document_ids uuid[]) returns uuid
language plpgsql security definer set search_path = '' as $$
declare s public.scholarships; p public.student_profiles; app_id uuid; required_kind text;
begin
 select * into s from public.scholarships where id=p_scholarship_id for update;
 if not found or s.status <> 'published' or s.deadline<=now() then raise exception 'This scholarship is not accepting applications'; end if;
 select * into p from public.student_profiles where id=auth.uid() for update;
 if not found then raise exception 'A student account is required'; end if;
 if not exists(select 1 from public.match_scholarships() m where m.scholarship_id=s.id and m.eligible) then raise exception 'Complete your profile and meet the eligibility rules before applying'; end if;
 if cardinality(p_document_ids) is null then raise exception 'Document selection is required'; end if;
 -- Lock attachments against concurrent removal while the submission is committed.
 perform 1 from public.documents where id=any(p_document_ids) for update;
 if exists(select 1 from unnest(p_document_ids) d where not exists(select 1 from public.documents v where v.id=d and v.student_id=auth.uid())) then raise exception 'Invalid document selection'; end if;
 foreach required_kind in array s.required_documents loop
 if not exists(select 1 from public.documents d join storage.objects o on o.bucket_id='student-documents' and o.name=d.path where d.id=any(p_document_ids) and d.student_id=auth.uid() and d.kind=required_kind) then raise exception 'Missing document: %',required_kind; end if;
 end loop;
 insert into public.applications(student_id,scholarship_id,profile_snapshot,scholarship_snapshot) values(auth.uid(),s.id,to_jsonb(p)-'id',to_jsonb(s)) returning id into app_id;
 insert into public.application_documents select app_id,d from (select distinct unnest(p_document_ids) d) selected;
 insert into public.application_events(application_id,actor_id,status) values(app_id,auth.uid(),'submitted');
 return app_id;
end; $$;
create function public.change_application_status(p_application_id uuid,p_status text,p_note text default '') returns void
language plpgsql security definer set search_path = '' as $$
declare a public.applications; owner_id uuid;
begin
 select * into a from public.applications where id=p_application_id for update;
 if not found then raise exception 'Application not found'; end if;
 select provider_id into owner_id from public.scholarships where id=a.scholarship_id;
 if auth.uid()=a.student_id and p_status='withdrawn' and a.status in ('submitted','under_review') then null;
 elsif auth.uid()=owner_id and ((a.status='submitted' and p_status='under_review') or (a.status='under_review' and p_status in ('approved','rejected'))) then null;
 else raise exception 'Status change is not permitted'; end if;
 if length(p_note)>2000 then raise exception 'Note is too long'; end if;
 update public.applications set status=p_status,reviewer_note=case when auth.uid()=owner_id then coalesce(p_note,'') else reviewer_note end where id=a.id;
 insert into public.application_events(application_id,actor_id,status,note) values(a.id,auth.uid(),p_status,coalesce(p_note,''));
end; $$;
-- RLS is the authority; route guards only improve navigation.
alter table public.profiles enable row level security;
alter table public.student_profiles enable row level security;
alter table public.provider_profiles enable row level security;
alter table public.scholarships enable row level security;
alter table public.documents enable row level security;
alter table public.applications enable row level security;
alter table public.application_documents enable row level security;
alter table public.application_events enable row level security;
create policy own_profile on public.profiles for select to authenticated using(id=auth.uid());
create policy edit_profile on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy own_student on public.student_profiles for select to authenticated using(id=auth.uid());
create policy edit_student on public.student_profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy own_provider on public.provider_profiles for select to authenticated using(id=auth.uid());
create policy edit_provider on public.provider_profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create function public.has_applied(target uuid) returns boolean language sql stable security definer set search_path = '' as $$ select exists(select 1 from public.applications where scholarship_id=target and student_id=auth.uid()); $$;
create policy catalog on public.scholarships for select to anon,authenticated using(status='published' or provider_id=auth.uid() or public.has_applied(scholarships.id));
-- Avoid recursive applications->scholarships->applications policies with a narrowly scoped ownership helper.
create function public.owns_scholarship(target uuid) returns boolean language sql stable security definer set search_path = '' as $$ select exists(select 1 from public.scholarships where id=target and provider_id=auth.uid()); $$;
create policy create_scholarship on public.scholarships for insert to authenticated with check(provider_id=auth.uid() and exists(select 1 from public.provider_profiles where id=auth.uid()) and verified=false);
create policy edit_scholarship on public.scholarships for update to authenticated using(provider_id=auth.uid()) with check(provider_id=auth.uid());
create policy remove_scholarship on public.scholarships for delete to authenticated using(provider_id=auth.uid() and status='draft');
create policy view_application on public.applications for select to authenticated using(student_id=auth.uid() or public.owns_scholarship(scholarship_id));
create policy view_attachments on public.application_documents for select to authenticated using(exists(select 1 from public.applications a where a.id=application_id));
create policy view_events on public.application_events for select to authenticated using(exists(select 1 from public.applications a where a.id=application_id));
create policy view_document on public.documents for select to authenticated using(student_id=auth.uid() or exists(select 1 from public.application_documents ad join public.applications a on a.id=ad.application_id where ad.document_id=documents.id and a.status<>'withdrawn' and public.owns_scholarship(a.scholarship_id)));
create function public.owned_vault_object(target text) returns boolean language sql stable security definer set search_path = '' as $$ select split_part(target,'/',1)=auth.uid()::text and exists(select 1 from storage.objects where bucket_id='student-documents' and name=target); $$;
create policy create_document on public.documents for insert to authenticated with check(student_id=auth.uid() and public.owned_vault_object(documents.path));
create policy remove_document on public.documents for delete to authenticated using(student_id=auth.uid() and not exists(select 1 from public.application_documents ad where ad.document_id=documents.id));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('student-documents','student-documents',false,10485760,array['application/pdf','image/jpeg','image/png']);
create policy upload_vault on storage.objects for insert to authenticated with check(bucket_id='student-documents' and (storage.foldername(name))[1]=auth.uid()::text and exists(select 1 from public.student_profiles where id=auth.uid()));
create policy read_vault on storage.objects for select to authenticated using(bucket_id='student-documents' and ((storage.foldername(name))[1]=auth.uid()::text or exists(select 1 from public.documents d join public.application_documents ad on ad.document_id=d.id join public.applications a on a.id=ad.application_id where d.path=storage.objects.name and a.status<>'withdrawn' and public.owns_scholarship(a.scholarship_id))));
create policy delete_vault on storage.objects for delete to authenticated using(bucket_id='student-documents' and (storage.foldername(name))[1]=auth.uid()::text and not exists(select 1 from public.documents d where d.path=storage.objects.name));
-- Explicit column grants prevent role changes, ownership reassignment and self-verification.
revoke all on public.profiles,public.student_profiles,public.provider_profiles,public.scholarships,public.documents,public.applications,public.application_documents,public.application_events from anon,authenticated;
grant select on public.scholarships to anon,authenticated;
grant select on public.profiles,public.student_profiles,public.provider_profiles,public.documents,public.applications,public.application_documents,public.application_events to authenticated;
grant update(full_name,phone) on public.profiles to authenticated;
grant update(full_name,date_of_birth,gender,state,district,education_level,course,year_of_study,institution,percentage,category,family_income,domicile_state) on public.student_profiles to authenticated;
grant update(organization_name,website,description) on public.provider_profiles to authenticated;
grant insert(provider_id,display_name,official_name,provider,provider_type,education_level,stream,location,amount,description,deadline,status,eligibility,required_documents,tags,categories,education_levels,states,max_income,min_percentage), update(display_name,official_name,provider,provider_type,education_level,stream,location,amount,description,deadline,status,eligibility,required_documents,tags,categories,education_levels,states,max_income,min_percentage) on public.scholarships to authenticated;
grant delete on public.scholarships to authenticated;
grant insert(student_id,kind,name,path,mime_type,size_bytes),delete on public.documents to authenticated;
revoke all on function public.create_account(),public.touch_updated_at(),public.normalize_category(text),public.inferred_scholarship_categories(text[],text,text,text,text[],text[],text[]),public.match_scholarships(),public.submit_application(uuid,uuid[]),public.change_application_status(uuid,text,text),public.owns_scholarship(uuid),public.has_applied(uuid),public.owned_vault_object(text) from public,anon,authenticated;
grant execute on function public.match_scholarships(),public.submit_application(uuid,uuid[]),public.change_application_status(uuid,text,text),public.owns_scholarship(uuid),public.owned_vault_object(text) to authenticated;
grant execute on function public.has_applied(uuid) to anon,authenticated;
commit;
