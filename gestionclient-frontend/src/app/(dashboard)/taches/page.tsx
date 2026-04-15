"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import {
  Plus,
  CheckSquare,
  Clock,
  Loader2,
  GripVertical,
  Calendar,
  User,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button, Badge, Modal } from "@/components/ui";
import { tachesApi, clientsApi } from "@/lib/api";
import { Tache, StatutTache, PrioriteTache, Client } from "@/types";
import {
  cn,
  formatDate,
  isOverdue,
  prioriteTacheConfig,
  statutTacheConfig,
} from "@/lib/utils";

// ─── Column config ───
const COLUMNS: {
  id: StatutTache;
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}[] = [
  {
    id: "A_FAIRE",
    label: "À faire",
    icon: <Clock size={16} />,
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    id: "EN_COURS",
    label: "En cours",
    icon: <Loader2 size={16} />,
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    id: "TERMINEE",
    label: "Terminé",
    icon: <CheckSquare size={16} />,
    color: "text-success",
    bg: "bg-success/10",
  },
];

// ─── Draggable Card ───
function DraggableCard({
  tache,
  onClick,
}: {
  tache: Tache;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: tache.id,
      data: { tache },
    });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  const priorite = prioriteTacheConfig[tache.priorite];
  const overdue = tache.statut !== "TERMINEE" && isOverdue(tache.dateEcheance);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "glass rounded-xl p-4 transition-all duration-200 group",
        isDragging && "opacity-30 z-50",
        overdue && "border-danger/20",
      )}
    >
      {/* Top row: priority + drag handle */}
      <div className="flex items-center justify-between mb-2.5">
        <Badge color={priorite.color} bg={priorite.bg}>
          {priorite.label}
        </Badge>
        <div
          {...attributes}
          {...listeners}
          className="p-1 cursor-grab active:cursor-grabbing rounded hover:bg-glass transition-colors"
        >
          <GripVertical size={14} className="text-text-muted" />
        </div>
      </div>

      {/* Title — clickable for edit */}
      <button onClick={onClick} className="text-left w-full">
        <p
          className={cn(
            "text-sm font-medium leading-snug hover:text-primary transition-colors",
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

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-glass-border">
        {(tache.clientPrenom || tache.clientNom) && (
          <div className="flex items-center gap-1.5 min-w-0">
            <User size={12} className="text-text-muted flex-shrink-0" />
            <span className="text-[11px] text-text-secondary truncate">
              {tache.clientPrenom} {tache.clientNom}
            </span>
          </div>
        )}
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

// ─── Droppable Column ───
function DroppableColumn({
  column,
  taches,
  onAddClick,
  onCardClick,
  isOver,
}: {
  column: (typeof COLUMNS)[number];
  taches: Tache[];
  onAddClick: () => void;
  onCardClick: (tache: Tache) => void;
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div className="flex flex-col h-full">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center",
              column.bg,
            )}
          >
            <span className={column.color}>{column.icon}</span>
          </div>
          <span className="text-sm font-semibold text-text-primary">
            {column.label}
          </span>
          <span
            className={cn(
              "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
              column.bg,
              column.color,
            )}
          >
            {taches.length}
          </span>
        </div>
        <button
          onClick={onAddClick}
          className="p-1 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Droppable area */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 space-y-2.5 p-2 rounded-xl min-h-[200px] transition-all duration-200",
          "border border-dashed",
          isOver
            ? "border-primary/40 bg-primary/5 shadow-[0_0_30px_rgba(108,99,255,0.08)]"
            : "border-glass-border bg-surface/30",
        )}
      >
        {taches.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-xs text-text-muted">
            Glissez une tâche ici
          </div>
        ) : (
          taches.map((tache) => (
            <DraggableCard
              key={tache.id}
              tache={tache}
              onClick={() => onCardClick(tache)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Main Page ───
export default function TachesPage() {
  const [taches, setTaches] = useState<Record<StatutTache, Tache[]>>({
    A_FAIRE: [],
    EN_COURS: [],
    TERMINEE: [],
  });
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);

  // Drag state
  const [activeTache, setActiveTache] = useState<Tache | null>(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTache, setEditingTache] = useState<Tache | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [form, setForm] = useState({
    titre: "",
    description: "",
    priorite: "MOYENNE" as PrioriteTache,
    dateEcheance: "",
    clientId: 0,
    statut: "A_FAIRE" as StatutTache,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  // ─── Fetch ───
  const fetchTaches = useCallback(async () => {
    setLoading(true);
    try {
      const [aFaire, enCours, terminee] = await Promise.all([
        tachesApi.getByStatut("A_FAIRE", { taille: 50 }),
        tachesApi.getByStatut("EN_COURS", { taille: 50 }),
        tachesApi.getByStatut("TERMINEE", { taille: 50 }),
      ]);
      setTaches({
        A_FAIRE: aFaire.contenu || [],
        EN_COURS: enCours.contenu || [],
        TERMINEE: terminee.contenu || [],
      });
    } catch (error) {
      console.error("Erreur chargement tâches:", error);
      toast.error("Erreur lors du chargement des tâches");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      const data = await clientsApi.getAll({ taille: 100 });
      setClients(data.contenu || []);
    } catch (error) {
      console.error("Erreur chargement clients:", error);
    }
  }, []);

  useEffect(() => {
    fetchTaches();
    fetchClients();
  }, [fetchTaches, fetchClients]);

  // ─── Drag handlers ───
  const findColumn = (tacheId: number): StatutTache | null => {
    for (const col of COLUMNS) {
      if (taches[col.id].some((t) => t.id === tacheId)) return col.id;
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const tache = event.active.data.current?.tache as Tache;
    if (tache) setActiveTache(tache);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const overId = event.over?.id;
    if (
      overId &&
      ["A_FAIRE", "EN_COURS", "TERMINEE"].includes(String(overId))
    ) {
      setOverColumn(String(overId));
    } else {
      setOverColumn(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTache(null);
    setOverColumn(null);

    if (!over) return;

    const tacheId = Number(active.id);
    const sourceCol = findColumn(tacheId);

    // Target is always a column droppable
    const targetCol = String(over.id) as StatutTache;

    if (
      !sourceCol ||
      !["A_FAIRE", "EN_COURS", "TERMINEE"].includes(targetCol) ||
      sourceCol === targetCol
    )
      return;

    // Optimistic update
    const tache = taches[sourceCol].find((t) => t.id === tacheId);
    if (!tache) return;

    const updatedTache = { ...tache, statut: targetCol };

    setTaches((prev) => ({
      ...prev,
      [sourceCol]: prev[sourceCol].filter((t) => t.id !== tacheId),
      [targetCol]: [...prev[targetCol], updatedTache],
    }));

    try {
      await tachesApi.updateStatus(tacheId, targetCol);
      toast.success(`Tâche déplacée → ${statutTacheConfig[targetCol].label}`);
    } catch (error) {
      console.error("Erreur changement statut:", error);
      toast.error("Erreur lors du déplacement");
      setTaches((prev) => ({
        ...prev,
        [targetCol]: prev[targetCol].filter((t) => t.id !== tacheId),
        [sourceCol]: [...prev[sourceCol], tache],
      }));
    }
  };

  // ─── CRUD ───
  const resetForm = () => {
    setForm({
      titre: "",
      description: "",
      priorite: "MOYENNE",
      dateEcheance: "",
      clientId: 0,
      statut: "A_FAIRE",
    });
  };

  const openCreate = (statut?: StatutTache) => {
    setEditingTache(null);
    resetForm();
    if (statut) setForm((p) => ({ ...p, statut }));
    setModalOpen(true);
  };

  const openEdit = (tache: Tache) => {
    setEditingTache(tache);
    setForm({
      titre: tache.titre,
      description: tache.description,
      priorite: tache.priorite,
      dateEcheance: tache.dateEcheance ? tache.dateEcheance.slice(0, 10) : "",
      clientId: tache.clientId,
      statut: tache.statut,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.titre.trim() || !form.dateEcheance || !form.clientId) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    setFormLoading(true);
    try {
      if (editingTache) {
        await tachesApi.update(editingTache.id, form);
        toast.success("Tâche modifiée");
      } else {
        await tachesApi.create(form);
        toast.success("Tâche créée");
      }
      setModalOpen(false);
      resetForm();
      setEditingTache(null);
      fetchTaches();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await tachesApi.delete(id);
      toast.success("Tâche supprimée");
      setModalOpen(false);
      setEditingTache(null);
      fetchTaches();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const totalTaches =
    taches.A_FAIRE.length + taches.EN_COURS.length + taches.TERMINEE.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Tâches</h1>
          <p className="text-sm text-text-secondary mt-1">
            {totalTaches} tâche{totalTaches > 1 ? "s" : ""} au total
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => openCreate()}>
          Nouvelle tâche
        </Button>
      </motion.div>

      {/* Kanban Board */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-3">
              <div className="skeleton h-10 rounded-xl" />
              {[0, 1, 2].map((j) => (
                <div
                  key={j}
                  className="skeleton h-32 rounded-xl"
                  style={{ animationDelay: `${j * 0.1}s` }}
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {COLUMNS.map((col, colIndex) => (
              <motion.div
                key={col.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: colIndex * 0.1 }}
              >
                <DroppableColumn
                  column={col}
                  taches={taches[col.id]}
                  onAddClick={() => openCreate(col.id)}
                  onCardClick={openEdit}
                  isOver={overColumn === col.id}
                />
              </motion.div>
            ))}
          </div>

          <DragOverlay>
            {activeTache ? (
              <div className="glass rounded-xl p-4 shadow-2xl glow-primary w-72">
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    color={prioriteTacheConfig[activeTache.priorite].color}
                    bg={prioriteTacheConfig[activeTache.priorite].bg}
                  >
                    {prioriteTacheConfig[activeTache.priorite].label}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-text-primary">
                  {activeTache.titre}
                </p>
                {(activeTache.clientPrenom || activeTache.clientNom) && (
                  <p className="text-[11px] text-text-muted mt-2">
                    {activeTache.clientPrenom} {activeTache.clientNom}
                  </p>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTache(null);
          resetForm();
        }}
        title={editingTache ? "Modifier la tâche" : "Nouvelle tâche"}
        size="md"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-secondary">
              Titre <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={form.titre}
              onChange={(e) =>
                setForm((p) => ({ ...p, titre: e.target.value }))
              }
              placeholder="Titre de la tâche"
              className={cn(
                "w-full px-4 py-3 rounded-xl text-sm text-text-primary placeholder-text-muted",
                "bg-surface border border-glass-border",
                "focus:border-primary/50 focus:shadow-[0_0_15px_rgba(108,99,255,0.15)] focus:outline-none",
              )}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-secondary">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Détails de la tâche..."
              className={cn(
                "w-full px-4 py-3 rounded-xl text-sm text-text-primary placeholder-text-muted resize-none",
                "bg-surface border border-glass-border",
                "focus:border-primary/50 focus:shadow-[0_0_15px_rgba(108,99,255,0.15)] focus:outline-none",
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-secondary">
                Client <span className="text-danger">*</span>
              </label>
              <select
                value={form.clientId}
                onChange={(e) =>
                  setForm((p) => ({ ...p, clientId: Number(e.target.value) }))
                }
                className={cn(
                  "w-full px-4 py-3 rounded-xl text-sm text-text-primary",
                  "bg-surface border border-glass-border",
                  "focus:border-primary/50 focus:shadow-[0_0_15px_rgba(108,99,255,0.15)] focus:outline-none",
                )}
              >
                <option value={0} className="bg-surface">
                  Sélectionner...
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id} className="bg-surface">
                    {c.prenom} {c.nom} — {c.entreprise}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-secondary">
                Échéance <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                value={form.dateEcheance}
                onChange={(e) =>
                  setForm((p) => ({ ...p, dateEcheance: e.target.value }))
                }
                className={cn(
                  "w-full px-4 py-3 rounded-xl text-sm text-text-primary",
                  "bg-surface border border-glass-border",
                  "focus:border-primary/50 focus:shadow-[0_0_15px_rgba(108,99,255,0.15)] focus:outline-none",
                )}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-secondary">
              Priorité
            </label>
            <div className="flex gap-2">
              {(["HAUTE", "MOYENNE", "BASSE"] as PrioriteTache[]).map((p) => {
                const config = {
                  HAUTE: {
                    label: "Haute",
                    color: "text-danger",
                    bg: "bg-danger/10",
                  },
                  MOYENNE: {
                    label: "Moyenne",
                    color: "text-warning",
                    bg: "bg-warning/10",
                  },
                  BASSE: {
                    label: "Basse",
                    color: "text-success",
                    bg: "bg-success/10",
                  },
                };
                const c = config[p];
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, priorite: p }))
                    }
                    className={cn(
                      "flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all border text-center",
                      form.priorite === p
                        ? `${c.bg} ${c.color} border-current`
                        : "bg-surface border-glass-border text-text-muted hover:text-text-secondary",
                    )}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {editingTache && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-secondary">
                Statut
              </label>
              <div className="flex gap-2">
                {COLUMNS.map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, statut: col.id }))
                    }
                    className={cn(
                      "flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all border text-center",
                      form.statut === col.id
                        ? `${col.bg} ${col.color} border-current`
                        : "bg-surface border-glass-border text-text-muted hover:text-text-secondary",
                    )}
                  >
                    {col.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              loading={formLoading}
              onClick={handleSubmit}
              className="flex-1"
            >
              {editingTache ? "Enregistrer" : "Créer la tâche"}
            </Button>
            {editingTache && (
              <Button
                variant="danger"
                onClick={() => handleDelete(editingTache.id)}
              >
                Supprimer
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => {
                setModalOpen(false);
                setEditingTache(null);
                resetForm();
              }}
            >
              Annuler
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
