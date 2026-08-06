const HITOS = [
  { dias: 7, label: "Semana" },
  { dias: 30, label: "Mes" },
  { dias: 50, label: "50 días" },
  { dias: 100, label: "100 días" },
];

interface BadgesProps {
  mejorRacha: number;
}

export function Badges({ mejorRacha }: BadgesProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="text-[12.5px] font-bold tracking-[.04em] text-ink-faint uppercase">
        Hitos
      </div>
      <div className="flex gap-2.5">
        {HITOS.map((hito) => {
          const desbloqueado = mejorRacha >= hito.dias;
          return (
            <div key={hito.dias} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className="flex h-[52px] w-[52px] items-center justify-center rounded-full font-display text-[15px] font-bold"
                style={{
                  background: desbloqueado
                    ? "linear-gradient(135deg,#FF8A3D,#FFB84D)"
                    : "transparent",
                  color: desbloqueado ? "#0A0B0D" : "#3A3D42",
                  border: desbloqueado ? "2px solid transparent" : "2px solid rgba(255,255,255,.1)",
                  boxShadow: desbloqueado ? "0 0 20px rgba(255,138,61,.4)" : "none",
                }}
              >
                {hito.dias}
              </div>
              <span className="text-center text-[10.5px] font-semibold text-ink-faint">
                {hito.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
