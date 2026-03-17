# hugo-lembrez.fr

Portfolio personnel & site web — Next.js 14 / TypeScript / Tailwind CSS / Prisma / PostgreSQL

## Architecture du projet

```
├── app/
│   ├── layout.tsx              # Layout racine (SEO, providers, fond animé)
│   ├── page.tsx                # Page publique (Hero, Projets, À propos)
│   ├── globals.css             # Styles globaux + utilitaires glassmorphism
│   ├── login/page.tsx          # Page de connexion admin
│   ├── admin/page.tsx          # Dashboard admin (CV, Profil, Projets)
│   ├── CV/route.ts             # Route publique du CV principal
│   ├── CV-leger/route.ts       # Route publique du CV réduit
│   └── api/
│       ├── auth/[...nextauth]/ # Authentification NextAuth
│       ├── cv/                 # Upload / lecture des CV (normal + réduit)
│       ├── projects/           # CRUD projets
│       └── profile/            # Mise à jour du profil
├── components/
│   ├── Navbar.tsx              # Navigation responsive
│   ├── Hero.tsx                # Section hero avec avatar
│   ├── Projects.tsx            # Grille de projets
│   ├── About.tsx               # Section à propos
│   ├── Footer.tsx              # Pied de page
│   ├── GlassCard.tsx           # Composant carte glassmorphism
│   ├── CVDownload.tsx          # Bouton de téléchargement du CV
│   ├── LoginForm.tsx           # Formulaire de connexion
│   ├── Providers.tsx           # SessionProvider NextAuth
│   └── admin/
│       ├── CVUpload.tsx        # Upload CV (PDF)
│       ├── ProfileManager.tsx  # Édition du profil
│       └── ProjectManager.tsx  # Gestion des projets (CRUD)
├── lib/
│   ├── auth.ts                 # Configuration NextAuth
│   ├── cv.ts                   # Helpers CV (variants, noms, serving)
│   └── prisma.ts               # Client Prisma singleton
├── prisma/
│   ├── schema.prisma           # Schéma de la base de données
│   └── seed.ts                 # Seed admin + profil par défaut
├── types/
│   └── index.ts                # Types TypeScript partagés
├── middleware.ts                # Protection de /admin
└── .env.example                # Variables d'environnement
```

## Prérequis

- **Node.js** >= 18
- **PostgreSQL** (Neon, Supabase, ou local)
- **Compte Vercel** (pour le déploiement + Blob storage)

## Installation

### 1. Cloner et installer les dépendances

```bash
git clone <repo-url>
cd hugo-lembrez.fr
npm install
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Remplir le fichier `.env` :

| Variable               | Description                                    |
| ---------------------- | ---------------------------------------------- |
| `DATABASE_URL`         | URL PostgreSQL (Neon/Supabase/local)           |
| `NEXTAUTH_URL`         | `http://localhost:3000` en dev                 |
| `NEXTAUTH_SECRET`      | Secret aléatoire (`openssl rand -base64 32`)   |
| `BLOB_READ_WRITE_TOKEN`| Token Vercel Blob (optionnel en dev local)     |
| `ADMIN_EMAIL`          | Email du compte admin                          |
| `ADMIN_PASSWORD`       | Mot de passe admin (sera hashé avec bcrypt)    |

### 3. Initialiser la base de données

```bash
# Créer les tables
npx prisma db push

# Créer l'utilisateur admin + profil par défaut
npm run db:seed
```

### 4. Lancer en développement

```bash
npm run dev
```

Le site est accessible sur `http://localhost:3000`.
Le dashboard admin est sur `http://localhost:3000/admin`.

## Déploiement sur Vercel

### 1. Créer un projet Vercel

```bash
npx vercel
```

### 2. Base de données PostgreSQL

Options recommandées :
- **Neon** (intégration native Vercel) → `neon.tech`
- **Supabase** → `supabase.com`

Copier l'URL de connexion dans les variables d'environnement Vercel.

### 3. Vercel Blob (upload CV)

1. Aller dans le projet Vercel → **Storage** → **Create Blob Store**
2. Récupérer le `BLOB_READ_WRITE_TOKEN`
3. L'ajouter dans les variables d'environnement

> **Note** : Sans `BLOB_READ_WRITE_TOKEN`, l'upload CV utilise le système de fichiers local (uniquement pour le développement).

### 4. Variables d'environnement Vercel

Configurer dans **Settings → Environment Variables** :
- `DATABASE_URL`
- `NEXTAUTH_URL` → `https://votre-domaine.vercel.app`
- `NEXTAUTH_SECRET`
- `BLOB_READ_WRITE_TOKEN`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

### 5. Déployer

```bash
npx vercel --prod
```

Après le déploiement, exécuter le seed :
```bash
npx vercel env pull .env.local
npx prisma db push
npm run db:seed
```

## Fonctionnalités

- **Authentification sécurisée** : NextAuth + JWT + bcrypt
- **Dashboard admin mobile-friendly** : gestion du CV, profil et projets
- **Upload PDF** : Vercel Blob (prod) / filesystem (dev)
- **Double modèle de CV** : un CV `normal` + un CV `reduit` (fallback)
- **Routes publiques dédiées** : `/CV` (principal) et `/CV-leger` (fallback)
- **UI glassmorphism** : cartes translucides, dégradés, animations
- **SEO** : métadonnées Open Graph, balises HTML sémantiques
- **Responsive** : mobile-first design
- **API sécurisées** : vérification de session sur toutes les mutations

## Gestion des CV (normal / réduit)

Le site gère désormais deux variantes de CV :

- `normal` : version principale
- `reduit` : version aplatie/fallback si certains éléments du PDF principal ne se chargent pas

Routes publiques :

- `GET /CV` : affiche/télécharge le CV principal
- `GET /CV-leger` : affiche/télécharge le CV réduit
- `?download=1` force le mode téléchargement sur les deux routes

API admin CV :

- `GET /api/cv` : liste les variantes disponibles
- `GET /api/cv?variant=normal|reduit` : récupère une variante précise
- `POST /api/cv` : upload d'une variante (`formData`: `file`, `variant`)
- `PATCH /api/cv` : rename d'un CV (`id`, `fileName`)

En base, le modèle `Cv` contient maintenant un champ `variant` (`normal` par défaut).

## Troubleshooting Prisma (important)

Si tu vois l'erreur :

`Error validating datasource 'db': the URL must start with the protocol 'prisma://'`

cela signifie généralement que le client Prisma a été généré avec `--no-engine`.

Pour ce projet (runtime serveur Node classique), il faut un client Prisma standard :

```bash
npx prisma generate
```

Si Windows bloque le fichier moteur Prisma (`EPERM`), ferme les process `next dev` puis relance la commande.

## Stack technique

| Technologie    | Usage                          |
| -------------- | ------------------------------ |
| Next.js 14     | Framework React (App Router)   |
| TypeScript     | Typage statique                |
| Tailwind CSS   | Styles utilitaires             |
| Prisma         | ORM + migrations               |
| PostgreSQL     | Base de données                |
| NextAuth       | Authentification               |
| bcryptjs       | Hachage de mot de passe        |
| @vercel/blob   | Stockage de fichiers           |
| Framer Motion  | Animations (optionnel)         |
