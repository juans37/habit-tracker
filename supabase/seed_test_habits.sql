-- Test habits for trying out the Today view by hand.
-- Replace 'YOUR_USER_ID' with your user's UUID (Authentication -> Users in the dashboard).
-- This file is only for local testing, it is not part of the migrations.

insert into habits (user_id, name, order_index, times_per_week) values
  ('YOUR_USER_ID', 'Deep focus', 0, 7),
  ('YOUR_USER_ID', 'Work (morning)', 1, 5),
  ('YOUR_USER_ID', 'Gym', 2, 3),
  ('YOUR_USER_ID', 'Work (afternoon)', 3, 5),
  ('YOUR_USER_ID', 'Study / side project', 4, 7),
  ('YOUR_USER_ID', 'Wrap up the day', 5, 7);
