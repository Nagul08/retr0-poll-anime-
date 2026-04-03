alter table polls enable row level security;
alter table poll_options enable row level security;
alter table votes enable row level security;

drop policy if exists "Public read polls" on polls;
drop policy if exists "Public read options" on poll_options;
drop policy if exists "Public insert votes" on votes;
drop policy if exists "Public read votes" on votes;

create policy "Public read polls"
on polls for select
using (true);

create policy "Public read options"
on poll_options for select
using (true);

create policy "Public insert votes"
on votes for insert
with check (identity_key <> '' and identity_key is not null);

create policy "Public read votes"
on votes for select
using (true);
