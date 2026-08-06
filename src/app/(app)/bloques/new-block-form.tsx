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
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        ref={inputRef}
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        placeholder="Nuevo bloque"
        disabled={isPending}
        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-[15px] outline-none disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={isPending || !valor.trim()}
        className="shrink-0 rounded-lg bg-black px-4 py-2 text-[15px] text-white disabled:opacity-40"
      >
        Agregar
      </button>
    </form>
  );
}
