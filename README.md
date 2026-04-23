<div align="center">

# ⚡ GestionClient — CRM

**CRM fullstack moderne pour gérer clients, interactions et tâches commerciales.**

Built with **Spring Boot 4** + **Next.js 14** • TypeScript • Tailwind • MySQL • Docker

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0.5-6DB33F?logo=springboot&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Java](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)

</div>

---

## 🎯 Aperçu

GestionClient est un CRM permettant de :

- Gérer les clients et leur statut  
- Suivre les interactions (appels, emails, réunions)  
- Organiser les tâches via un Kanban  
- Visualiser l’activité avec un dashboard  

👉 Système multi-utilisateurs avec rôles :
- **Admin** : accès global  
- **Commercial** : accès limité à ses données  

---

## ✨ Fonctionnalités clés

- 🔐 Authentification JWT sécurisée  
- 📊 Dashboard avec statistiques et graphiques  
- 👥 Gestion complète des clients (CRUD + filtres + recherche)  
- 📋 Kanban drag & drop avec mise à jour optimiste  
- 📞 Timeline des interactions  
- 🛠 Administration des utilisateurs  
- 🎨 UI moderne (responsive, animations, notifications)

---

## 🛠 Stack technique

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand, Zod, React Hook Form

**Backend**
- Spring Boot 4
- Spring Security + JWT
- JPA / Hibernate
- MySQL

**DevOps**
- Docker & Docker Compose

---

## 🚀 Lancement rapide

### Avec Docker (recommandé)

```bash
docker compose up --build
