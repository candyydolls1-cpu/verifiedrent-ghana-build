create table if not exists public.landlord_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_url text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create unique index if not exists landlord_verifications_user_id_key
  on public.landlord_verifications (user_id);

alter table public.landlord_verifications enable row level security;

drop policy if exists "Landlords can view their verification" on public.landlord_verifications;
create policy "Landlords can view their verification"
  on public.landlord_verifications for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Landlords can submit verification" on public.landlord_verifications;
create policy "Landlords can submit verification"
  on public.landlord_verifications for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Landlords can replace pending verification" on public.landlord_verifications;
create policy "Landlords can replace pending verification"
  on public.landlord_verifications for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- The existing verification-docs bucket is reused. Files are scoped by user ID.
drop policy if exists "Landlords upload verification documents" on storage.objects;
create policy "Landlords upload verification documents"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'verification-docs' and (storage.foldername(name))[1] = 'verifications' and (storage.foldername(name))[2] = (select auth.uid())::text);

drop policy if exists "Landlords manage verification documents" on storage.objects;
create policy "Landlords manage verification documents"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'verification-docs' and (storage.foldername(name))[1] = 'verifications' and (storage.foldername(name))[2] = (select auth.uid())::text)
  with check (bucket_id = 'verification-docs' and (storage.foldername(name))[1] = 'verifications' and (storage.foldername(name))[2] = (select auth.uid())::text);
