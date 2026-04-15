"use client";

import { motion } from "framer-motion";
import { Phone, Mail, Users, FileText, AlertTriangle, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, Badge } from "@/components/ui";
import { Interaction, Tache } from "@/types";
import {
  formatRelativeDate,
  isOverdue,
  typeInteractionConfig,
  prioriteTacheConfig,
  cn,
} from "@/lib/utils";

const iconMap = {
  Phone,
  Mail,
  Users,
  FileText,
};

// ─── Recent Interactions ───
interface RecentInteractionsProps {
  interactions: Interaction[];
  delay?: number;
}

export function RecentInteractions({ interactions, delay = 0 }: RecentInteractionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-primary">Dernières interactions</h3>
          <Link href="/interactions" className="text-xs text-primary hover:text-primary-hover flex items-center gap-1 transition-colors">
            Tout voir <ArrowRight size={12} />
          </Link>
        </div>
        <div className="space-y-3">
          {interactions.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-6">Aucune interaction récente</p>
          ) : (
            interactions.slice(0, 5).map((interaction, i) => {
              const config = typeInteractionConfig[interaction.type];
              const Icon = iconMap[config.icon as keyof typeof iconMap];
              return (
                <motion.div
                  key={interaction.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: delay + i * 0.05 }}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-glass transition-colors"
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", config.bg)}>
                    <Icon size={15} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary truncate">
                        {interaction.clientPrenom} {interaction.clientNom}
                      </span>
                      <Badge color={config.color} bg={config.bg} size="sm">
                        {config.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5 truncate">{interaction.sujet}</p>
                  </div>
                  <span className="text-[10px] text-text-muted flex-shrink-0">
                    {formatRelativeDate(interaction.dateInteraction)}
                  </span>
                </motion.div>
              );
            })
          )}
        </div>
      </Card>
    </motion.div>
  );
}

// ─── Upcoming / Overdue Tasks ───
interface TaskListProps {
  tasks: Tache[];
  title: string;
  variant?: "upcoming" | "overdue";
  delay?: number;
}

export function TaskList({ tasks, title, variant = "upcoming", delay = 0 }: TaskListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {variant === "overdue" && <AlertTriangle size={14} className="text-danger" />}
            {variant === "upcoming" && <Clock size={14} className="text-accent" />}
            <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
            {tasks.length > 0 && (
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                variant === "overdue" ? "bg-danger/10 text-danger" : "bg-accent/10 text-accent"
              )}>
                {tasks.length}
              </span>
            )}
          </div>
          <Link href="/taches" className="text-xs text-primary hover:text-primary-hover flex items-center gap-1 transition-colors">
            Tout voir <ArrowRight size={12} />
          </Link>
        </div>
        <div className="space-y-2.5">
          {tasks.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-6">
              {variant === "overdue" ? "Aucune tâche en retard" : "Aucune tâche à venir"}
            </p>
          ) : (
            tasks.slice(0, 5).map((tache, i) => {
              const priorite = prioriteTacheConfig[tache.priorite];
              const overdue = isOverdue(tache.dateEcheance);
              return (
                <motion.div
                  key={tache.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: delay + i * 0.05 }}
                  className={cn(
                    "flex items-center gap-3 p-2.5 rounded-xl transition-colors",
                    overdue && variant === "overdue" ? "bg-danger/5 hover:bg-danger/8" : "hover:bg-glass"
                  )}
                >
                  <div className={cn("w-2 h-2 rounded-full flex-shrink-0", priorite.bg.replace("/10", ""), priorite.color.replace("text-", "bg-"))} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{tache.titre}</p>
                    <p className="text-xs text-text-muted truncate">
                      {tache.clientPrenom} {tache.clientNom}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge color={priorite.color} bg={priorite.bg} size="sm">
                      {priorite.label}
                    </Badge>
                    <p className={cn("text-[10px] mt-1", overdue ? "text-danger" : "text-text-muted")}>
                      {formatRelativeDate(tache.dateEcheance)}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </Card>
    </motion.div>
  );
}
