# ============================================
# GESTIONCLIENT FRONTEND - Dockerfile
# ============================================

# ----- Étape 1 : Installer les dépendances -----
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# ----- Étape 2 : Build -----
FROM node:20-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variable d'environnement pour le build (URL de l'API)
ARG NEXT_PUBLIC_API_URL=http://localhost:8080/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# ----- Étape 3 : Runtime -----
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Créer un utilisateur non-root
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Copier les fichiers nécessaires
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

# Donner les permissions à l'utilisateur
RUN chown -R appuser:appgroup /app

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

USER appuser
CMD ["node", "server.js"]