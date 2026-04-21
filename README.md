# 🏆 One Prodige — Intranet

Plateforme intranet officielle de l'équipe esport **One Prodige**.  
Gestion centralisée du roster, des performances Fortnite, du contenu, des documents et de la comptabilité.

---

## ⚙️ Stack technique

| Technologie | Usage |
|---|---|
| React + Vite | Frontend |
| React Router | Navigation |
| Supabase | Base de données + Auth |
| Recharts | Graphiques |
| Bootstrap | Styles de base |
| CSS Custom | Design système |

---

## 🚀 Installation

```bash
# Cloner le projet
git clone https://github.com/ton-repo/intranet-oneprodige.git
cd intranet-esport

# Installer les dépendances
npm install

# Installer recharts pour les graphiques
npm install recharts

# Lancer en développement
npm run dev
```

---

## 🔑 Variables d'environnement

Crée un fichier `.env` à la racine :

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=ton_anon_key
```

---

## 🗂️ Structure du projet

```
src/
├── components/
│   ├── Navbar.jsx          # Navigation principale
│   ├── Footer.jsx          # Pied de page
│   ├── LoginModal.jsx      # Popup de connexion
│   └── ProtectedRoute.jsx  # Protection des routes par rôle
│
├── pages/
│   ├── Home.jsx            # Page d'accueil
│   ├── Equipe.jsx          # Roster de l'équipe
│   ├── Annonces.jsx        # Annonces / Recrues / Leaves
│   ├── Scouting.jsx        # Scouting joueurs
│   ├── Performances.jsx    # Stats tournois Fortnite
│   ├── Joueurs.jsx         # Roster joueurs Fortnite
│   ├── Creators.jsx        # Content creators
│   ├── Videos.jsx          # Suivi vidéos
│   ├── Documents.jsx       # Documents internes
│   └── Compta.jsx          # Comptabilité 1P Services
│
├── services/
│   └── supabase.js         # Client Supabase
│
├── context/
│   └── AuthContext.jsx     # Contexte d'authentification
│
└── styles/
    ├── navbar.css
    ├── loginmodal.css
    ├── home.css
    ├── equipe.css
    ├── annonces.css
    ├── scouting.css
    ├── performances.css
    ├── joueurs.css
    ├── creators.css
    ├── videos.css
    ├── documents.css
    └── compta.css
```

---

## 🗃️ Base de données Supabase

### Tables

| Table | Description |
|---|---|
| `users` | Comptes membres (pseudo, code, role) |
| `members` | Roster équipe générale |
| `players` | Joueurs Fortnite compétitifs |
| `performances` | Stats tournois par joueur |
| `scoutings` | Fiches scouting |
| `creators` | Content creators & ambassadeurs |
| `videos` | Suivi des vidéos publiées |
| `documents` | Documents internes (PDF) |
| `annonces` | Annonces / Recrues / Leaves |
| `compta` | Comptabilité mensuelle 1P Services |

### Créer toutes les tables

```sql
-- USERS
create table users (
  id uuid default gen_random_uuid() primary key,
  pseudo text unique not null,
  code text,
  role text
);

-- PLAYERS
create table players (
  id uuid default gen_random_uuid() primary key,
  nom text unique not null,
  age integer,
  nationalite text,
  categorie text,
  pr_url text,
  contrats text,
  twitch text,
  youtube text,
  twitter text
);

-- PERFORMANCES
create table performances (
  id uuid default gen_random_uuid() primary key,
  joueur text references players(nom),
  format text,
  nom_cup text,
  classement integer,
  pr_gagne integer,
  kills integer,
  top1 integer,
  points integer,
  cash_prize text
);

-- CREATORS
create table creators (
  id uuid default gen_random_uuid() primary key,
  pseudo text unique not null,
  role text,
  youtube_url text,
  tiktok_url text,
  twitch_url text,
  yt_abonnes_debut integer,
  tiktok_abonnes_debut integer,
  yt_abonnes_now integer,
  tiktok_abonnes_now integer,
  nb_videos integer
);

-- VIDEOS
create table videos (
  id uuid default gen_random_uuid() primary key,
  titre text,
  date text,
  vues integer,
  createur text references creators(pseudo),
  type text
);

-- DOCUMENTS
create table documents (
  id uuid default gen_random_uuid() primary key,
  title text,
  category text,
  file_url text,
  file_name text,
  created_by text,
  created_at text
);

-- ANNONCES
create table annonces (
  id uuid default gen_random_uuid() primary key,
  titre text,
  contenu text,
  type text,
  auteur text,
  created_at timestamp default now()
);

-- COMPTA
create table compta (
  id uuid default gen_random_uuid() primary key,
  mois text,
  revenus numeric default 0,
  etat text,
  budget_fin_mois numeric default 0
);

-- Insérer les 12 mois
insert into compta (mois, revenus, etat, budget_fin_mois) values
('Janvier',0,'Aucun Revenu',0),('Février',0,'Aucun Revenu',0),
('Mars',0,'Aucun Revenu',0),('Avril',0,'Aucun Revenu',0),
('Mai',0,'Aucun Revenu',0),('Juin',0,'Aucun Revenu',0),
('Juillet',0,'Aucun Revenu',0),('Août',0,'Aucun Revenu',0),
('Septembre',0,'Aucun Revenu',0),('Octobre',0,'Aucun Revenu',0),
('Novembre',0,'Aucun Revenu',0),('Décembre',0,'Aucun Revenu',0);
```

---

## 👥 Système de rôles

| Rôle | Accueil | Équipe | Annonces | Fortnite | Content | Documents | 1P Services |
|---|---|---|---|---|---|---|---|
| **admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **CEO** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Director** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Manager** | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |

### Connexion

La connexion se fait via **pseudo + code** stockés dans la table `users`.  
Aucun système d'email — accès direct par identifiants internes.

---

## 📦 Pages & fonctionnalités

### 🏠 Home
Page publique. Présente l'intranet avec les sections disponibles.

### 👥 Équipe
Roster général de l'organisation. CRUD complet pour admin/CEO/Director.

### 📢 Annonces
Annonces internes avec 3 types : **Annonce**, **Recrue**, **Leave**.  
Filtrage par type. Publication réservée aux admin/CEO/Director.

### 🎮 Fortnite
- **Scouting** — fiches joueurs en prospection
- **Performances** — stats tournois avec graphique PR par joueur
- **Joueurs** — roster compétitif avec catégories Pro/CDF/Académique

### 🎬 Content
- **Creators** — suivi abonnés YouTube/TikTok/Twitch avec évolution
- **Vidéos** — suivi des publications avec stats (vues, type, creator)

### 📄 Documents
Upload et gestion de PDFs internes. Stockage via Supabase Storage.

### 💰 1P Services — Comptabilité
Suivi mensuel des revenus avec graphique d'évolution annuelle.  
États : Aucun Revenu / Revenu Faible / Revenu Moyen / Revenu Élevé.

---

## 🔒 Sécurité

- Routes protégées par rôle via `ProtectedRoute.jsx`
- Accès direct par URL bloqué si rôle insuffisant → redirect `/`
- Session stockée en `localStorage`
- Pas de RLS Supabase activé (usage interne uniquement)

---

## 🛠️ Build production

```bash
npm run build
```

Les fichiers sont générés dans `/dist`.

---

## 👤 Auteur

Projet développé pour **One Prodige Esport**.  
Usage interne uniquement — accès restreint aux membres.