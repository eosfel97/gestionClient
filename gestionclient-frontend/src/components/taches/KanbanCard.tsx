"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { GripVertical, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui";
import { Tache } from "@/types";
import { cn, formatDate, isOverdue, prioriteTacheConfig } from "@/lib/utils";

interface KanbanCardProps {
  tache: Tache;
  onClick?: () => void;
}

export default function KanbanCard({ tache, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tache.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorite = prioriteTacheConfig[tache.priorite];
  const overdue = tache.statut !== "TERMINEE" && isOverdue(tache.dateEcheance);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "glass rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all duration-200 group",
        "hover:border-primary/20 hover:shadow-[0_0_20px_rgba(108,99,255,0.06)]",
        isDragging && "opacity-50 shadow-2xl glow-primary z-50",
        overdue && "border-danger/20",
      )}
      {...attributes}
      {...listeners}
    >
      {/* Top row: priority + grip */}
      <div className="flex items-center justify-between mb-2.5">
        <Badge color={priorite.color} bg={priorite.bg}>
          {priorite.label}
        </Badge>
        <GripVertical
          size={14}
          className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>

      {/* Title */}
      <button onClick={onClick} className="text-left w-full">
        <p
          className={cn(
            "text-sm font-medium leading-snug",
            tache.statut === "TERMINEE"
              ? "text-text-muted line-through"
              : "text-text-primary",
          )}
        >
          {tache.titre}
        </p>
      </button>

      {/* Description preview */}
      {tache.description && (
        <p className="text-xs text-text-muted mt-1.5 line-clamp-2 leading-relaxed">
          {tache.description}
        </p>
      )}

      {/* Bottom row: client + date */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-glass-border">
        {/* Client */}
        {(tache.clientPrenom || tache.clientNom) && (
          <div className="flex items-center gap-1.5 min-w-0">
            <User size={12} className="text-text-muted flex-shrink-0" />
            <span className="text-[11px] text-text-secondary truncate">
              {tache.clientPrenom} {tache.clientNom}
            </span>
          </div>
        )}

        {/* Due date */}
        <div
          className={cn(
            "flex items-center gap-1 flex-shrink-0",
            overdue ? "text-danger" : "text-text-muted",
          )}
        >
          <Calendar size={11} />
          <span className={cn("text-[11px]", overdue && "font-medium")}>
            {formatDate(tache.dateEcheance)}
          </span>
        </div>
      </div>
    </div>
  );
}
