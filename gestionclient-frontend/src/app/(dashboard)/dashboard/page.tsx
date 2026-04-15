"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  CheckSquare,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  UserPlus,
} from "lucide-react";

import StatCard from "@/components/dashboard/StatCard";
import { DonutChart, BarChartWidget } from "@/components/dashboard/Charts";
import { RecentInteractions, TaskList } from "@/components/dashboard/ActivityLists";
import { Skeleton } from "@/components/ui";
import { dashboardApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { DashboardStats } from "@/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardApi.getStats();
        setStats(data);
      } catch (error) {
        console.error("Erreur chargement stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const clientsDonutData = [
    { name: "Actifs", value: stats.clientsActifs, color: "#00E676" },
    { name: "Prospects", value: stats.clientsProspects, color: "#00D4FF" },
    { name: "Inactifs", value: stats.clientsInactifs, color: "#555577" },
  ];

  const interactionsBarData = [
    { name: "Appels", value: stats.interactionsParType.APPEL || 0, color: "#00E676" },
    { name: "Emails", value: stats.interactionsParType.EMAIL || 0, color: "#00D4FF" },
    { name: "Réunions", value: stats.interactionsParType.REUNION || 0, color: "#6C63FF" },
    { name: "Notes", value: stats.interactionsParType.NOTE || 0, color: "#FFB300" },
  ];

  const tachesBarData = [
    { name: "Haute", value: stats.tachesParPriorite.HAUTE || 0, color: "#FF5252" },
    { name: "Moyenne", value: stats.tachesParPriorite.MOYENNE || 0, color: "#FFB300" },
    { name: "Basse", value: stats.tachesParPriorite.BASSE || 0, color: "#00E676" },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-text-primary">
          {greeting}, <span className="text-glow-primary text-primary">{user?.prenom}</span>
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Voici un aperçu de votre activité CRM
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Clients"
          value={stats.totalClients}
          icon={Users}
          color="primary"
          subtitle={`${stats.clientsActifs} actifs`}
          delay={0.05}
        />
        <StatCard
          title="Clients Actifs"
          value={stats.clientsActifs}
          icon={UserCheck}
          color="success"
          subtitle={`${stats.clientsProspects} prospects`}
          delay={0.1}
        />
        <StatCard
          title="Interactions ce mois"
          value={stats.interactionsCeMois}
          icon={MessageSquare}
          color="accent"
          subtitle={`${stats.interactionsCetteSemaine} cette semaine`}
          delay={0.15}
        />
        <StatCard
          title="Tâches en retard"
          value={stats.tachesEnRetard}
          icon={AlertTriangle}
          color={stats.tachesEnRetard > 0 ? "danger" : "success"}
          subtitle={`${stats.totalTaches} au total`}
          delay={0.2}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DonutChart data={clientsDonutData} title="Répartition des clients" delay={0.25} />
        <BarChartWidget data={interactionsBarData} title="Interactions par type" delay={0.3} />
        <BarChartWidget data={tachesBarData} title="Tâches par priorité" delay={0.35} />
      </div>

      {/* Task Progress Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Progression des tâches</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "À faire", value: stats.tachesAFaire, total: stats.totalTaches, color: "#00D4FF" },
              { label: "En cours", value: stats.tachesEnCours, total: stats.totalTaches, color: "#FFB300" },
              { label: "Terminées", value: stats.tachesTerminees, total: stats.totalTaches, color: "#00E676" },
            ].map((item) => {
              const pct = item.total > 0 ? (item.value / item.total) * 100 : 0;
              return (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-secondary">{item.label}</span>
                    <span className="text-text-primary font-semibold">{item.value}</span>
                  </div>
                  <div className="h-2 bg-surface rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Activity Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RecentInteractions interactions={stats.dernieresInteractions || []} delay={0.45} />
        <TaskList tasks={stats.prochainesTaches || []} title="Prochaines tâches" variant="upcoming" delay={0.5} />
        <TaskList tasks={stats.tachesEnRetardListe || []} title="En retard" variant="overdue" delay={0.55} />
      </div>
    </div>
  );
}
