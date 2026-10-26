-- Tambahan workshop 27 Oktober 2026. Tidak menghapus pendaftar atau data hadir.
begin;
alter table public.rerasa_concert_checkins drop constraint if exists rerasa_concert_checkins_event_date_check;
alter table public.rerasa_concert_checkins add constraint rerasa_concert_checkins_event_date_check check(event_date in ('2026-10-27','2026-10-28','2026-10-29'));
create or replace function public.rerasa_checkin_concert(p_token_hash text,p_request_id uuid,p_scanner_id uuid,p_event_date date,p_client_scanned_at timestamptz,p_ip inet,p_offline boolean)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare g public.rerasa_concert_guests; old_event public.rerasa_concert_scan_events; saved public.rerasa_concert_checkins; answer jsonb; current_day date := (now() at time zone 'Asia/Makassar')::date; scan_day date := (p_client_scanned_at at time zone 'Asia/Makassar')::date;
begin
 if not exists(select 1 from public.rerasa_concert_scanners where id=p_scanner_id and revoked_at is null and expires_at>now()) then raise exception 'Scanner access expired' using errcode='42501';end if;
 select * into old_event from public.rerasa_concert_scan_events where request_id=p_request_id;
 if found then if old_event.scanner_id<>p_scanner_id then raise exception 'Request conflict' using errcode='40001';end if; return old_event.result;end if;
 if p_event_date not in ('2026-10-27'::date,'2026-10-28'::date,'2026-10-29'::date) or scan_day<>p_event_date then raise exception 'Invalid event day' using errcode='22023';end if;
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
 select jsonb_build_object('registered',(select count(*) from public.rerasa_concert_guests),'arrivedUnique',(select count(distinct ticket_code) from public.rerasa_concert_checkins),'workshop',(select count(*) from public.rerasa_concert_checkins where event_date='2026-10-27'),'day1',(select count(*) from public.rerasa_concert_checkins where event_date='2026-10-28'),'day2',(select count(*) from public.rerasa_concert_checkins where event_date='2026-10-29'),'checkins',(select count(*) from public.rerasa_concert_checkins),'scanAttempts',(select count(*) from public.rerasa_concert_scan_events),'duplicates',(select count(*) from public.rerasa_concert_scan_events where status='already_checked_in'));
$$;
create or replace view public.rerasa_concert_attendance with(security_invoker=true) as
 select g.code,g.name,g.contact,g.city,g.country,g.origin_type,g.registered_at,g.registration_ip,
 (select checked_in_at from public.rerasa_concert_checkins where ticket_code=g.code and event_date='2026-10-28') as day1_checked_in_at,
 (select checked_in_at from public.rerasa_concert_checkins where ticket_code=g.code and event_date='2026-10-29') as day2_checked_in_at,
 (select checked_in_at from public.rerasa_concert_checkins where ticket_code=g.code and event_date='2026-10-27') as workshop_checked_in_at
 from public.rerasa_concert_guests g;

commit;
notify pgrst, 'reload schema';
select 'Filter dan kehadiran workshop 27 Oktober siap' as status;
