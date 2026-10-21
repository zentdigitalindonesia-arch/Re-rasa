-- Run in the Supabase SQL Editor as the project owner. No visitor data is included.
begin;
create table if not exists public.rerasa_guests (
 code text primary key,
 name text not null check (length(name) between 1 and 100),
 contact text not null check (length(contact) between 1 and 120),
 city text not null check (length(city) between 1 and 100),
 type text not null check (type in ('individu','instansi','pelajar','komunitas','lainnya')),
 affiliation text not null default '',
 created_at timestamptz not null default now(),
 request_id text not null unique
);
create index if not exists rerasa_guests_created on public.rerasa_guests(created_at desc);
create table if not exists public.rerasa_instruments (
 id text primary key,
 content jsonb not null,
 version integer not null default 1 check (version > 0),
 updated_at timestamptz not null default now()
);
create table if not exists public.rerasa_translations (
 hash text primary key,
 source text not null,
 translated text not null,
 created_at timestamptz not null default now()
);
alter table public.rerasa_guests enable row level security;
alter table public.rerasa_instruments enable row level security;
alter table public.rerasa_translations enable row level security;
revoke all on public.rerasa_guests, public.rerasa_instruments, public.rerasa_translations from anon, authenticated;
grant select,insert,update,delete on public.rerasa_guests, public.rerasa_instruments, public.rerasa_translations to service_role;

create or replace function public.rerasa_register_guest(
 p_code text,p_name text,p_contact text,p_city text,p_type text,p_affiliation text,p_request_id text
) returns setof public.rerasa_guests language sql security invoker set search_path='' as $$
 insert into public.rerasa_guests(code,name,contact,city,type,affiliation,request_id)
 values (p_code,p_name,p_contact,p_city,p_type,p_affiliation,p_request_id)
 on conflict (request_id) do update set request_id=excluded.request_id
 returning *;
$$;
revoke all on function public.rerasa_register_guest(text,text,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.rerasa_register_guest(text,text,text,text,text,text,text) to service_role;

create or replace function public.rerasa_save_instrument(p_id text,p_content jsonb,p_expected_version integer)
returns setof public.rerasa_instruments language plpgsql security invoker set search_path='' as $$
declare saved public.rerasa_instruments;
begin
 if p_expected_version is null then
  insert into public.rerasa_instruments(id,content) values(p_id,p_content)
  on conflict(id) do nothing returning * into saved;
 else
  update public.rerasa_instruments set content=p_content,version=version+1,updated_at=now()
  where id=p_id and version=p_expected_version returning * into saved;
 end if;
 if not found then raise exception 'Version conflict' using errcode='40001'; end if;
 return next saved;
end;
$$;
revoke all on function public.rerasa_save_instrument(text,jsonb,integer) from public,anon,authenticated;
grant execute on function public.rerasa_save_instrument(text,jsonb,integer) to service_role;

-- Public downloads are for exhibition media only. Do not put contact lists or backups in this bucket.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('rerasa-media','rerasa-media',true,52428800,
 array['image/jpeg','image/png','image/webp','audio/mpeg','audio/wav','audio/ogg','video/mp4','video/webm','model/gltf-binary','application/octet-stream'])
on conflict(id) do nothing;
-- No anonymous upload or table policies are added. Server-authorized signed upload URLs are used.
commit;
