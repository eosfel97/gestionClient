"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Phone,
  Mail,
  Users,
  FileText,
  MessageSquare,
  ChevronLeft,
  Trash2,
  Pencil,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button, Card, Badge, Modal } from "@/components/ui";
import { interactionsApi, clientsApi } from "@/lib/api";
import {
  Interaction,
  TypeInteraction,
  Client,
  PaginatedResponse,
} from "@/types";
import {
  cn,
  formatDateTime,
  formatRelativeDate,
  typeInteractionConfig,
} from "@/lib/utils";

const iconMap: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  Phone,
  Mail,
  Users,
  FileText,
};

const TYPE_FILTERS: { value: TypeInteraction | "TOUS"; label: string }[] = [
  { value: "TOUS", label: "Tous" },
  { value: "APPEL", label: "Appels" },
  { value: "EMAIL", label: "Emails" },
  { value: "REUNION", label: "Réunions" },
  { value: "NOTE", label: "Notes" },
];

export default function InteractionsPage() {
  const [data, setData] = useState<PaginatedResponse<Interaction> | null>(null);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);

  const [typeFilter, setTypeFilter] = useState<TypeInteraction | "TOUS">(
    "TOUS",
  );
  const [clientFilter, setClientFilter] = useState<number>(0);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingInteraction, setEditingInteraction] =
    useState<Interaction | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Interaction | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [form, setForm] = useState({
    type: "APPEL" as TypeInteraction,
    sujet: "",
    contenu: "",
    clientId: 0,
  });

  // ─── Fetch ───
  const fetchInteractions = useCallback(async () => {
    setLoading(true);
    try {
      let response: PaginatedResponse<Interaction>;

      if (clientFilter > 0 && typeFilter !== "TOUS") {
        response = await interactionsApi.getByClientAndType(
          clientFilter,
          typeFilter,
          { page, taille: pageSize },
        );
      } else if (clientFilter > 0) {
        response = await interactionsApi.getByClientId(clientFilter, {
          page,
          taille: pageSize,
        });
      } else if (typeFilter !== "TOUS") {
        const recent = await interactionsApi.getRecent();
        const filtered = recent.filter((i) => i.type === typeFilter);
        response = {
          contenu: filtered,
          pageActuelle: 0,
          taillePage: filtered.length,
          totalElements: filtered.length,
          totalPages: 1,
          premiere: true,
          derniere: true,
        };
      } else {
        const recent = await interactionsApi.getRecent();
        response = {
          contenu: recent,
          pageActuelle: 0,
          taillePage: recent.length,
          totalElements: recent.length,
          totalPages: 1,
          premiere: true,
          derniere: true,
        };
      }

      setData(response);
    } catch (error) {
      console.error("Erreur chargement interactions:", error);
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, clientFilter]);

  const fetchClients = useCallback(async () => {
    try {
      const res = await clientsApi.getAll({ taille: 100 });
      setClients(res.contenu || []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchInteractions();
  }, [fetchInteractions]);
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // ─── Handlers ───
  const resetForm = () => {
    setForm({ type: "APPEL", sujet: "", contenu: "", clientId: 0 });
  };

  const openCreate = () => {
    setEditingInteraction(null);
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (interaction: Interaction) => {
    setEditingInteraction(interaction);
    setForm({
      type: interaction.type,
      sujet: interaction.sujet || "",
      contenu: interaction.contenu || "",
      clientId: interaction.clientId,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.sujet.trim() || !form.contenu.trim() || !form.clientId) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    setFormLoading(true);
    try {
      if (editingInteraction) {
        await interactionsApi.update(editingInteraction.id, form);
        toast.success("Interaction modifiée");
      } else {
        await interactionsApi.create(form);
        toast.success("Interaction ajoutée");
      }
      setModalOpen(false);
      resetForm();
      setEditingInteraction(null);
      fetchInteractions();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await interactionsApi.delete(deleteTarget.id);
      toast.success("Interaction supprimée");
      setDeleteTarget(null);
      fetchInteractions();
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeleteLoading(false);
    }
  };

  const interactions = data?.contenu || [];
  const totalPages = data?.totalPages || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Interactions</h1>
          <p className="text-sm text-text-secondary mt-1">
            Timeline de vos échanges clients
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openCreate}>
          Nouvelle interaction
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="flex gap-2 flex-wrap">
          {TYPE_FILTERS.map((f) => {
            const config =
              f.value !== "TOUS" ? typeInteractionConfig[f.value] : null;
            return (
              <button
                key={f.value}
                onClick={() => {
                  setTypeFilter(f.value);
                  setPage(0);
                }}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 border whitespace-nowrap flex items-center gap-1.5",
                  typeFilter === f.value
                    ? config
                      ? `${config.bg} ${config.color} border-current`
                      : "bg-primary/10 text-primary border-primary/30"
                    : "bg-surface border-glass-border text-text-muted hover:text-text-secondary",
                )}
              >
                {config &&
                  (() => {
                    const Icon = iconMap[config.icon];
                    return <Icon size={14} />;
                  })()}
                {f.label}
              </button>
            );
          })}
        </div>

        <select
          value={clientFilter}
          onChange={(e) => {
            setClientFilter(Number(e.target.value));
            setPage(0);
          }}
          className={cn(
            "px-4 py-2 rounded-xl text-sm text-text-primary",
            "bg-surface border border-glass-border",
            "focus:border-primary/50 focus:outline-none",
          )}
        >
          <option value={0} className="bg-surface">
            Tous les clients
          </option>
          {clients.map((c) => (
            <option key={c.id} value={c.id} className="bg-surface">
              {c.prenom} {c.nom}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="skeleton w-10 h-10 rounded-xl flex-shrink-0" />
                <div
                  className="skeleton h-24 flex-1 rounded-xl"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              </div>
            ))}
          </div>
        ) : interactions.length === 0 ? (
          <Card className="py-16 text-center">
            <MessageSquare size={40} className="text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary font-medium">
              Aucune interaction trouvée
            </p>
            <p className="text-sm text-text-muted mt-1">
              {typeFilter !== "TOUS" || clientFilter > 0
                ? "Essayez de modifier vos filtres"
                : "Commencez par enregistrer votre première interaction"}
            </p>
            {typeFilter === "TOUS" && clientFilter === 0 && (
              <Button
                icon={<Plus size={14} />}
                onClick={openCreate}
                size="sm"
                className="mt-4"
              >
                Première interaction
              </Button>
            )}
          </Card>
        ) : (
          <div className="relative">
            <div className="absolute left-[19px] top-6 bottom-6 w-px bg-glass-border" />

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {interactions.map((interaction, i) => {
                  const config = typeInteractionConfig[interaction.type];
                  const Icon = iconMap[config.icon];
                  return (
                    <motion.div
                      key={interaction.id}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex gap-4 relative group"
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 z-10 transition-all",
                          config.bg,
                          "group-hover:shadow-lg",
                        )}
                      >
                        <Icon size={18} className={config.color} />
                      </div>

                      <Card padding="sm" hover className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge color={config.color} bg={config.bg}>
                              {config.label}
                            </Badge>
                            <span className="text-sm font-medium text-text-primary">
                              {interaction.clientPrenom} {interaction.clientNom}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEdit(interaction)}
                              className="p-1 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(interaction)}
                              className="p-1 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={13} />
                            </button>
                            <span className="text-[10px] text-text-muted ml-1">
                              {formatDateTime(interaction.dateInteraction)}
                            </span>
                          </div>
                        </div>
                        {/* Sujet en titre */}
                        <p className="text-sm font-medium text-text-primary mb-1">
                          {interaction.sujet}
                        </p>
                        {/* Contenu */}
                        <p className="text-sm text-text-secondary leading-relaxed">
                          {interaction.contenu}
                        </p>
                        <p className="text-[11px] text-text-muted mt-2">
                          {formatRelativeDate(interaction.dateInteraction)}
                        </p>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-muted">
            Page {page + 1} sur {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<ChevronLeft size={14} />}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Précédent
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingInteraction(null);
          resetForm();
        }}
        title={
          editingInteraction ? "Modifier l'interaction" : "Nouvelle interaction"
        }
        size="md"
      >
        <div className="space-y-4">
          {/* Type selector */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-secondary">
              Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["APPEL", "EMAIL", "REUNION", "NOTE"] as TypeInteraction[]).map(
                (type) => {
                  const config = typeInteractionConfig[type];
                  const Icon = iconMap[config.icon];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, type }))}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium transition-all border",
                        form.type === type
                          ? `${config.bg} ${config.color} border-current`
                          : "bg-surface border-glass-border text-text-muted hover:text-text-secondary",
                      )}
                    >
                      <Icon size={18} />
                      {config.label}
                    </button>
                  );
                },
              )}
            </div>
          </div>

          {/* Client */}
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
                "focus:border-primary/50 focus:outline-none",
              )}
            >
              <option value={0} className="bg-surface">
                Sélectionner un client...
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id} className="bg-surface">
                  {c.prenom} {c.nom} — {c.entreprise}
                </option>
              ))}
            </select>
          </div>

          {/* Sujet */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-secondary">
              Sujet <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={form.sujet}
              onChange={(e) =>
                setForm((p) => ({ ...p, sujet: e.target.value }))
              }
              placeholder="Sujet de l'interaction..."
              className={cn(
                "w-full px-4 py-3 rounded-xl text-sm text-text-primary placeholder-text-muted",
                "bg-surface border border-glass-border",
                "focus:border-primary/50 focus:outline-none",
              )}
            />
          </div>

          {/* Contenu */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-secondary">
              Contenu <span className="text-danger">*</span>
            </label>
            <textarea
              rows={4}
              value={form.contenu}
              onChange={(e) =>
                setForm((p) => ({ ...p, contenu: e.target.value }))
              }
              placeholder="Détails de l'interaction..."
              className={cn(
                "w-full px-4 py-3 rounded-xl text-sm text-text-primary placeholder-text-muted resize-none",
                "bg-surface border border-glass-border",
                "focus:border-primary/50 focus:outline-none",
              )}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              loading={formLoading}
              onClick={handleSubmit}
              className="flex-1"
            >
              {editingInteraction ? "Enregistrer" : "Ajouter"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setModalOpen(false);
                setEditingInteraction(null);
                resetForm();
              }}
            >
              Annuler
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirmer la suppression"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Supprimer cette interaction ? Cette action est irréversible.
          </p>
          <div className="flex gap-3">
            <Button
              variant="danger"
              loading={deleteLoading}
              onClick={handleDelete}
              className="flex-1"
            >
              Supprimer
            </Button>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Annuler
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
