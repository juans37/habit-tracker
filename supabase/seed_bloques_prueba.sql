-- Bloques de prueba para probar Vista Hoy manualmente.
-- Reemplazá 'TU_USER_ID' por el UUID de tu usuario (Authentication -> Users en el dashboard).
-- Este archivo es solo para pruebas locales, no es parte de la migración.

insert into blocks (user_id, name, order_index) values
  ('TU_USER_ID', 'Enfoque profundo', 0),
  ('TU_USER_ID', 'Trabajo (mañana)', 1),
  ('TU_USER_ID', 'Gym', 2),
  ('TU_USER_ID', 'Trabajo (tarde)', 3),
  ('TU_USER_ID', 'Estudio / proyecto personal', 4),
  ('TU_USER_ID', 'Cierre del día', 5);
