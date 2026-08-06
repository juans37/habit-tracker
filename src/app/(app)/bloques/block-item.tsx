"use client";

import { useState, useTransition } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { eliminarBloque, renombrarBloque } from "./actions";

interface BlockItemProps {
  blockId: string;
  name: string;
}

export function BlockItem({ blockId, name }: BlockItemProps) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(name);
  const [isPending, startTransition] = useTransition();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: blockId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  function guardarNombre() {
    const nombre = valor.trim();
    setEditando(false);
    if (!nombre || nombre === name) {
      setValor(name);
      return;
    }
    startTransition(async () => {
      await renombrarBloque(blockId, nombre);
    });
  }

  function handleEliminar() {
    if (!window.confirm(`¿Eliminar "${name}"? Se puede recuperar desde la base de datos, pero desaparece de Hoy.`)) {
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
      className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-gray-50"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab touch-none px-1 text-gray-300 active:cursor-grabbing"
        aria-label="Reordenar"
      >
        ⠿
      </button>

      {editando ? (
        <input
          autoFocus
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onBlur={guardarNombre}
          onKeyDown={(e) => {
            if (e.key === "Enter") guardarNombre();
            if (e.key === "Escape") {
              setValor(name);
              setEditando(false);
            }
          }}
          className="flex-1 rounded border border-gray-300 px-2 py-1 text-[15px] outline-none"
        />
      ) : (
        <span className="flex-1 text-[15px] text-gray-900">{name}</span>
      )}

      <button
        type="button"
        onClick={() => setEditando(true)}
        disabled={isPending}
        className="shrink-0 px-1 text-gray-400 hover:text-gray-900 disabled:opacity-60"
        aria-label="Renombrar"
      >
        ✎
      </button>
      <button
        type="button"
        onClick={handleEliminar}
        disabled={isPending}
        className="shrink-0 px-1 text-gray-400 hover:text-red-600 disabled:opacity-60"
        aria-label="Eliminar"
      >
        🗑
      </button>
    </div>
  );
}
