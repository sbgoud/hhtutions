-- Home Tutor Site Database Schema
-- Run this in Supabase SQL Editor

-- Users handled by Supabase auth.users

-- Create user_profiles table
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('tutor','student')) not null default 'tutor',
  full_name text,
  phone text,
  city text,
  locality text,
  lat double precision,
  lon double precision,
  created_at timestamp with time zone default now()
);

-- Create tuition_posts table
create table if not exists public.tuition_posts (
  id bigserial primary key,
  student_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  course text,
  subjects text[],
  board text,
  class_level text,
  city text,
  locality text,
  timing text, -- Morning/Afternoon/Evening/AnyTime
  gender_pref text, -- Any/Male/Female
  tuition_type text, -- Home Tuition / At Tutor Home / At Institute / Online
  price_type text, -- hourly/monthly/onetime
  asked_price integer default 0,
  description text,
  lat double precision,
  lon double precision,
  posted_on date default current_date,
  created_at timestamp with time zone default now()
);

-- Create unlocks table
create table if not exists public.unlocks (
  id bigserial primary key,
  tutor_id uuid not null references auth.users(id) on delete cascade,
  post_id bigint not null references public.tuition_posts(id) on delete cascade,
  amount integer not null,
  currency text not null default 'INR',
  provider text, -- 'razorpay' or 'manual_qr'
  status text not null default 'paid',
  created_at timestamp with time zone default now(),
  unique (tutor_id, post_id)
);

-- Create applications table
create table if not exists public.applications (
  id bigserial primary key,
  post_id bigint not null references public.tuition_posts(id) on delete cascade,
  tutor_id uuid not null references auth.users(id) on delete cascade,
  message text,
  quoted_price integer,
  price_type text,
  created_at timestamp with time zone default now()
);

-- Create manual_payments table
create table if not exists public.manual_payments (
  id bigserial primary key,
  payer_user_id uuid not null references auth.users(id) on delete cascade,
  purpose text not null, -- 'post_view' | 'post_create'
  amount integer not null,
  currency text not null default 'INR',
  target_post_id bigint,
  proof_url text,
  status text not null default 'pending', -- pending|approved|rejected
  reviewed_by uuid,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create wallet_transactions table
create table if not exists public.wallet_transactions (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text not null,
  user_phone text,
  user_name text,
  amount integer not null,
  currency text not null default 'INR',
  transaction_type text not null default 'credit', -- credit/debit
  payment_method text not null default 'upi', -- upi/card/bank
  utr_number text, -- UTR number from UPI transaction
  transaction_id text unique, -- unique transaction ID
  upi_ref text, -- UPI reference number
  status text not null default 'pending', -- pending/verified/rejected
  admin_notes text,
  verified_by uuid references auth.users(id),
  verified_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.user_profiles enable row level security;
alter table public.tuition_posts enable row level security;
alter table public.unlocks enable row level security;
alter table public.applications enable row level security;
alter table public.manual_payments enable row level security;
alter table public.wallet_transactions enable row level security;

-- RLS Policies

-- Drop existing policies first (for development/testing)
drop policy if exists "profile_insert_self" on user_profiles;
drop policy if exists "profile_select_self" on user_profiles;
drop policy if exists "profile_update_self" on user_profiles;
drop policy if exists "posts_select_all" on tuition_posts;
drop policy if exists "posts_insert_owner" on tuition_posts;
drop policy if exists "posts_update_owner" on tuition_posts;
drop policy if exists "posts_delete_owner" on tuition_posts;
drop policy if exists "unlocks_select_self" on unlocks;
drop policy if exists "unlocks_insert_self" on unlocks;
drop policy if exists "applications_select_self_or_post_owner" on applications;
drop policy if exists "applications_insert_self" on applications;
drop policy if exists "manual_select_self_or_admin" on manual_payments;
drop policy if exists "manual_insert_self" on manual_payments;
drop policy if exists "manual_update_admin" on manual_payments;
drop policy if exists "wallet_select_self_or_admin" on wallet_transactions;
drop policy if exists "wallet_insert_self" on wallet_transactions;
drop policy if exists "wallet_update_admin" on wallet_transactions;

-- user_profiles policies
create policy "profile_insert_self" on user_profiles for insert with check (auth.uid() = user_id);
create policy "profile_select_self" on user_profiles for select using (true);
create policy "profile_update_self" on user_profiles for update using (auth.uid() = user_id);

-- tuition_posts policies
create policy "posts_select_all" on tuition_posts for select using (true);
create policy "posts_insert_owner" on tuition_posts for insert with check (auth.uid() = student_id);
create policy "posts_update_owner" on tuition_posts for update using (auth.uid() = student_id);
create policy "posts_delete_owner" on tuition_posts for delete using (auth.uid() = student_id);

-- unlocks policies
create policy "unlocks_select_self" on unlocks for select using (auth.uid() = tutor_id);
create policy "unlocks_insert_self" on unlocks for insert with check (auth.uid() = tutor_id);

-- applications policies
create policy "applications_select_self_or_post_owner" on applications for select using (auth.uid() = tutor_id OR auth.uid() in (select student_id from tuition_posts where tuition_posts.id = post_id));
create policy "applications_insert_self" on applications for insert with check (auth.uid() = tutor_id);

-- manual_payments policies
create policy "manual_select_self_or_admin" on manual_payments for select using (auth.uid() = payer_user_id OR auth.jwt() ->> 'email' in ('shashank2bandari@gmail.com','dineshsomishetti@gmail.com'));
create policy "manual_insert_self" on manual_payments for insert with check (auth.uid() = payer_user_id);
create policy "manual_update_admin" on manual_payments for update using (auth.jwt() ->> 'email' in ('shashank2bandari@gmail.com','dineshsomishetti@gmail.com'));

-- wallet_transactions policies
create policy "wallet_select_self_or_admin" on wallet_transactions for select using (auth.uid() = user_id OR auth.jwt() ->> 'email' in ('shashank2bandari@gmail.com','dineshsomishetti@gmail.com'));
create policy "wallet_insert_self" on wallet_transactions for insert with check (auth.uid() = user_id);
create policy "wallet_update_admin" on wallet_transactions for update using (auth.jwt() ->> 'email' in ('shashank2bandari@gmail.com','dineshsomishetti@gmail.com'));

-- Helper function to check if post is unlocked
create or replace function public.is_post_unlocked(_post_id bigint)
returns boolean as $$
select exists(
  select 1
  from public.unlocks
  where tutor_id = auth.uid() and post_id = _post_id and status = 'paid'
);
$$ language sql stable;

-- Create storage bucket for payment proofs (only if it doesn't exist)
insert into storage.buckets (id, name, public)
values ('proofs', 'proofs', false)
on conflict (id) do nothing;

-- Drop existing storage policies first (for development/testing)
drop policy if exists "proofs_upload_own" on storage.objects;
drop policy if exists "proofs_select_own_or_admin" on storage.objects;

-- Storage policies for proofs bucket
create policy "proofs_upload_own" on storage.objects for insert with check (bucket_id = 'proofs' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "proofs_select_own_or_admin" on storage.objects for select using (bucket_id = 'proofs' and (auth.uid()::text = (storage.foldername(name))[1] or auth.jwt() ->> 'email' in ('shashank2bandari@gmail.com','dineshsomishetti@gmail.com')));
