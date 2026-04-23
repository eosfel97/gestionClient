"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Mail, Lock, Zap } from "lucide-react";
import toast from "react-hot-toast";

import { Button, Input, Card } from "@/components/ui";
import { loginSchema, LoginFormData } from "@/lib/utils/schemas";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const response = await authApi.login(data);
      login({
        userId: response.userId,
        nom: response.nom,
        prenom: response.prenom,
        email: response.email,
        role: response.role,
      });
      toast.success(`Bienvenue, ${response.prenom} !`);
      router.push("/dashboard");
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 401) {
        toast.error("Identifiants incorrects");
      } else {
        toast.error("Erreur de connexion au serveur");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-md"
    >
      <Card variant="glow" padding="lg" className="relative overflow-hidden">
        {/* Decorative gradient orb */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 15, delay: 0.1 }}
            className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4 glow-primary"
          >
            <Zap size={28} className="text-primary" />
          </motion.div>
          <h1 className="text-2xl font-bold text-text-primary text-glow-primary">
            GestionClient
          </h1>
          <p className="text-sm text-text-secondary mt-1.5">
            Connectez-vous à votre espace
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="relative space-y-5">
          <Input
            label="Email"
            type="email"
            placeholder="votre@email.com"
            autoComplete="email"
            icon={<Mail size={16} />}
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            icon={<Lock size={16} />}
            error={errors.password?.message}
            {...register("password")}
          />

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Se connecter
          </Button>
        </form>

        {/* Footer */}
        <p className="relative text-center text-sm text-text-muted mt-6">
          Pas encore de compte ?{" "}
          <Link
            href="/register"
            className="text-primary hover:text-primary-hover transition-colors font-medium"
          >
            S&apos;inscrire
          </Link>
        </p>
      </Card>
    </motion.div>
  );
}
