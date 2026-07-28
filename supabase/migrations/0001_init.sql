-- Habit tracker: esquema inicial (blocks + completions)
-- users la maneja Supabase Auth (auth.users), no creamos tabla propia.

create table blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  order_index int not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table completions (
  id uuid primary key default gen_random_uuid(),
  block_id uuid not null references blocks(id) on delete cascade,
  date date not null,
  completed_at timestamptz not null default now(),
  unique (block_id, date)
);

create index blocks_user_id_idx on blocks (user_id);
create index completions_block_id_idx on completions (block_id);
create index completions_date_idx on completions (date);

alter table blocks enable row level security;
alter table completions enable row level security;

-- blocks: el dueño puede hacer todo sobre sus propios bloques
create policy "blocks_select_own" on blocks
  for select using (auth.uid() = user_id);

create policy "blocks_insert_own" on blocks
  for insert with check (auth.uid() = user_id);

create policy "blocks_update_own" on blocks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "blocks_delete_own" on blocks
  for delete using (auth.uid() = user_id);

-- completions: acceso vía el user_id del block relacionado (join implícito)
create policy "completions_select_own" on completions
  for select using (
    exists (
      select 1 from blocks
      where blocks.id = completions.block_id
      and blocks.user_id = auth.uid()
    )
  );

create policy "completions_insert_own" on completions
  for insert with check (
    exists (
      select 1 from blocks
      where blocks.id = completions.block_id
      and blocks.user_id = auth.uid()
    )
  );

create policy "completions_update_own" on completions
  for update using (
    exists (
      select 1 from blocks
      where blocks.id = completions.block_id
      and blocks.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from blocks
      where blocks.id = completions.block_id
      and blocks.user_id = auth.uid()
    )
  );

create policy "completions_delete_own" on completions
  for delete using (
    exists (
      select 1 from blocks
      where blocks.id = completions.block_id
      and blocks.user_id = auth.uid()
    )
  );
