import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
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
    <AppShell>
      <div className="flex flex-col gap-5">
        <header>
          <h1 className="font-display text-2xl font-bold text-ink">Bloques</h1>
          <p className="mt-0.5 text-[13px] text-ink-faint">
            Orden fijo de tu secuencia diaria
          </p>
        </header>

        <BlockManager bloquesIniciales={activos} />

        <NewBlockForm />

        {inactivos.length > 0 && (
          <div className="flex flex-col gap-1">
            <h2 className="px-1 text-[12.5px] font-bold tracking-[.04em] text-ink-faint uppercase">
              Eliminados
            </h2>
            {inactivos.map((bloque) => (
              <div key={bloque.id} className="px-1 py-2 text-[14.5px] text-ink-faint line-through">
                {bloque.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
