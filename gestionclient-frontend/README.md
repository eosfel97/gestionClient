# GestionClient — Frontend CRM

Frontend React/Next.js pour le CRM GestionClient. Interface moderne avec thème néon sombre, glassmorphism et animations Framer Motion.

## Stack technique

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS v4** — thème custom néon/glassmorphism
- **Framer Motion** — animations et transitions
- **Recharts** — graphiques dashboard
- **Zustand** — state management (auth)
- **Zod + React Hook Form** — validation formulaires
- **Axios** — appels API avec interceptors JWT
- **React Hot Toast** — notifications

## Installation

```bash
cd gestion-client
npm install
```

## Configuration

Créez ou modifiez `.env.local` :

```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Lancement

```bash
npm run dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000)

## Structure du projet

```
src/
├── app/
│   ├── (auth)/           # Login, Register (layout sans sidebar)
│   ├── (dashboard)/      # Pages protégées (layout avec sidebar)
│   │   ├── dashboard/    # Tableau de bord
│   │   ├── clients/      # Liste + fiche client
│   │   ├── taches/       # Vue kanban
│   │   ├── interactions/ # Timeline
│   │   └── admin/users/  # Gestion utilisateurs (ADMIN)
│   └── layout.tsx        # Layout racine
├── components/
│   ├── ui/               # Button, Input, Card, Badge, Modal, Skeleton
│   ├── layout/           # Sidebar, Navbar, AuthGuard, ToastProvider
│   └── dashboard/        # StatCard, Charts, ActivityLists
├── lib/
│   ├── api/              # Axios instance + fonctions API par module
│   └── utils/            # Helpers, schemas Zod
├── stores/               # Zustand (auth)
└── types/                # Interfaces TypeScript
```

## Phases de développement

| Phase | Contenu | Statut |
|-------|---------|--------|
| 1 | Setup + thème + composants UI | ✅ Terminé |
| 2 | Auth (login/register) + routing protégé | ✅ Terminé |
| 3 | Dashboard (widgets, graphiques, activité) | ✅ Terminé |
| 4 | Clients (tableau, recherche, fiche détail) | À venir |
| 5 | Tâches (kanban drag & drop) | À venir |
| 6 | Interactions (timeline, filtres) | À venir |
| 7 | Admin utilisateurs | À venir |
| 8 | Bonus (export, recherche globale, Docker) | À venir |

## API Backend requise

Le backend Spring Boot doit être lancé sur le port 8080 avec les endpoints :
- `POST /api/auth/login` et `/api/auth/register`
- `GET /api/dashboard/stats`
- CRUD `/api/clients`, `/api/interactions`, `/api/taches`
- `GET/PATCH/DELETE /api/admin/users`
