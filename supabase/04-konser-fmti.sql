-- FMTI 28–29 Oktober 2026 (WITA). Jalankan sekali di SQL Editor Supabase.
-- Tidak mengubah tabel atau data pameran.
begin;
create table if not exists public.rerasa_concert_guests (
 code text primary key check(code ~ '^RC-[A-F0-9]{16}$'), token_hash text not null unique check(token_hash ~ '^[a-f0-9]{64}$'), request_id uuid not null unique,
 name text not null check(length(name) between 1 and 100), contact text not null check(length(contact) between 7 and 30), origin_type text not null check(origin_type in ('indonesia','international')),
 city text not null default '' check(length(city)<=100), country text not null check(length(country) between 1 and 60),
 registered_at timestamptz not null default now(), consent_at timestamptz not null default now(), registration_ip inet, registration_user_agent text not null default '' check(length(registration_user_agent)<=512)
);
create index if not exists rerasa_concert_registered on public.rerasa_concert_guests(registered_at desc);
create table if not exists public.rerasa_concert_scanners (
 id uuid primary key default gen_random_uuid(), token_hash text not null unique check(token_hash ~ '^[a-f0-9]{64}$'), label text not null check(length(label) between 1 and 80), created_by text not null, created_at timestamptz not null default now(), expires_at timestamptz not null default '2026-11-05T16:00:00Z', revoked_at timestamptz
);
create table if not exists public.rerasa_concert_checkins (
 ticket_code text not null references public.rerasa_concert_guests(code), event_date date not null check(event_date in ('2026-10-28','2026-10-29')),
 checked_in_at timestamptz not null default now(), client_scanned_at timestamptz not null, scanner_id uuid not null references public.rerasa_concert_scanners(id), scanner_ip inet, offline boolean not null default false,
 request_id uuid not null unique, primary key(ticket_code,event_date)
);
create table if not exists public.rerasa_concert_scan_events (
 request_id uuid primary key, ticket_code text references public.rerasa_concert_guests(code), event_date date not null,
 status text not null check(status in ('checked_in','already_checked_in','not_found')), server_received_at timestamptz not null default now(),client_scanned_at timestamptz not null,
 scanner_id uuid not null references public.rerasa_concert_scanners(id), scanner_ip inet,offline boolean not null, result jsonb not null
);
alter table public.rerasa_concert_guests enable row level security;
alter table public.rerasa_concert_scanners enable row level security;
alter table public.rerasa_concert_checkins enable row level security;
alter table public.rerasa_concert_scan_events enable row level security;
revoke all on public.rerasa_concert_guests,public.rerasa_concert_scanners,public.rerasa_concert_checkins,public.rerasa_concert_scan_events from public,anon,authenticated;
grant select,insert,update,delete on public.rerasa_concert_guests,public.rerasa_concert_scanners,public.rerasa_concert_checkins,public.rerasa_concert_scan_events to service_role;
create or replace function public.rerasa_register_concert(p_code text,p_token_hash text,p_request_id uuid,p_name text,p_contact text,p_origin_type text,p_city text,p_country text,p_ip inet,p_user_agent text)
returns setof public.rerasa_concert_guests language plpgsql security invoker set search_path='' as $$
begin
 if now() >= '2026-10-29T16:00:00Z'::timestamptz then raise exception 'Registration closed' using errcode='P0001';end if;
 if exists(select 1 from public.rerasa_concert_guests where request_id=p_request_id and token_hash<>p_token_hash) then raise exception 'Request conflict' using errcode='40001';end if;
 return query insert into public.rerasa_concert_guests(code,token_hash,request_id,name,contact,origin_type,city,country,registration_ip,registration_user_agent)
 values(p_code,p_token_hash,p_request_id,p_name,p_contact,p_origin_type,p_city,p_country,p_ip,p_user_agent)
 on conflict(request_id) do update set request_id=excluded.request_id returning *;
end;$$;
create or replace function public.rerasa_checkin_concert(p_token_hash text,p_request_id uuid,p_scanner_id uuid,p_event_date date,p_client_scanned_at timestamptz,p_ip inet,p_offline boolean)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare g public.rerasa_concert_guests; old_event public.rerasa_concert_scan_events; saved public.rerasa_concert_checkins; answer jsonb; current_day date := (now() at time zone 'Asia/Makassar')::date; scan_day date := (p_client_scanned_at at time zone 'Asia/Makassar')::date;
begin
 if not exists(select 1 from public.rerasa_concert_scanners where id=p_scanner_id and revoked_at is null and expires_at>now()) then raise exception 'Scanner access expired' using errcode='42501';end if;
 select * into old_event from public.rerasa_concert_scan_events where request_id=p_request_id;
 if found then if old_event.scanner_id<>p_scanner_id then raise exception 'Request conflict' using errcode='40001';end if; return old_event.result;end if;
 if p_event_date not in ('2026-10-28'::date,'2026-10-29'::date) or scan_day<>p_event_date then raise exception 'Invalid event day' using errcode='22023';end if;
 if p_offline then
  if p_client_scanned_at>now()+interval '5 minutes' or now()>p_client_scanned_at+interval '7 days' then raise exception 'Offline synchronization expired' using errcode='22023';end if;
 elsif p_event_date<>current_day or abs(extract(epoch from now()-p_client_scanned_at))>300 then raise exception 'Check device time and event day' using errcode='22023';end if;
 select * into g from public.rerasa_concert_guests where token_hash=p_token_hash for update;
 if not found then answer=jsonb_build_object('status','not_found','eventDate',p_event_date);
 else
  select * into old_event from public.rerasa_concert_scan_events where request_id=p_request_id; if found then return old_event.result; end if;
  if g.registered_at>p_client_scanned_at+interval '5 minutes' then raise exception 'Scan precedes registration' using errcode='22023';end if;
  insert into public.rerasa_concert_checkins(ticket_code,event_date,client_scanned_at,scanner_id,scanner_ip,offline,request_id)
  values(g.code,p_event_date,p_client_scanned_at,p_scanner_id,p_ip,p_offline,p_request_id)
  on conflict(ticket_code,event_date) do nothing returning * into saved;
  if found then answer=jsonb_build_object('status','checked_in','code',g.code,'name',g.name,'city',g.city,'country',g.country,'eventDate',p_event_date,'checkedInAt',saved.checked_in_at,'offline',p_offline);
  else select * into saved from public.rerasa_concert_checkins where ticket_code=g.code and event_date=p_event_date;
   answer=jsonb_build_object('status','already_checked_in','code',g.code,'name',g.name,'eventDate',p_event_date,'checkedInAt',saved.checked_in_at,'offline',saved.offline);
  end if;
 end if;
 insert into public.rerasa_concert_scan_events(request_id,ticket_code,event_date,status,client_scanned_at,scanner_id,scanner_ip,offline,result)
 values(p_request_id,g.code,p_event_date,answer->>'status',p_client_scanned_at,p_scanner_id,p_ip,p_offline,answer);
 return answer;
end;$$;
create or replace function public.rerasa_concert_stats() returns jsonb language sql security invoker set search_path='' as $$
 select jsonb_build_object('registered',(select count(*) from public.rerasa_concert_guests),'arrivedUnique',(select count(distinct ticket_code) from public.rerasa_concert_checkins),'day1',(select count(*) from public.rerasa_concert_checkins where event_date='2026-10-28'),'day2',(select count(*) from public.rerasa_concert_checkins where event_date='2026-10-29'),'checkins',(select count(*) from public.rerasa_concert_checkins),'scanAttempts',(select count(*) from public.rerasa_concert_scan_events),'duplicates',(select count(*) from public.rerasa_concert_scan_events where status='already_checked_in'));
$$;
create or replace view public.rerasa_concert_attendance with(security_invoker=true) as
 select g.code,g.name,g.contact,g.city,g.country,g.origin_type,g.registered_at,g.registration_ip,
 (select checked_in_at from public.rerasa_concert_checkins where ticket_code=g.code and event_date='2026-10-28') as day1_checked_in_at,
 (select checked_in_at from public.rerasa_concert_checkins where ticket_code=g.code and event_date='2026-10-29') as day2_checked_in_at
 from public.rerasa_concert_guests g;
revoke all on public.rerasa_concert_attendance from public,anon,authenticated;
grant select on public.rerasa_concert_attendance to service_role;
revoke all on function public.rerasa_register_concert(text,text,uuid,text,text,text,text,text,inet,text),public.rerasa_checkin_concert(text,uuid,uuid,date,timestamptz,inet,boolean),public.rerasa_concert_stats() from public,anon,authenticated;
grant execute on function public.rerasa_register_concert(text,text,uuid,text,text,text,text,text,inet,text),public.rerasa_checkin_concert(text,uuid,uuid,date,timestamptz,inet,boolean),public.rerasa_concert_stats() to service_role;
commit;


notify pgrst, 'reload schema';
select 'Tabel konser FMTI siap' as status;
