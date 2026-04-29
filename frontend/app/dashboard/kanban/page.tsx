"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, GripVertical } from "lucide-react";
import { applicationsAPI } from "@/lib/api";
import { useUIStore } from "@/lib/store";
import type { Application } from "../../lib/store";
import { STATUS_COLORS } from "@/lib/utils";

type Status = "Applied" | "Interview" | "Offer" | "Rejected";

const COLUMNS: Status[] = ["Applied", "Interview", "Offer", "Rejected"];

// ─── Card ─────────────────────────────────────────
function Card({ app }: { app: Application }) {
  const { openModal } = useUIStore();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: app._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-3 rounded border border-white/10 bg-white/5 cursor-pointer"
      onClick={() => openModal(app, "view")}
    >
      <div className="flex gap-2">
        <button {...listeners} {...attributes}>
          <GripVertical size={14} />
        </button>

        <div>
          <div className="text-white text-sm font-medium">
            {app.companyName}
          </div>
          <div className="text-white/40 text-xs">{app.role}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────
export default function KanbanPage() {
  const { openModal } = useUIStore();

  const [columns, setColumns] = useState<Record<Status, Application[]>>({
    Applied: [],
    Interview: [],
    Offer: [],
    Rejected: [],
  });

  const [loading, setLoading] = useState(true);

  const sensors = useSensors(useSensor(PointerSensor));

  // ✅ FIXED (NO ARGUMENTS)
  const fetchApplications = useCallback(async () => {
    try {
      const data = await applicationsAPI.getAll();

      const grouped: Record<Status, Application[]> = {
        Applied: [],
        Interview: [],
        Offer: [],
        Rejected: [],
      };

      data.applications.forEach((app: Application) => {
        grouped[app.status].push(app);
      });

      setColumns(grouped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  if (loading) return <p className="text-white">Loading...</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between">
        <h1 className="text-2xl text-white font-bold">Kanban</h1>
        <button onClick={() => openModal()} className="btn-primary">
          <Plus size={16} /> Add
        </button>
      </div>

      {/* Board */}
      <DndContext sensors={sensors} collisionDetection={closestCenter}>
        <div className="grid grid-cols-4 gap-4">
          {COLUMNS.map((col) => (
            <div key={col} className="space-y-2">
              <h2 className="text-white/60 text-sm">{col}</h2>

              <SortableContext
                items={columns[col].map((a) => a._id)}
                strategy={verticalListSortingStrategy}
              >
                {columns[col].map((app) => (
                  <Card key={app._id} app={app} />
                ))}
              </SortableContext>
            </div>
          ))}
        </div>
      </DndContext>
    </div>
  );
}