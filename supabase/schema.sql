-- HEC Launchpad — schéma Supabase (à coller dans SQL Editor du projet, puis Run)
-- Idempotent : peut être rejoué.

create extension if not exists pgcrypto;

-- ---------- Domaines email autorisés ----------
create table if not exists public.allowed_domains (
  domain text primary key
);
insert into public.allowed_domains (domain) values ('hec.edu'), ('hec.fr')
on conflict do nothing;

create or replace function public.check_email_domain()
returns trigger language plpgsql security definer set search_path = public as $$
declare d text;
begin
  d := lower(split_part(new.email, '@', 2));
  if not exists (select 1 from public.allowed_domains where domain = d) then
    raise exception 'Inscription réservée aux adresses HEC (%).', d;
  end if;
  return new;
end $$;

drop trigger if exists check_email_domain on auth.users;
create trigger check_email_domain
before insert on auth.users
for each row execute function public.check_email_domain();

-- ---------- Profils ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  bio text not null default '',
  skills text[] not null default '{}',
  looking_for text[] not null default '{}',
  linkedin_url text,
  avatar_url text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', initcap(replace(split_part(new.email,'@',1),'.',' '))))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------- Idées ----------
create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 80),
  pitch text not null check (char_length(pitch) between 10 and 280),
  description text not null default '',
  stage text not null default 'idee' check (stage in ('idee','proto','lance')),
  needs text[] not null default '{}',
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ideas_created_idx on public.ideas (created_at desc);

-- ---------- Votes ----------
create table if not exists public.votes (
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  idea_id uuid not null references public.ideas(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, idea_id)
);
create index if not exists votes_idea_idx on public.votes (idea_id);

-- ---------- Commentaires ----------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas(id) on delete cascade,
  author_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists comments_idea_idx on public.comments (idea_id, created_at);

-- ---------- Annonces cofondateur ----------
create table if not exists public.cofounder_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  headline text not null check (char_length(headline) between 3 and 100),
  body text not null default '',
  skills_offered text[] not null default '{}',
  skills_wanted text[] not null default '{}',
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz not null default now()
);

-- ---------- Vue feed ----------
create or replace view public.idea_feed
with (security_invoker = on) as
select
  i.*,
  p.display_name as author_name,
  p.avatar_url as author_avatar,
  (select count(*) from public.votes v where v.idea_id = i.id)::int as vote_count,
  (select count(*) from public.comments c where c.idea_id = i.id)::int as comment_count,
  exists (select 1 from public.votes v where v.idea_id = i.id and v.user_id = auth.uid()) as voted_by_me
from public.ideas i
join public.profiles p on p.id = i.author_id;

-- ---------- Toggle vote (atomique) ----------
create or replace function public.toggle_vote(p_idea_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare existed boolean;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  delete from public.votes where user_id = auth.uid() and idea_id = p_idea_id;
  existed := found;
  if not existed then
    insert into public.votes (user_id, idea_id) values (auth.uid(), p_idea_id);
  end if;
  return not existed; -- true = maintenant voté
end $$;

-- ---------- RLS ----------
alter table public.allowed_domains enable row level security;
alter table public.profiles enable row level security;
alter table public.ideas enable row level security;
alter table public.votes enable row level security;
alter table public.comments enable row level security;
alter table public.cofounder_posts enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
$$;

drop policy if exists "domains read" on public.allowed_domains;
create policy "domains read" on public.allowed_domains for select to authenticated using (true);
drop policy if exists "domains admin" on public.allowed_domains;
create policy "domains admin" on public.allowed_domains for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles for select to authenticated using (true);
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "ideas read" on public.ideas;
create policy "ideas read" on public.ideas for select to authenticated using (true);
drop policy if exists "ideas insert own" on public.ideas;
create policy "ideas insert own" on public.ideas for insert to authenticated with check (author_id = auth.uid());
drop policy if exists "ideas update own" on public.ideas;
create policy "ideas update own" on public.ideas for update to authenticated using (author_id = auth.uid() or public.is_admin());
drop policy if exists "ideas delete own" on public.ideas;
create policy "ideas delete own" on public.ideas for delete to authenticated using (author_id = auth.uid() or public.is_admin());

drop policy if exists "votes read" on public.votes;
create policy "votes read" on public.votes for select to authenticated using (true);
drop policy if exists "votes insert own" on public.votes;
create policy "votes insert own" on public.votes for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "votes delete own" on public.votes;
create policy "votes delete own" on public.votes for delete to authenticated using (user_id = auth.uid());

drop policy if exists "comments read" on public.comments;
create policy "comments read" on public.comments for select to authenticated using (true);
drop policy if exists "comments insert own" on public.comments;
create policy "comments insert own" on public.comments for insert to authenticated with check (author_id = auth.uid());
drop policy if exists "comments delete own" on public.comments;
create policy "comments delete own" on public.comments for delete to authenticated using (author_id = auth.uid() or public.is_admin());

drop policy if exists "cof read" on public.cofounder_posts;
create policy "cof read" on public.cofounder_posts for select to authenticated using (true);
drop policy if exists "cof insert own" on public.cofounder_posts;
create policy "cof insert own" on public.cofounder_posts for insert to authenticated with check (author_id = auth.uid());
drop policy if exists "cof update own" on public.cofounder_posts;
create policy "cof update own" on public.cofounder_posts for update to authenticated using (author_id = auth.uid() or public.is_admin());
drop policy if exists "cof delete own" on public.cofounder_posts;
create policy "cof delete own" on public.cofounder_posts for delete to authenticated using (author_id = auth.uid() or public.is_admin());

-- Realtime sur les votes et commentaires (optionnel)
do $$ begin
  alter publication supabase_realtime add table public.votes;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.comments;
exception when duplicate_object then null; end $$;
