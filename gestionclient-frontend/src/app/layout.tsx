import type { Metadata } from "next";
import "./globals.css";
import ToastProvider from "@/components/layout/ToastProvider";

export const metadata: Metadata = {
  title: "GestionClient — CRM",
  description: "CRM professionnel de gestion des clients, tâches et interactions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
