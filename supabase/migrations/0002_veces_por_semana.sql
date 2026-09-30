-- Frecuencia semanal por bloque: cuántas veces por semana (lun–dom) se debería hacer.
-- 7 = todos los días, que es el comportamiento que tenían todos los bloques hasta ahora,
-- así que los bloques existentes quedan igual.

alter table blocks
  add column veces_por_semana smallint not null default 7
  check (veces_por_semana between 1 and 7);
