"use client";

import { useRef, useState, useTransition } from "react";
import { crearBloque } from "./actions";

export function NewBlockForm() {
  const [valor, setValor] = useState("");
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nombre = valor.trim();
    if (!nombre) return;

    setValor("");
    startTransition(async () => {
      await crearBloque(nombre);
      inputRef.current?.focus();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 rounded-2xl border border-dashed border-border-strong bg-card p-4"
    >
      <div className="text-[13px] font-bold text-ink-soft">Nuevo bloque</div>
      <input
        ref={inputRef}
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        placeholder="Nombre del bloque"
        disabled={isPending}
        className="rounded-lg border border-border-strong bg-surface px-2.5 py-2.5 text-sm text-ink outline-none disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={isPending || !valor.trim()}
        className="rounded-lg bg-accent py-2.5 text-sm font-bold text-surface disabled:opacity-40"
      >
        Agregar bloque
      </button>
    </form>
  );
}
