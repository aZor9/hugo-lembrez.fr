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
│   └── api/
│       ├── auth/[...nextauth]/ # Authentification NextAuth
│       ├── cv/                 # Upload / lecture du CV (PDF)
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
- **UI glassmorphism** : cartes translucides, dégradés, animations
- **SEO** : métadonnées Open Graph, balises HTML sémantiques
- **Responsive** : mobile-first design
- **API sécurisées** : vérification de session sur toutes les mutations

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
