import type { RatioDia } from "./streaks";

// % de cumplimiento general: promedio del ratio diario de bloques completados sobre el
// total de días con historial (mismo denominador fijo que `construirRatiosPorDia`).
export function calcularCumplimientoGeneral(dias: RatioDia[]): number {
  if (dias.length === 0) return 0;
  const suma = dias.reduce((acc, dia) => acc + dia.ratio, 0);
  return suma / dias.length;
}

export interface CumplimientoBloque {
  blockId: string;
  name: string;
  ratio: number; // 0..1
}

const MS_POR_DIA = 24 * 60 * 60 * 1000;

// % de cumplimiento por bloque: completions del bloque / días transcurridos desde su
// creación hasta hoy (inclusive). Usa `created_at` como proxy de "días activo" ya que el
// esquema no guarda cuándo se desactivó un bloque.
export function calcularCumplimientoPorBloque(
  bloques: { id: string; name: string; created_at: string }[],
  completions: { block_id: string; date: string }[],
  hoy: Date = new Date(),
): CumplimientoBloque[] {
  const completadosPorBloque = new Map<string, number>();
  for (const c of completions) {
    completadosPorBloque.set(c.block_id, (completadosPorBloque.get(c.block_id) ?? 0) + 1);
  }

  return bloques.map((bloque) => {
    const creado = new Date(bloque.created_at);
    const diasActivo = Math.max(
      1,
      Math.floor((hoy.getTime() - creado.getTime()) / MS_POR_DIA) + 1,
    );
    return {
      blockId: bloque.id,
      name: bloque.name,
      ratio: (completadosPorBloque.get(bloque.id) ?? 0) / diasActivo,
    };
  });
}
