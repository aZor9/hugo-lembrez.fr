# hugo-lembrez.fr

Portfolio personnel & site web — Next.js 14 / TypeScript / Tailwind CSS / Prisma / PostgreSQL

## Architecture du projet

```
├── app/
│   ├── layout.tsx              # Layout racine (SEO, providers, fond animé)
│   ├── page.tsx                # Page publique (Hero, CV, Formation, Projets, Stacks)
│   ├── globals.css             # Styles globaux + utilitaires glassmorphism
│   ├── sitemap.ts / robots.ts  # sitemap.xml et robots.txt générés
│   ├── links/page.tsx          # Page "liens" (style link-in-bio)
│   ├── mentions-legales/       # Mentions légales
│   ├── not-found.tsx           # Page 404
│   ├── login/page.tsx          # Page de connexion admin
│   ├── admin/page.tsx          # Dashboard admin (CV, Profil, Projets, Liens, Stacks, Formation)
│   ├── CV/route.ts             # Route publique du CV principal
│   ├── CV-leger/route.ts       # Route publique du CV réduit
│   └── api/
│       ├── auth/[...nextauth]/ # Authentification NextAuth
│       ├── cv/                 # Upload / lecture des CV (normal + réduit)
│       ├── projects/           # CRUD projets
│       ├── links/              # CRUD liens
│       ├── stack-categories/   # CRUD catégories de stacks
│       ├── stacks/             # CRUD technologies
│       ├── education/          # CRUD formations
│       ├── home-sections/      # Réglages d'affichage des sections de l'accueil
│       └── profile/            # Mise à jour du profil (+ image)
├── components/
│   ├── Hero.tsx                # Section hero avec avatar
│   ├── CVDownload.tsx          # Consultation / téléchargement des CV
│   ├── EducationSection.tsx    # Section formation
│   ├── Projects.tsx            # Grille de projets
│   ├── TechStackSection.tsx    # Section stacks techniques
│   ├── Footer.tsx              # Pied de page
│   ├── GlassCard.tsx           # Composant carte glassmorphism
│   ├── Navbar.tsx              # Navigation (actuellement désactivée sur l'accueil)
│   ├── LoginForm.tsx           # Formulaire de connexion
│   ├── Providers.tsx           # SessionProvider NextAuth
│   └── admin/                  # Gestionnaires admin (CV, profil, projets, liens,
│                               #   stacks, formation, recadrage d'image)
├── lib/
│   ├── auth.ts                 # Configuration NextAuth (+ rate limiting du login)
│   ├── rate-limit.ts           # Limiteur de tentatives en mémoire
│   ├── cv.ts                   # Helpers CV (variants, noms, serving)
│   ├── home-settings.ts        # Réglages des sections de l'accueil
│   ├── site.ts                 # URL canonique du site
│   ├── tech-icons.tsx          # Icônes des technologies
│   ├── upload.ts               # Upload fichiers (Blob / filesystem)
│   └── prisma.ts               # Client Prisma singleton
├── prisma/
│   ├── schema.prisma           # Schéma de la base de données
│   └── seed.ts                 # Seed admin + profil par défaut
├── types/
│   └── index.ts                # Types TypeScript partagés
├── middleware.ts               # Protection de /admin
├── next.config.js              # Images distantes + en-têtes de sécurité (CSP...)
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
| `NEXT_PUBLIC_SITE_URL` | URL publique (sitemap, canonical). Défaut : `https://hugo-lembrez.fr` |

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
- **Dashboard admin mobile-friendly** : gestion du CV, profil, projets, liens, stacks et formation
- **Sections configurables** : affichage et titres des sections Formation / Stacks réglables depuis l'admin
- **Page `/links`** : liens publics façon link-in-bio
- **Upload PDF** : Vercel Blob (prod) / filesystem (dev)
- **Double modèle de CV** : un CV `normal` + un CV `reduit` (fallback)
- **Routes publiques dédiées** : `/CV` (principal) et `/CV-leger` (fallback)
- **UI glassmorphism** : cartes translucides, dégradés, animations
- **SEO** : métadonnées Open Graph, `sitemap.xml`, `robots.txt`, URLs canoniques
- **Sécurité** : en-têtes HTTP (CSP, HSTS, X-Frame-Options...), rate limiting du login (5 échecs / 15 min par IP et par email)
- **Responsive** : mobile-first design
- **API sécurisées** : vérification de session sur toutes les mutations
- **Pages légales et 404** : `/mentions-legales` et page introuvable personnalisée

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
| Framer Motion  | Animations                     |
| Vercel Analytics / Speed Insights | Mesure d'audience et performances (dépendances installées) |
