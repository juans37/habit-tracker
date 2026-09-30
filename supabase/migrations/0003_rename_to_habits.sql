-- Rename "blocks" to "habits" and move the schema to English.
-- Pure renames: no data is copied or dropped. RLS policies keep working after a table or
-- column rename (they reference objects internally, not by name); they are renamed too
-- only so their names match.

begin;

alter table blocks rename to habits;
alter table habits rename column veces_por_semana to times_per_week;
alter table completions rename column block_id to habit_id;

alter table habits rename constraint blocks_pkey to habits_pkey;
alter table habits rename constraint blocks_user_id_fkey to habits_user_id_fkey;
alter table habits rename constraint blocks_veces_por_semana_check to habits_times_per_week_check;
alter table completions rename constraint completions_block_id_fkey to completions_habit_id_fkey;
alter table completions rename constraint completions_block_id_date_key to completions_habit_id_date_key;

alter index blocks_user_id_idx rename to habits_user_id_idx;
alter index completions_block_id_idx rename to completions_habit_id_idx;

alter policy "blocks_select_own" on habits rename to "habits_select_own";
alter policy "blocks_insert_own" on habits rename to "habits_insert_own";
alter policy "blocks_update_own" on habits rename to "habits_update_own";
alter policy "blocks_delete_own" on habits rename to "habits_delete_own";

commit;
