"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { BlockItem } from "./block-item";
import { reordenarBloques } from "./actions";

interface Bloque {
  id: string;
  name: string;
}

interface BlockManagerProps {
  bloquesIniciales: Bloque[];
}

export function BlockManager({ bloquesIniciales }: BlockManagerProps) {
  const [bloques, setBloques] = useState(bloquesIniciales);
  const [, startTransition] = useTransition();

  // Sincroniza con la data del servidor cada vez que una acción revalida /bloques
  // (creación, renombrado, eliminación de otro bloque). Ajustar estado durante el
  // render en vez de con un efecto evita un render extra en cada sync.
  const [prevBloquesIniciales, setPrevBloquesIniciales] = useState(bloquesIniciales);
  if (bloquesIniciales !== prevBloquesIniciales) {
    setPrevBloquesIniciales(bloquesIniciales);
    setBloques(bloquesIniciales);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = bloques.findIndex((b) => b.id === active.id);
    const newIndex = bloques.findIndex((b) => b.id === over.id);
    const reordenados = arrayMove(bloques, oldIndex, newIndex);

    setBloques(reordenados);
    startTransition(async () => {
      await reordenarBloques(reordenados.map((b) => b.id));
    });
  }

  if (bloques.length === 0) {
    return (
      <p className="text-sm text-ink-soft">
        Todavía no tenés bloques. Agregá el primero abajo.
      </p>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={bloques.map((b) => b.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2.5">
          {bloques.map((bloque, i) => (
            <BlockItem key={bloque.id} blockId={bloque.id} name={bloque.name} index={i} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
