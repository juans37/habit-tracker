export const UMBRAL_DIA_CUMPLIDO = 0.7;

export interface RatioDia {
  fecha: string; // YYYY-MM-DD
  ratio: number; // 0..1, bloques completados / bloques activos ese día
}

export function formatearFechaISO(fecha: Date): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Últimos `n` días en formato YYYY-MM-DD, empezando por hoy hacia atrás.
export function ultimosNDias(n: number, hoy: Date = new Date()): string[] {
  const dias: string[] = [];
  for (let i = 0; i < n; i++) {
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() - i);
    dias.push(formatearFechaISO(fecha));
  }
  return dias;
}

// Arma el ratio de cumplimiento de cada día a partir de las completions crudas.
// `totalBloques` es la cantidad de bloques activos actuales (se usa como denominador
// fijo para todo el rango: el esquema no guarda cuántos bloques había activos en el
// pasado, así que se simplifica con el conteo de hoy).
export function construirRatiosPorDia(
  fechas: string[],
  completions: { block_id: string; date: string }[],
  totalBloques: number,
): RatioDia[] {
  if (totalBloques === 0) {
    return fechas.map((fecha) => ({ fecha, ratio: 0 }));
  }

  const completadosPorFecha = new Map<string, number>();
  for (const c of completions) {
    completadosPorFecha.set(c.date, (completadosPorFecha.get(c.date) ?? 0) + 1);
  }

  return fechas.map((fecha) => ({
    fecha,
    ratio: (completadosPorFecha.get(fecha) ?? 0) / totalBloques,
  }));
}

// `dias` debe venir ordenado de más reciente a más antiguo (hoy primero).
// Cuenta días consecutivos desde hoy hacia atrás donde el ratio alcanza el umbral.
export function calcularRacha(
  dias: RatioDia[],
  umbral: number = UMBRAL_DIA_CUMPLIDO,
): number {
  let racha = 0;
  for (const dia of dias) {
    if (dia.ratio >= umbral) {
      racha++;
    } else {
      break;
    }
  }
  return racha;
}
