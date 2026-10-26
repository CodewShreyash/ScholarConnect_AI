import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
const db=new PGlite();
const s1='11111111-1111-4111-8111-111111111111',s2='22222222-2222-4222-8222-222222222222',p1='33333333-3333-4333-8333-333333333333',p2='44444444-4444-4444-8444-444444444444';
let scholarship,doc,app;
async function as(id,sql,args=[]){await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${id}',false);`);try{return await db.query(sql,args);}finally{await db.exec('reset role');}}
async function denied(id,sql,args=[]){await assert.rejects(as(id,sql,args));}
before(async()=>{
 await db.exec(`create role anon; create role authenticated; create schema auth; create schema storage;
 create table auth.users(id uuid primary key,raw_user_meta_data jsonb);
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
 alter table storage.objects enable row level security;
 create function storage.foldername(name text) returns text[] language sql immutable as $$ select string_to_array(name,'/') $$;
 grant usage on schema public,auth,storage to anon,authenticated; grant execute on function auth.uid(),storage.foldername(text) to anon,authenticated;
 grant select,insert,delete on storage.objects to authenticated;`);
 await db.exec(await readFile(new URL('../supabase/migrations/202609290001_initial.sql',import.meta.url),'utf8'));
 for(const [id,role] of [[s1,'student'],[s2,'student'],[p1,'provider'],[p2,'provider']])await db.query('insert into auth.users values($1,$2)',[id,{role,full_name:'Test User',organization_name:'Test Foundation'}]);
 await db.query("update student_profiles set category='Scheduled Tribe' where id=$1",[s1]);
 await db.exec(await readFile(new URL('../supabase/migrations/202610260001_category_matching.sql',import.meta.url),'utf8'));
 await db.exec(await readFile(new URL('../supabase/migrations/202610260002_document_upload_types.sql',import.meta.url),'utf8'));
});
after(async()=>{await db.close();});
test('signup provisions roles and profiles; cross-account reads and role escalation fail',async()=>{
 assert.equal((await as(s1,'select * from profiles')).rows.length,1);
 assert.equal((await as(s1,'select * from student_profiles')).rows.length,1);
 assert.equal((await as(s1,'select category from student_profiles')).rows[0].category,'');
 assert.equal((await as(p1,'select * from provider_profiles')).rows.length,1);
 await denied(s1,"update profiles set role='provider' where id=$1",[s1]);
 await denied(s1,'insert into provider_profiles(id) values($1)',[s1]);
 assert.equal((await as(s1,"update student_profiles set full_name='Hacked' where id=$1 returning id",[s2])).rows.length,0);
 await db.query("update auth.users set raw_user_meta_data='{}' where id=$1",[s1]);
 assert.equal((await as(s1,'select role from profiles')).rows[0].role,'student');
});
test('provider can create and edit own scholarships; drafts private and verification protected',async()=>{
 scholarship=(await as(p1,`insert into scholarships(provider_id,display_name,provider,deadline,max_income,min_percentage,categories,education_levels,states,required_documents)
 values($1,'Integration Scholarship','Test Foundation',now()+interval '7 days',250000,60,array['Scheduled Tribe'],array['Undergraduate'],array['Maharashtra'],array['Marksheet']) returning id`,[p1])).rows[0].id;
 assert.equal((await as(p2,'select * from scholarships')).rows.length,0);
 assert.equal((await as(s1,'select * from scholarships')).rows.length,0);
 await denied(p1,'update scholarships set verified=true where id=$1',[scholarship]);
 await denied(p1,'update scholarships set provider_id=$1 where id=$2',[p2,scholarship]);
 await denied(s1,"insert into scholarships(provider_id,display_name,provider,deadline) values($1,'Spoof','Spoof',now())",[p1]);
 assert.equal((await as(p2,"update scholarships set status='published' where id=$1 returning id",[scholarship])).rows.length,0);
 await as(p1,"update scholarships set status='published' where id=$1",[scholarship]);
 await db.exec("set role anon; select set_config('request.jwt.claim.sub','',false)");
 try{assert.equal((await db.query('select * from scholarships')).rows.length,1);await assert.rejects(db.query('select * from student_profiles'));}finally{await db.exec('reset role');}
});
test('matching handles incomplete profile, income, marks and case-insensitive domicile',async()=>{
 assert.equal((await as(s1,'select * from match_scholarships()')).rows[0].eligible,false);
 await denied(s1,'select submit_application($1,array[]::uuid[])',[scholarship]);
 await as(s1,"update student_profiles set education_level='Undergraduate',domicile_state='maharashtra',category='Scheduled Tribe',family_income=200000,percentage=75 where id=$1",[s1]);
 let m=(await as(s1,'select * from match_scholarships()')).rows[0];assert.equal(m.eligible,true);assert.equal(m.score,100);
 await as(s1,"update student_profiles set category='OBC' where id=$1",[s1]);
 m=(await as(s1,'select * from match_scholarships() where scholarship_id=$1',[scholarship])).rows[0];
 assert.equal(m.eligible,false);assert.ok(m.reasons.includes('Category does not match'));
 await denied(s1,'select submit_application($1,array[]::uuid[])',[scholarship]);
 await as(p1,"update scholarships set categories='{}',display_name='Post-Matric ST Scholarship',description='Support for Scheduled Tribe students' where id=$1",[scholarship]);
 m=(await as(s1,'select * from match_scholarships() where scholarship_id=$1',[scholarship])).rows[0];
 assert.equal(m.eligible,false);assert.ok(m.reasons.includes('Category does not match'));
 await as(s1,"update student_profiles set category='Scheduled Tribe' where id=$1",[s1]);
 m=(await as(s1,'select * from match_scholarships() where scholarship_id=$1',[scholarship])).rows[0];
 assert.equal(m.eligible,true);
 await as(s1,'update student_profiles set family_income=300000 where id=$1',[s1]);
 assert.equal((await as(s1,'select * from match_scholarships()')).rows[0].eligible,false);
 await denied(s1,'update student_profiles set percentage=120 where id=$1',[s1]);
 await as(s1,'update student_profiles set family_income=200000 where id=$1',[s1]);
});
test('private storage blocks another student and provider; metadata requires a real object',async()=>{
 await denied(s2,"insert into storage.objects(bucket_id,name) values('student-documents',$1)",[s1+'/evil.pdf']);
 await denied(p1,"insert into storage.objects(bucket_id,name) values('student-documents',$1)",[p1+'/evil.pdf']);
 await denied(s1,"insert into documents(student_id,kind,name,path,mime_type,size_bytes) values($1,'Marksheet','x.pdf',$2,'application/pdf',10)",[s1,s1+'/missing.pdf']);
 await as(s1,"insert into storage.objects(bucket_id,name) values('student-documents',$1)",[s1+'/marks.pdf']);
 doc=(await as(s1,"insert into documents(student_id,kind,name,path,mime_type,size_bytes) values($1,'Marksheet','marks.pdf',$2,'application/pdf',10) returning id",[s1,s1+'/marks.pdf'])).rows[0].id;
 assert.equal((await as(s2,'select * from documents')).rows.length,0);
 assert.equal((await as(p1,'select * from storage.objects')).rows.length,0);
 assert.equal((await as(s1,'delete from storage.objects returning id')).rows.length,0);
});
test('submission checks missing and foreign documents, duplicates, immutable snapshots and sharing',async()=>{
 await denied(s1,'select submit_application($1,array[]::uuid[])',[scholarship]);
 await denied(s1,'select submit_application($1,array[$2]::uuid[])',[scholarship,s2]);
 app=(await as(s1,'select submit_application($1,array[$2]::uuid[]) id',[scholarship,doc])).rows[0].id;
 await denied(s1,'select submit_application($1,array[$2]::uuid[])',[scholarship,doc]);
 assert.equal((await as(p1,'select * from applications')).rows.length,1);
 assert.equal((await as(p2,'select * from applications')).rows.length,0);
 assert.equal((await as(s2,'select * from applications')).rows.length,0);
 assert.equal((await as(p1,'select * from student_profiles')).rows.length,0);
 assert.equal((await as(p1,'select * from documents')).rows.length,1);
 assert.equal((await as(p1,'select * from storage.objects')).rows.length,1);
 assert.equal((await as(p2,'select * from storage.objects')).rows.length,0);
 assert.equal((await as(s1,'delete from documents where id=$1 returning id',[doc])).rows.length,0);
 assert.equal((await as(s1,'delete from storage.objects returning id')).rows.length,0);
 await denied(s1,"update applications set status='approved' where id=$1",[app]);
 await denied(s1,"insert into application_documents(application_id,document_id) values($1,$2)",[app,doc]);
 await as(s1,'update student_profiles set percentage=90 where id=$1',[s1]);
 assert.equal((await as(p1,'select profile_snapshot from applications')).rows[0].profile_snapshot.percentage,75);
});
test('review status transitions are authorized, sequential, final and auditable',async()=>{
 await denied(p2,"select change_application_status($1,'under_review','')",[app]);
 await denied(s1,"select change_application_status($1,'approved','')",[app]);
 await denied(p1,"select change_application_status($1,'approved','')",[app]);
 await as(p1,"select change_application_status($1,'under_review','Checking documents')",[app]);
 await as(p1,"select change_application_status($1,'approved','Approved after review')",[app]);
 await denied(p1,"select change_application_status($1,'rejected','')",[app]);
 await denied(s1,"select change_application_status($1,'withdrawn','')",[app]);
 assert.equal((await as(s1,'select * from application_events')).rows.length,3);
 assert.equal((await as(s2,'select * from application_events')).rows.length,0);
});
test('deadline, withdrawal and closed catalog access are enforced',async()=>{
 const second=(await as(p1,"insert into scholarships(provider_id,display_name,provider,deadline,status) values($1,'Second opportunity','Test',now()+interval '1 day','published') returning id",[p1])).rows[0].id;
 const a=(await as(s1,'select submit_application($1,array[]::uuid[]) id',[second])).rows[0].id;
 await as(s1,"select change_application_status($1,'withdrawn','')",[a]);
 await denied(p1,"select change_application_status($1,'under_review','')",[a]);
 await as(p1,"update scholarships set status='closed' where id=$1",[second]);
 assert.equal((await as(s1,'select * from scholarships where id=$1',[second])).rows.length,1);
 assert.equal((await as(s2,'select * from scholarships where id=$1',[second])).rows.length,0);
 await denied(s1,'select submit_application($1,array[]::uuid[])',[second]);
 await as(p1,"update scholarships set deadline=now()-interval '1 day' where id=$1",[scholarship]);
 assert.equal((await as(s1,'select * from match_scholarships()')).rows.length,0);
});
test('withdrawal revokes provider access to attachments; unattached files can be deleted',async()=>{
 const sh=(await as(p1,"insert into scholarships(provider_id,display_name,provider,deadline,status,required_documents) values($1,'Withdrawal scenario','Test',now()+interval '1 day','published',array['Identity Proof']) returning id",[p1])).rows[0].id;
 const path=s1+'/identity.pdf';
 await as(s1,"insert into storage.objects(bucket_id,name) values('student-documents',$1)",[path]);
 const d=(await as(s1,"insert into documents(student_id,kind,name,path,mime_type,size_bytes) values($1,'Identity Proof','identity.pdf',$2,'application/pdf',10) returning id",[s1,path])).rows[0].id;
 const a=(await as(s1,'select submit_application($1,array[$2]::uuid[]) id',[sh,d])).rows[0].id;
 assert.equal((await as(p1,'select * from storage.objects where name=$1',[path])).rows.length,1);
 await as(s1,"select change_application_status($1,'withdrawn','')",[a]);
 assert.equal((await as(p1,'select * from storage.objects where name=$1',[path])).rows.length,0);
 assert.equal((await as(p1,'select * from documents where id=$1',[d])).rows.length,0);
 assert.equal((await as(s1,'delete from documents where id=$1 returning id',[d])).rows.length,0);
 const unused=s1+'/unused.pdf';
 await as(s1,"insert into storage.objects(bucket_id,name) values('student-documents',$1)",[unused]);
 const spare=(await as(s1,"insert into documents(student_id,kind,name,path,mime_type,size_bytes) values($1,'Marksheet','unused.pdf',$2,'application/pdf',10) returning id",[s1,unused])).rows[0].id;
 assert.equal((await as(s1,'delete from documents where id=$1 returning id',[spare])).rows.length,1);
 assert.equal((await as(s1,'delete from storage.objects where name=$1 returning id',[unused])).rows.length,1);
});
test('new Google Doc document types can be stored and used for an application',async()=>{
 const sh=(await as(p1,"insert into scholarships(provider_id,display_name,provider,deadline,status,required_documents) values($1,'Gap document scenario','Test',now()+interval '1 day','published',array['Gap Certificate']) returning id",[p1])).rows[0].id;
 const path=s1+'/gap-certificate.pdf';
 await as(s1,"insert into storage.objects(bucket_id,name) values('student-documents',$1)",[path]);
 const d=(await as(s1,"insert into documents(student_id,kind,name,path,mime_type,size_bytes) values($1,'Gap Certificate','gap-certificate.pdf',$2,'application/pdf',10) returning id",[s1,path])).rows[0].id;
 const a=(await as(s1,'select submit_application($1,array[$2]::uuid[]) id',[sh,d])).rows[0].id;
 assert.equal((await as(s1,'select document_id from application_documents where application_id=$1',[a])).rows[0].document_id,d);
});
