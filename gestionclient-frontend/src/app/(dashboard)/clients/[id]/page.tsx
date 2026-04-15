"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Pencil,
  Trash2,
  Plus,
  FileText,
  CheckSquare,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button, Card, Badge, Modal, Skeleton } from "@/components/ui";
import ClientForm from "@/components/clients/ClientForm";
import { clientsApi, interactionsApi, tachesApi } from "@/lib/api";
import { Client, Interaction, Tache, TypeInteraction } from "@/types";
import { ClientFormSchema } from "@/lib/utils/schemas";
import {
  cn,
  formatDate,
  formatDateTime,
  formatRelativeDate,
  isOverdue,
  getInitials,
  statutClientConfig,
  typeInteractionConfig,
  statutTacheConfig,
  prioriteTacheConfig,
} from "@/lib/utils";

import {
  Phone as PhoneIcon,
  Mail as MailIcon,
  Users as MeetIcon,
  FileText as NoteIcon,
} from "lucide-react";

const interactionIconMap: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  Phone: PhoneIcon,
  Mail: MailIcon,
  Users: MeetIcon,
  FileText: NoteIcon,
};

type Tab = "infos" | "interactions" | "taches";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = Number(params.id);

  const [client, setClient] = useState<Client | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [taches, setTaches] = useState<Tache[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<Tab>("infos");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Interaction form — matches InteractionRequest DTO
  const [interactionModalOpen, setInteractionModalOpen] = useState(false);
  const [interactionLoading, setInteractionLoading] = useState(false);
  const [newInteraction, setNewInteraction] = useState({
    type: "APPEL" as TypeInteraction,
    sujet: "",
    contenu: "",
  });

  const fetchClient = useCallback(async () => {
    try {
      const data = await clientsApi.getById(clientId);
      setClient(data);
    } catch {
      toast.error("Client introuvable");
      router.push("/clients");
    }
  }, [clientId, router]);

  const fetchInteractions = useCallback(async () => {
    try {
      const data = await interactionsApi.getByClientId(clientId);
      setInteractions(data.contenu || []);
    } catch (error) {
      console.error("Erreur chargement interactions:", error);
    }
  }, [clientId]);

  const fetchTaches = useCallback(async () => {
    try {
      const data = await tachesApi.getByClientId(clientId);
      setTaches(data);
    } catch (error) {
      console.error("Erreur chargement tâches:", error);
    }
  }, [clientId]);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchClient(), fetchInteractions(), fetchTaches()]);
      setLoading(false);
    };
    loadAll();
  }, [fetchClient, fetchInteractions, fetchTaches]);

  const handleEdit = async (formData: ClientFormSchema) => {
    setEditLoading(true);
    try {
      const updated = await clientsApi.update(clientId, formData);
      setClient(updated);
      toast.success("Client modifié avec succès");
      setEditModalOpen(false);
    } catch {
      toast.error("Erreur lors de la modification");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await clientsApi.delete(clientId);
      toast.success("Client supprimé");
      router.push("/clients");
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAddInteraction = async () => {
    if (!newInteraction.sujet.trim() || !newInteraction.contenu.trim()) {
      toast.error("Veuillez remplir le sujet et le contenu");
      return;
    }
    setInteractionLoading(true);
    try {
      await interactionsApi.create({
        type: newInteraction.type,
        sujet: newInteraction.sujet,
        contenu: newInteraction.contenu,
        clientId,
      });
      toast.success("Interaction ajoutée");
      setInteractionModalOpen(false);
      setNewInteraction({ type: "APPEL", sujet: "", contenu: "" });
      fetchInteractions();
    } catch {
      toast.error("Erreur lors de l'ajout");
    } finally {
      setInteractionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-48 rounded-2xl col-span-1" />
          <Skeleton className="h-48 rounded-2xl col-span-2" />
        </div>
      </div>
    );
  }

  if (!client) return null;

  const statut = statutClientConfig[client.statut];

  const tabs: {
    key: Tab;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    count?: number;
  }[] = [
    { key: "infos", label: "Informations", icon: FileText },
    {
      key: "interactions",
      label: "Interactions",
      icon: MessageSquare,
      count: interactions.length,
    },
    { key: "taches", label: "Tâches", icon: CheckSquare, count: taches.length },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back button + Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => router.push("/clients")}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Retour aux clients
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center glow-primary">
              <span className="text-xl font-bold text-primary">
                {getInitials(client.nom, client.prenom)}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-text-primary">
                  {client.prenom} {client.nom}
                </h1>
                <Badge color={statut.color} bg={statut.bg} size="md">
                  {statut.label}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-1.5 text-sm text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <Building2 size={14} className="text-text-muted" />
                  {client.entreprise}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-text-muted" />
                  Client depuis {formatDate(client.dateCreation)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<Pencil size={14} />}
              onClick={() => setEditModalOpen(true)}
            >
              Modifier
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 size={14} />}
              onClick={() => setDeleteModalOpen(true)}
            >
              Supprimer
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex gap-1 border-b border-glass-border"
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative",
              activeTab === tab.key
                ? "text-primary"
                : "text-text-muted hover:text-text-secondary",
            )}
          >
            <tab.icon size={16} />
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                  activeTab === tab.key
                    ? "bg-primary/10 text-primary"
                    : "bg-glass text-text-muted",
                )}
              >
                {tab.count}
              </span>
            )}
            {activeTab === tab.key && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
              />
            )}
          </button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* ─── INFOS TAB ─── */}
        {activeTab === "infos" && (
          <motion.div
            key="infos"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField
                  icon={<Mail size={16} />}
                  label="Email"
                  value={client.email}
                />
                <InfoField
                  icon={<Phone size={16} />}
                  label="Téléphone"
                  value={client.telephone}
                />
                <InfoField
                  icon={<Building2 size={16} />}
                  label="Entreprise"
                  value={client.entreprise}
                />
                <InfoField
                  icon={<MapPin size={16} />}
                  label="Adresse"
                  value={client.adresse || "Non renseignée"}
                  muted={!client.adresse}
                />
                <div className="md:col-span-2">
                  <InfoField
                    icon={<FileText size={16} />}
                    label="Notes"
                    value={client.notes || "Aucune note"}
                    muted={!client.notes}
                  />
                </div>
                <InfoField
                  icon={<Calendar size={16} />}
                  label="Créé le"
                  value={formatDateTime(client.dateCreation)}
                />
                <InfoField
                  icon={<Calendar size={16} />}
                  label="Modifié le"
                  value={formatDateTime(client.dateModification)}
                />
              </div>
            </Card>
          </motion.div>
        )}

        {/* ─── INTERACTIONS TAB ─── */}
        {activeTab === "interactions" && (
          <motion.div
            key="interactions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="flex justify-end">
              <Button
                size="sm"
                icon={<Plus size={14} />}
                onClick={() => setInteractionModalOpen(true)}
              >
                Ajouter une interaction
              </Button>
            </div>

            {interactions.length === 0 ? (
              <Card className="py-12 text-center">
                <MessageSquare
                  size={32}
                  className="text-text-muted mx-auto mb-3"
                />
                <p className="text-text-secondary">
                  Aucune interaction enregistrée
                </p>
                <Button
                  size="sm"
                  icon={<Plus size={14} />}
                  onClick={() => setInteractionModalOpen(true)}
                  className="mt-4"
                >
                  Première interaction
                </Button>
              </Card>
            ) : (
              <div className="relative">
                <div className="absolute left-[19px] top-4 bottom-4 w-px bg-glass-border" />
                <div className="space-y-4">
                  {interactions.map((interaction, i) => {
                    const config = typeInteractionConfig[interaction.type];
                    const Icon = interactionIconMap[config.icon];
                    return (
                      <motion.div
                        key={interaction.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex gap-4 relative"
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 z-10",
                            config.bg,
                          )}
                        >
                          <Icon size={18} className={config.color} />
                        </div>
                        <Card padding="sm" className="flex-1">
                          <div className="flex items-start justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <Badge color={config.color} bg={config.bg}>
                                {config.label}
                              </Badge>
                              <span className="text-xs text-text-muted">
                                {formatDateTime(interaction.dateCreation)}
                              </span>
                            </div>
                            <span className="text-[10px] text-text-muted">
                              {formatRelativeDate(interaction.dateCreation)}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-text-primary mb-1">
                            {interaction.sujet}
                          </p>
                          <p className="text-sm text-text-secondary leading-relaxed">
                            {interaction.contenu}
                          </p>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ─── TACHES TAB ─── */}
        {activeTab === "taches" && (
          <motion.div
            key="taches"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="flex justify-end">
              <Button
                size="sm"
                icon={<Plus size={14} />}
                onClick={() => router.push("/taches")}
              >
                Gérer les tâches
              </Button>
            </div>

            {taches.length === 0 ? (
              <Card className="py-12 text-center">
                <CheckSquare
                  size={32}
                  className="text-text-muted mx-auto mb-3"
                />
                <p className="text-text-secondary">Aucune tâche associée</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {taches.map((tache, i) => {
                  const tacheStatut = statutTacheConfig[tache.statut];
                  const priorite = prioriteTacheConfig[tache.priorite];
                  const overdue =
                    tache.statut !== "TERMINEE" &&
                    isOverdue(tache.dateEcheance);
                  return (
                    <motion.div
                      key={tache.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Card
                        padding="sm"
                        hover
                        className={cn(
                          "flex items-center gap-4 px-5 py-3.5",
                          overdue && "border-danger/20",
                        )}
                      >
                        <div
                          className={cn(
                            "w-2.5 h-2.5 rounded-full flex-shrink-0",
                            tache.priorite === "HAUTE" && "bg-danger",
                            tache.priorite === "MOYENNE" && "bg-warning",
                            tache.priorite === "BASSE" && "bg-success",
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-sm font-medium truncate",
                              tache.statut === "TERMINEE"
                                ? "text-text-muted line-through"
                                : "text-text-primary",
                            )}
                          >
                            {tache.titre}
                          </p>
                          <p className="text-xs text-text-muted mt-0.5 truncate">
                            {tache.description}
                          </p>
                        </div>
                        <Badge color={tacheStatut.color} bg={tacheStatut.bg}>
                          {tacheStatut.label}
                        </Badge>
                        <Badge color={priorite.color} bg={priorite.bg}>
                          {priorite.label}
                        </Badge>
                        <span
                          className={cn(
                            "text-xs whitespace-nowrap",
                            overdue
                              ? "text-danger font-medium"
                              : "text-text-muted",
                          )}
                        >
                          {overdue && "⚠ "}
                          {formatDate(tache.dateEcheance)}
                        </span>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── MODALS ─── */}

      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Modifier le client"
        size="lg"
      >
        <ClientForm
          initialData={client}
          onSubmit={handleEdit}
          onCancel={() => setEditModalOpen(false)}
          loading={editLoading}
        />
      </Modal>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmer la suppression"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Êtes-vous sûr de vouloir supprimer{" "}
            <span className="font-semibold text-text-primary">
              {client.prenom} {client.nom}
            </span>{" "}
            ainsi que toutes ses interactions et tâches associées ? Cette action
            est irréversible.
          </p>
          <div className="flex gap-3">
            <Button
              variant="danger"
              loading={deleteLoading}
              onClick={handleDelete}
              className="flex-1"
            >
              Supprimer définitivement
            </Button>
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
            >
              Annuler
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Interaction Modal — uses sujet + contenu */}
      <Modal
        isOpen={interactionModalOpen}
        onClose={() => setInteractionModalOpen(false)}
        title="Nouvelle interaction"
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
                  const Icon = interactionIconMap[config.icon];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setNewInteraction((prev) => ({ ...prev, type }))
                      }
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium transition-all border",
                        newInteraction.type === type
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

          {/* Sujet */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-secondary">
              Sujet <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={newInteraction.sujet}
              onChange={(e) =>
                setNewInteraction((prev) => ({
                  ...prev,
                  sujet: e.target.value,
                }))
              }
              placeholder="Sujet de l'interaction..."
              className={cn(
                "w-full px-4 py-3 rounded-xl text-sm text-text-primary placeholder-text-muted",
                "bg-surface border border-glass-border",
                "focus:border-primary/50 focus:shadow-[0_0_15px_rgba(108,99,255,0.15)] focus:outline-none",
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
              placeholder="Détails de l'interaction..."
              value={newInteraction.contenu}
              onChange={(e) =>
                setNewInteraction((prev) => ({
                  ...prev,
                  contenu: e.target.value,
                }))
              }
              className={cn(
                "w-full px-4 py-3 rounded-xl text-sm text-text-primary placeholder-text-muted resize-none",
                "bg-surface border border-glass-border",
                "focus:border-primary/50 focus:shadow-[0_0_15px_rgba(108,99,255,0.15)] focus:outline-none",
              )}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              loading={interactionLoading}
              onClick={handleAddInteraction}
              className="flex-1"
              disabled={
                !newInteraction.sujet.trim() || !newInteraction.contenu.trim()
              }
            >
              Ajouter l&apos;interaction
            </Button>
            <Button
              variant="secondary"
              onClick={() => setInteractionModalOpen(false)}
            >
              Annuler
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function InfoField({
  icon,
  label,
  value,
  muted,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-text-muted">
        {icon}
        {label}
      </div>
      <p
        className={cn(
          "text-sm",
          muted ? "text-text-muted italic" : "text-text-primary",
        )}
      >
        {value}
      </p>
    </div>
  );
}
