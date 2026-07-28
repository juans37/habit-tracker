"use client";

import { useState, useTransition } from "react";
import { toggleCompletado } from "./actions";

interface BlockRowProps {
  blockId: string;
  name: string;
  completadoInicial: boolean;
  esSiguientePendiente: boolean;
}

export function BlockRow({
  blockId,
  name,
  completadoInicial,
  esSiguientePendiente,
}: BlockRowProps) {
  const [completado, setCompletado] = useState(completadoInicial);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const estabaCompletado = completado;
    setCompletado(!estabaCompletado);
    startTransition(async () => {
      try {
        await toggleCompletado(blockId, estabaCompletado);
      } catch {
        setCompletado(estabaCompletado);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-gray-50 disabled:opacity-60"
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-sm ${
          completado
            ? "border-black bg-black text-white"
            : "border-gray-300 text-transparent"
        }`}
      >
        ✓
      </span>
      <span
        className={`flex-1 text-[15px] ${
          completado ? "text-gray-400 line-through" : "text-gray-900"
        }`}
      >
        {name}
      </span>
      {esSiguientePendiente && !completado && (
        <span
          className="h-2 w-2 shrink-0 rounded-full bg-blue-500"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
