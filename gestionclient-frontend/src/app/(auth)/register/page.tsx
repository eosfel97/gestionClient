"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Mail, Lock, User, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { Button, Input, Card, PasswordStrength } from "@/components/ui";
import { registerSchema, RegisterFormData } from "@/lib/utils/schemas";
import { authApi } from "@/lib/api";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });
  const password = watch("password", "");

  const fieldVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.07, duration: 0.4, ease: "easeOut" as const },
    }),
  };

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      await authApi.register({
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        password: data.password,
        role: "COMMERCIAL",
      });
      toast.success("Compte créé avec succès !");
      router.push("/login");
    } catch (error: unknown) {
      const err = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (err.response?.status === 409)
        toast.error("Cet email est déjà utilisé");
      else
        toast.error(
          err.response?.data?.message || "Erreur lors de la création du compte",
        );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <Card variant="glow" padding="lg" className="relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-accent/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 15, delay: 0.1 }}
            className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-4 glow-accent"
          >
            <Zap size={28} className="text-accent" />
          </motion.div>
          <h1 className="text-2xl font-bold text-text-primary">
            Créer un compte
          </h1>
          <p className="text-sm text-text-secondary mt-1.5">
            Rejoignez GestionClient
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="relative space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fieldVariants}
            >
              <Input
                label="Nom"
                placeholder="Dupont"
                icon={<User size={16} />}
                error={errors.nom?.message}
                {...register("nom")}
              />
            </motion.div>
            <motion.div
              custom={1}
              initial="hidden"
              animate="visible"
              variants={fieldVariants}
            >
              <Input
                label="Prénom"
                placeholder="Jean"
                icon={<User size={16} />}
                error={errors.prenom?.message}
                {...register("prenom")}
              />
            </motion.div>
          </div>
          <motion.div
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fieldVariants}
          >
            <Input
              label="Email"
              type="email"
              placeholder="jean.dupont@email.com"
              icon={<Mail size={16} />}
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />
          </motion.div>
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fieldVariants}
          >
            <Input
              label="Mot de passe"
              type="password"
              placeholder="Minimum 6 caractères"
              icon={<Lock size={16} />}
              autoComplete="new-password"
              error={errors.password?.message}
              {...register("password")}
            />
            <div className="mt-2">
              <PasswordStrength password={password} />
            </div>
          </motion.div>
          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fieldVariants}
          >
            <Input
              label="Confirmer le mot de passe"
              type="password"
              placeholder="••••••••"
              icon={<Lock size={16} />}
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
          </motion.div>
          <motion.div
            custom={5}
            initial="hidden"
            animate="visible"
            variants={fieldVariants}
          >
            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Créer mon compte
            </Button>
          </motion.div>
        </form>
        <p className="relative text-center text-sm text-text-muted mt-6">
          Déjà inscrit ?{" "}
          <Link
            href="/login"
            className="text-primary hover:text-primary-hover transition-colors font-medium"
          >
            Se connecter
          </Link>
        </p>
      </Card>
    </motion.div>
  );
}
