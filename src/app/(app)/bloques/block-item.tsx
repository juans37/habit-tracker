"use client";

import { useState, useTransition } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { colorForBlock } from "@/lib/block-colors";
import { eliminarBloque, renombrarBloque } from "./actions";

interface BlockItemProps {
  blockId: string;
  name: string;
  index: number;
}

export function BlockItem({ blockId, name, index }: BlockItemProps) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(name);
  const [isPending, startTransition] = useTransition();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: blockId });

  const color = colorForBlock(index);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  function guardarNombre() {
    const nombre = valor.trim();
    if (!nombre || nombre === name) {
      setValor(name);
      setEditando(false);
      return;
    }
    startTransition(async () => {
      await renombrarBloque(blockId, nombre);
      setEditando(false);
    });
  }

  function cancelarEdicion() {
    setValor(name);
    setEditando(false);
  }

  function handleEliminar() {
    if (
      !window.confirm(
        `¿Eliminar "${name}"? Desaparece de Hoy, pero queda en la base de datos.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      await eliminarBloque(blockId);
    });
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col gap-2.5 rounded-2xl border border-border bg-card p-3.5"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="shrink-0 cursor-grab touch-none pr-0.5 text-[16px] leading-none tracking-[2px] text-ink-faint active:cursor-grabbing"
          aria-label="Reordenar"
        >
          ⠿
        </button>
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold"
          style={{ background: `${color}22`, border: `1px solid ${color}55`, color }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
        {editando ? (
          <input
            autoFocus
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") guardarNombre();
              if (e.key === "Escape") cancelarEdicion();
            }}
            placeholder="Nombre"
            className="flex-1 min-w-0 rounded-lg border border-border-strong bg-surface px-2.5 py-2 text-sm text-ink outline-none"
          />
        ) : (
          <span className="flex-1 min-w-0 truncate text-[14.5px] font-bold text-ink">
            {name}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        {editando ? (
          <>
            <button
              type="button"
              onClick={guardarNombre}
              disabled={isPending}
              className="flex-1 rounded-lg bg-success py-2 text-[13px] font-bold text-surface disabled:opacity-60"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={cancelarEdicion}
              disabled={isPending}
              className="flex-1 rounded-lg bg-surface py-2 text-[13px] font-semibold text-ink-soft disabled:opacity-60"
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setEditando(true)}
              disabled={isPending}
              className="flex-1 rounded-lg bg-surface py-2 text-[13px] font-semibold text-ink-soft disabled:opacity-60"
            >
              Renombrar
            </button>
            <button
              type="button"
              onClick={handleEliminar}
              disabled={isPending}
              className="flex-1 rounded-lg bg-[rgba(244,63,94,.1)] py-2 text-[13px] font-semibold text-danger disabled:opacity-60"
            >
              Eliminar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
