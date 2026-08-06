import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BlockManager } from "./block-manager";
import { NewBlockForm } from "./new-block-form";

export default async function BloquesPage() {
  const supabase = await createClient();

  const { data: bloques } = await supabase
    .from("blocks")
    .select("id, name, is_active")
    .order("order_index", { ascending: true });

  const activos = (bloques ?? []).filter((b) => b.is_active);
  const inactivos = (bloques ?? []).filter((b) => !b.is_active);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-8 p-6">
      <header className="flex items-baseline justify-between">
        <h1 className="text-xl font-semibold">Bloques</h1>
        <nav className="flex gap-3 text-sm text-gray-500">
          <Link href="/hoy" className="hover:text-gray-900">
            ‹ Hoy
          </Link>
          <Link href="/estadisticas" className="hover:text-gray-900">
            Stats
          </Link>
        </nav>
      </header>

      <BlockManager bloquesIniciales={activos} />

      <NewBlockForm />

      {inactivos.length > 0 && (
        <div className="flex flex-col gap-0.5">
          <h2 className="px-3 text-xs font-medium tracking-wide text-gray-400 uppercase">
            Eliminados
          </h2>
          {inactivos.map((bloque) => (
            <div
              key={bloque.id}
              className="px-3 py-2 text-[15px] text-gray-400 line-through"
            >
              {bloque.name}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
