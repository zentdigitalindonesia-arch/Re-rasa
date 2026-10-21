-- Read-only verification. Run after 00-setup.sql.
select 'jumlah_instrumen' as pemeriksaan, count(*)::text as hasil from public.rerasa_instruments
union all
select 'jumlah_terjemahan', count(*)::text from public.rerasa_translations
union all
select 'tabel_dengan_rls', count(*)::text from pg_class c join pg_namespace n on n.oid=c.relnamespace
 where n.nspname='public' and c.relname in ('rerasa_guests','rerasa_instruments','rerasa_translations') and c.relrowsecurity
union all
select 'anon_bisa_baca_tamu_harus_false', has_table_privilege('anon','public.rerasa_guests','SELECT')::text
union all
select 'authenticated_bisa_baca_tamu_harus_false', has_table_privilege('authenticated','public.rerasa_guests','SELECT')::text
union all
select 'bucket_media_publik', coalesce((select public::text from storage.buckets where id='rerasa-media'),'tidak ditemukan');
-- Expected fresh setup: 9 instruments, 85 translations, 3 RLS tables, false, false, true.
