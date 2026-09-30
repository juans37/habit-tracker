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
import { HabitItem } from "./habit-item";
import { reorderHabits } from "./actions";

interface Habit {
  id: string;
  name: string;
  times_per_week: number;
}

interface HabitManagerProps {
  initialHabits: Habit[];
}

export function HabitManager({ initialHabits }: HabitManagerProps) {
  const [habits, setHabits] = useState(initialHabits);
  const [, startTransition] = useTransition();

  // Syncs with server data whenever an action revalidates /habits (create, edit, delete
  // another habit). Adjusting state during render instead of in an effect avoids an extra
  // render on every sync.
  const [prevInitialHabits, setPrevInitialHabits] = useState(initialHabits);
  if (initialHabits !== prevInitialHabits) {
    setPrevInitialHabits(initialHabits);
    setHabits(initialHabits);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = habits.findIndex((h) => h.id === active.id);
    const newIndex = habits.findIndex((h) => h.id === over.id);
    const reordered = arrayMove(habits, oldIndex, newIndex);

    setHabits(reordered);
    startTransition(async () => {
      await reorderHabits(reordered.map((h) => h.id));
    });
  }

  if (habits.length === 0) {
    return <p className="text-sm text-ink-soft">No habits yet. Add your first one below.</p>;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={habits.map((h) => h.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2.5">
          {habits.map((habit, i) => (
            <HabitItem
              key={habit.id}
              habitId={habit.id}
              name={habit.name}
              timesPerWeek={habit.times_per_week}
              index={i}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
