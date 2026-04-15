"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Users,
  Building2,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button, Card, Badge, Modal, Skeleton } from "@/components/ui";
import ClientForm from "@/components/clients/ClientForm";
import { clientsApi } from "@/lib/api";
import { Client, StatutClient, PaginatedResponse } from "@/types";
import { ClientFormSchema } from "@/lib/utils/schemas";
import { cn, formatDate, getInitials, statutClientConfig } from "@/lib/utils";

const STATUT_FILTERS: { value: StatutClient | "TOUS"; label: string }[] = [
  { value: "TOUS", label: "Tous" },
  { value: "PROSPECT", label: "Prospects" },
  { value: "ACTIF", label: "Actifs" },
  { value: "INACTIF", label: "Inactifs" },
];

export default function ClientsPage() {
  const router = useRouter();

  // Data state
  const [data, setData] = useState<PaginatedResponse<Client> | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState<StatutClient | "TOUS">(
    "TOUS",
  );
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(
    undefined,
  );
  const [formLoading, setFormLoading] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch clients
const fetchClients = useCallback(async () => {
  setLoading(true);
  try {
    const pagination = { page, taille: pageSize };
    let response: PaginatedResponse<Client>;

    if (search.trim()) {
      response = await clientsApi.search(search.trim(), pagination);
    } else if (statutFilter !== "TOUS") {
      response = await clientsApi.getByStatut(statutFilter, pagination);
    } else {
      response = await clientsApi.getAll(pagination);
    }

    setData(response);
  } catch (error) {
    console.error("Erreur chargement clients:", error);
    toast.error("Erreur lors du chargement des clients");
  } finally {
    setLoading(false);
  }
}, [page, search, statutFilter]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Debounce search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Handlers
  const handleCreate = async (formData: ClientFormSchema) => {
    setFormLoading(true);
    try {
      await clientsApi.create(formData);
      toast.success("Client créé avec succès");
      setModalOpen(false);
      setEditingClient(undefined);
      fetchClients();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la création");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (formData: ClientFormSchema) => {
    if (!editingClient) return;
    setFormLoading(true);
    try {
      await clientsApi.update(editingClient.id, formData);
      toast.success("Client modifié avec succès");
      setModalOpen(false);
      setEditingClient(undefined);
      fetchClients();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la modification");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await clientsApi.delete(deleteTarget.id);
      toast.success(`${deleteTarget.prenom} ${deleteTarget.nom} supprimé`);
      setDeleteTarget(null);
      fetchClients();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeleteLoading(false);
    }
  };

  const openCreate = () => {
    setEditingClient(undefined);
    setModalOpen(true);
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);
    setModalOpen(true);
  };

  const clients = data?.contenu || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Clients</h1>
          <p className="text-sm text-text-secondary mt-1">
            {totalElements} client{totalElements > 1 ? "s" : ""} au total
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openCreate}>
          Nouveau client
        </Button>
      </motion.div>

      {/* Search + Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        {/* Search bar */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            placeholder="Rechercher par nom, email, entreprise..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-text-primary placeholder-text-muted",
              "bg-surface border border-glass-border",
              "transition-all duration-200",
              "focus:border-primary/50 focus:shadow-[0_0_15px_rgba(108,99,255,0.15)] focus:outline-none",
            )}
          />
        </div>

        {/* Status filter chips */}
        <div className="flex gap-2">
          {STATUT_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setStatutFilter(f.value);
                setPage(0);
              }}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border whitespace-nowrap",
                statutFilter === f.value
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-surface border-glass-border text-text-muted hover:text-text-secondary hover:border-glass-border/80",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card padding="sm" className="overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="skeleton h-16 rounded-xl"
                  style={{ animationDelay: `${i * 0.08}s` }}
                />
              ))}
            </div>
          ) : clients.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users size={28} className="text-primary" />
              </div>
              <p className="text-text-secondary font-medium">
                Aucun client trouvé
              </p>
              <p className="text-sm text-text-muted mt-1">
                {search || statutFilter !== "TOUS"
                  ? "Essayez de modifier vos filtres"
                  : "Commencez par ajouter votre premier client"}
              </p>
              {!search && statutFilter === "TOUS" && (
                <Button
                  icon={<Plus size={16} />}
                  onClick={openCreate}
                  className="mt-4"
                  size="sm"
                >
                  Ajouter un client
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-[1fr_1fr_1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-glass-border text-xs font-semibold text-text-muted uppercase tracking-wider">
                <span>Client</span>
                <span>Email</span>
                <span>Entreprise</span>
                <span>Statut</span>
                <span>Créé le</span>
                <span className="text-right">Actions</span>
              </div>

              {/* Table rows */}
              <div className="divide-y divide-glass-border">
                <AnimatePresence mode="popLayout">
                  {clients.map((client, i) => {
                    const statut = statutClientConfig[client.statut];
                    return (
                      <motion.div
                        key={client.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: i * 0.03 }}
                        className="grid grid-cols-[1fr_1fr_1fr_auto_auto_auto] gap-4 px-5 py-3.5 items-center hover:bg-glass/50 transition-colors group"
                      >
                        {/* Client name + avatar */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary">
                              {getInitials(client.nom, client.prenom)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-text-primary truncate">
                              {client.prenom} {client.nom}
                            </p>
                            {client.telephone && (
                              <p className="text-[11px] text-text-muted truncate">
                                {client.telephone}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Email */}
                        <span className="text-sm text-text-secondary truncate">
                          {client.email}
                        </span>

                        {/* Entreprise */}
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Building2
                            size={13}
                            className="text-text-muted flex-shrink-0"
                          />
                          <span className="text-sm text-text-secondary truncate">
                            {client.entreprise}
                          </span>
                        </div>

                        {/* Statut badge */}
                        <Badge color={statut.color} bg={statut.bg}>
                          {statut.label}
                        </Badge>

                        {/* Date */}
                        <span className="text-xs text-text-muted whitespace-nowrap">
                          {formatDate(client.dateCreation)}
                        </span>

                        {/* Actions */}
                        <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => router.push(`/clients/${client.id}`)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-accent hover:bg-accent/10 transition-all"
                            title="Voir"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => openEdit(client)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all"
                            title="Modifier"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(client)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all"
                            title="Supprimer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </>
          )}
        </Card>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-center justify-between"
        >
          <p className="text-xs text-text-muted">
            Page {page + 1} sur {totalPages} — {totalElements} résultat
            {totalElements > 1 ? "s" : ""}
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

            {/* Page numbers */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (page < 3) {
                  pageNum = i;
                } else if (page > totalPages - 4) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={cn(
                      "w-8 h-8 rounded-lg text-xs font-medium transition-all",
                      page === pageNum
                        ? "bg-primary text-white"
                        : "text-text-muted hover:text-text-primary hover:bg-glass",
                    )}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Suivant
            </Button>
          </div>
        </motion.div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingClient(undefined);
        }}
        title={editingClient ? "Modifier le client" : "Nouveau client"}
        size="lg"
      >
        <ClientForm
          initialData={editingClient}
          onSubmit={editingClient ? handleEdit : handleCreate}
          onCancel={() => {
            setModalOpen(false);
            setEditingClient(undefined);
          }}
          loading={formLoading}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirmer la suppression"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Êtes-vous sûr de vouloir supprimer{" "}
            <span className="font-semibold text-text-primary">
              {deleteTarget?.prenom} {deleteTarget?.nom}
            </span>{" "}
            ? Cette action est irréversible.
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
