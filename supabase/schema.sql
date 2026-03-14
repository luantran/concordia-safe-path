-- ============================================================
-- CSP (Concordia Safe Path) — Supabase Schema
-- ============================================================
-- HOW TO USE:
--   1. Open your Supabase project → SQL Editor
--   2. Paste this entire file and run it
--   3. This script is idempotent — safe to re-run at any time
--      without losing existing data
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";


-- ============================================================
-- TABLE: profiles
-- One row per user, auto-created on signup via trigger.
-- ============================================================
create table if not exists profiles (
    id                  uuid primary key references auth.users(id) on delete cascade,
    role                text default 'student' check (role in ('student', 'staff', 'guest')),
    username            text,
    
    -- Legacy Accessibility Toggles (Kept intact for your teammates' routing features)
    mobility_needs      boolean default false,
    anxiety_triggers    boolean default false,
    elevator_access     boolean default false,
    high_contrast       boolean default false,
    reduced_motion      boolean default false,
    alert_categories    text[] default array[]::text[],
    location_consent    boolean default false,
    
    -- NEW: App Preferences
    dark_mode               boolean default false,
    accessibility_routing   boolean default false,
    
    -- NEW: Distance-Based Alerts
    distance_normal         integer default 500,
    distance_silent         integer default 1000,
    
    -- NEW: Incident-Specific Alert Overrides ('normal', 'silent', 'muted')
    notif_protest           text default 'normal',
    notif_road              text default 'normal',
    notif_construction      text default 'normal',
    notif_vandalism         text default 'normal',

    preferences_completed   boolean default false,
    created_at              timestamptz default now()
);

alter table profiles enable row level security;

drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile"
    on profiles for select
    using (auth.uid() = id);

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile"
    on profiles for update
    using (auth.uid() = id)
    with check (auth.uid() = id);


-- ============================================================
-- TABLE: emergency_contacts
-- Replaces the old JSONB array. Secured strictly by RLS.
-- ============================================================
create table if not exists emergency_contacts (
    id              uuid primary key default gen_random_uuid(),
    user_id         uuid references auth.users(id) on delete cascade not null,
    name            text not null,
    phone_number    text not null,
    created_at      timestamptz default now()
);

alter table emergency_contacts enable row level security;

-- SECURITY FIX: Restricts SELECT so users can ONLY see their own contacts
drop policy if exists "Users can view own contacts" on emergency_contacts;
create policy "Users can view own contacts"
    on emergency_contacts for select
    using (auth.uid() = user_id);

drop policy if exists "Users can insert own contacts" on emergency_contacts;
create policy "Users can insert own contacts"
    on emergency_contacts for insert
    with check (auth.uid() = user_id);

drop policy if exists "Users can update own contacts" on emergency_contacts;
create policy "Users can update own contacts"
    on emergency_contacts for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

drop policy if exists "Users can delete own contacts" on emergency_contacts;
create policy "Users can delete own contacts"
    on emergency_contacts for delete
    using (auth.uid() = user_id);


-- ============================================================
-- TABLE: incidents
-- Core table for all reported campus incidents.
-- ============================================================
create table if not exists incidents (
    id                  uuid primary key default gen_random_uuid(),
    user_id             uuid references auth.users(id) on delete cascade not null,
    type                text not null check (type in ('protest', 'construction', 'emergency', 'blockade', 'accessibility', 'safety')),
    description         text,
    severity            text not null check (severity in ('low', 'medium', 'high')),
    latitude            double precision,
    longitude           double precision,
    upvotes             int default 0,
    verified            boolean default false,
    verified_by         uuid references auth.users(id),
    followed_by         uuid[] default array[]::uuid[],
    status              text not null default 'active' check (status in ('active', 'resolved')),
    verification_status text default 'submitted' check (
                            verification_status in (
                                'submitted',
                                'under_review',
                                'verified_by_users',
                                'verified_by_campus',
                                'resolved'
                            )
                        ),
    created_at          timestamptz default now()
);

alter table incidents enable row level security;

drop policy if exists "Anyone can view incidents" on incidents;
create policy "Anyone can view incidents"
    on incidents for select
    using (true);

drop policy if exists "Logged in users can create incidents" on incidents;
create policy "Logged in users can create incidents"
    on incidents for insert
    with check (auth.uid() is not null);

drop policy if exists "Logged in users can upvote incidents" on incidents;
create policy "Logged in users can upvote incidents"
    on incidents for update
    using (auth.uid() is not null)
    with check (auth.uid() is not null);

drop policy if exists "Users can delete their own incidents" on incidents;
create policy "Users can delete their own incidents"
    on incidents for delete
    using (auth.uid() = user_id);

-- Enable realtime
do $$
begin
    if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime'
        and tablename = 'incidents'
    ) then
        alter publication supabase_realtime add table incidents;
    end if;
end $$;

alter table incidents replica identity full;


-- ============================================================
-- TABLE: comments
-- Supporting details added to existing incident reports.
-- ============================================================
create table if not exists comments (
    id          uuid primary key default gen_random_uuid(),
    incident_id uuid references incidents(id) on delete cascade not null,
    user_id     uuid references auth.users(id) on delete cascade not null,
    content     text not null,
    created_at  timestamptz default now()
);

alter table comments enable row level security;

drop policy if exists "Anyone can view comments" on comments;
create policy "Anyone can view comments"
    on comments for select
    using (true);

drop policy if exists "Logged in users can create comments" on comments;
create policy "Logged in users can create comments"
    on comments for insert
    with check (auth.uid() is not null);

drop policy if exists "Users can delete their own comments" on comments;
create policy "Users can delete their own comments"
    on comments for delete
    using (auth.uid() = user_id);


-- ============================================================
-- TRIGGER: auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, role, username)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'role', 'student'),
        new.raw_user_meta_data->>'username'
    );
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();