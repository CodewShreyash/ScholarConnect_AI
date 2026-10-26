begin;

alter table public.student_profiles alter column category set default '';
update public.student_profiles set category=''
 where category='Scheduled Tribe';
alter table public.scholarships drop constraint scholarships_required_documents_check;
alter table public.scholarships add constraint scholarships_required_documents_check
 check(required_documents <@ array['Category Certificate','ST Certificate','Income Certificate','Marksheet','Admission Proof','Identity Proof','Bank Details','Domicile Document']);
alter table public.documents drop constraint documents_kind_check;
alter table public.documents add constraint documents_kind_check
 check(kind in ('Category Certificate','ST Certificate','Income Certificate','Marksheet','Admission Proof','Identity Proof','Bank Details','Domicile Document'));

create or replace function public.normalize_category(p_category text) returns text
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

create or replace function public.inferred_scholarship_categories(
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

create or replace function public.match_scholarships() returns table(scholarship_id uuid, score integer, eligible boolean, reasons text[])
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

revoke all on function public.normalize_category(text),public.inferred_scholarship_categories(text[],text,text,text,text[],text[],text[]) from public,anon,authenticated;
commit;
