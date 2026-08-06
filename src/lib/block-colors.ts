// Paleta rotativa para el avatar circular de cada bloque. El índice es la posición
// del bloque dentro de la lista de bloques activos ordenada — no se persiste por
// bloque, así que el color puede correrse si se reordena (aceptable para el MVP).
const BLOCK_COLORS = [
  "#2DD4BF",
  "#60A5FA",
  "#FB923C",
  "#A78BFA",
  "#F472B6",
  "#FBBF24",
];

export function colorForBlock(index: number): string {
  return BLOCK_COLORS[index % BLOCK_COLORS.length];
}
