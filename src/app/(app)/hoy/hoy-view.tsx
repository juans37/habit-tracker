"use client";

import { useState, useTransition } from "react";
import { type RatioDia, calcularRacha, formatearFechaISO } from "@/lib/streaks";
import { colorForBlock } from "@/lib/block-colors";
import { toggleCompletado } from "./actions";

const LETRAS_DIA = ["D", "L", "M", "X", "J", "V", "S"];

interface Bloque {
  id: string;
  name: string;
}

interface HoyViewProps {
  bloques: Bloque[];
  completadosHoyInicial: string[];
  historialSinHoy: RatioDia[]; // descendente, ayer hacia atrás
  umbral: number;
}

export function HoyView({
  bloques,
  completadosHoyInicial,
  historialSinHoy,
  umbral,
}: HoyViewProps) {
  const [completados, setCompletados] = useState(new Set(completadosHoyInicial));
  const [celebrando, setCelebrando] = useState(false);
  const [, startTransition] = useTransition();

  const total = bloques.length;
  const doneCount = completados.size;
  const pct = total ? doneCount / total : 0;

  const ratioHoy: RatioDia = { fecha: formatearFechaISO(new Date()), ratio: pct };
  const historialConHoy = [ratioHoy, ...historialSinHoy];
  const racha = calcularRacha(historialConHoy, umbral);
  const ultimaSemana = [...historialConHoy.slice(0, 7)].reverse();

  const indiceSiguientePendiente = bloques.findIndex((b) => !completados.has(b.id));
  const pctDeg = Math.round(pct * 360);

  function handleToggle(blockId: string) {
    const estabaCompletado = completados.has(blockId);
    const nuevos = new Set(completados);
    if (estabaCompletado) nuevos.delete(blockId);
    else nuevos.add(blockId);

    const pctDespues = total ? nuevos.size / total : 0;
    if (pct < umbral && pctDespues >= umbral) {
      setCelebrando(true);
      setTimeout(() => setCelebrando(false), 2000);
    }

    setCompletados(nuevos);
    startTransition(async () => {
      try {
        await toggleCompletado(blockId, estabaCompletado);
      } catch {
        setCompletados(completados);
      }
    });
  }

  const todayLabel = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="flex flex-col gap-[22px]">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[13px] font-semibold tracking-wide text-ink-faint">
            {todayLabel}
          </div>
          <div className="mt-0.5 font-display text-2xl font-bold text-ink">Hoy</div>
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold text-ink-faint">Bloques</div>
          <div className="font-display text-lg font-bold text-ink">
            {doneCount}/{total}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-[18px] rounded-[20px] border border-border bg-card p-[22px]">
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(#FF8A3D ${pctDeg}deg, rgba(255,255,255,.08) ${pctDeg}deg)`,
          }}
        >
          <div className="flex h-[72px] w-[72px] flex-col items-center justify-center rounded-full bg-card">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              style={{ animation: "rt-flicker 2.4s ease-in-out infinite" }}
            >
              <path
                d="M12 2c-1.2 4-6 5.2-6 11a6 6 0 0012 0c0-2.1-1-3.3-2.1-4.3.4 2-1 3-2 2 .6-2-1-4.4-1.9-8.7z"
                fill="#FF8A3D"
              />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-[40px] leading-none font-bold text-ink">
              {racha}
            </span>
            <span className="text-sm font-semibold text-ink-soft">días de racha</span>
          </div>
          <div className="mt-1 text-[12.5px] text-ink-faint">
            {Math.round(umbral * 100)}%+ de bloques mantiene la racha
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="text-[12.5px] font-bold tracking-[.04em] text-ink-faint uppercase">
          Últimos 7 días
        </div>
        <div className="flex gap-2">
          {ultimaSemana.map((dia, i) => {
            const esHoy = i === ultimaSemana.length - 1;
            const dotColor =
              dia.ratio >= umbral ? "#2DD4BF" : dia.ratio > 0 ? "#FF8A3D" : null;
            return (
              <div
                key={dia.fecha}
                className="flex flex-1 flex-col items-center gap-1.5"
                style={{ color: esHoy ? "#F2F1EC" : "#5B5E64" }}
              >
                <span className="text-[11px] font-bold opacity-75">
                  {LETRAS_DIA[new Date(`${dia.fecha}T00:00:00`).getDay()]}
                </span>
                <div
                  className="h-[26px] w-[26px] rounded-full"
                  style={{
                    background: dotColor ?? "transparent",
                    border: `2px solid ${dotColor ?? "rgba(255,255,255,.12)"}`,
                    boxShadow: esHoy ? "0 0 0 2px rgba(255,255,255,.15)" : "none",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="text-[12.5px] font-bold tracking-[.04em] text-ink-faint uppercase">
          Secuencia de hoy
        </div>
        {bloques.length === 0 ? (
          <p className="text-sm text-ink-soft">
            Todavía no tenés bloques activos. Creá el primero en Bloques.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {bloques.map((bloque, i) => {
              const done = completados.has(bloque.id);
              const isNext = !done && i === indiceSiguientePendiente;
              const color = colorForBlock(i);
              return (
                <button
                  key={bloque.id}
                  type="button"
                  onClick={() => handleToggle(bloque.id)}
                  className="flex items-center gap-3 rounded-[14px] border p-[12px_14px] text-left transition-transform"
                  style={{
                    background: isNext ? "#171A1E" : "#13151A",
                    borderColor: isNext ? "rgba(255,138,61,.35)" : "rgba(255,255,255,.06)",
                  }}
                >
                  <div
                    className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full text-sm font-bold"
                    style={{
                      background: `${color}22`,
                      border: `1px solid ${color}55`,
                      color,
                    }}
                  >
                    {bloque.name.charAt(0).toUpperCase()}
                  </div>
                  <span
                    className="flex-1 truncate text-[14.5px] font-bold"
                    style={{
                      color: done ? "#5B5E64" : "#F2F1EC",
                      textDecoration: done ? "line-through" : "none",
                    }}
                  >
                    {bloque.name}
                  </span>
                  {isNext && (
                    <span className="shrink-0 rounded-full bg-[rgba(255,138,61,.12)] px-2 py-1 text-[11px] font-bold whitespace-nowrap text-accent">
                      Siguiente
                    </span>
                  )}
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: done ? "#2DD4BF" : "transparent",
                      border: `2px solid ${done ? "#2DD4BF" : "rgba(255,255,255,.15)"}`,
                    }}
                  >
                    {done && (
                      <span className="text-sm font-extrabold text-surface">✓</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {celebrando && (
        <div
          onClick={() => setCelebrando(false)}
          className="fixed inset-0 z-20 flex items-center justify-center backdrop-blur-[2px]"
          style={{ background: "rgba(5,6,7,.72)" }}
        >
          <div
            className="flex flex-col items-center gap-2.5 rounded-[20px] border px-8 py-7"
            style={{
              animation: "rt-pop .35s cubic-bezier(.2,.8,.3,1)",
              background: "#13151A",
              borderColor: "rgba(255,138,61,.35)",
              boxShadow: "0 0 60px rgba(255,138,61,.25)",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24">
              <path
                d="M12 2c-1.2 4-6 5.2-6 11a6 6 0 0012 0c0-2.1-1-3.3-2.1-4.3.4 2-1 3-2 2 .6-2-1-4.4-1.9-8.7z"
                fill="#FF8A3D"
              />
            </svg>
            <div className="font-display text-xl font-bold text-ink">Día completo</div>
            <div className="text-[13px] text-ink-soft">Racha: {racha} días</div>
          </div>
        </div>
      )}
    </div>
  );
}
