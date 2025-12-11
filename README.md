# Defi EDF - Concentrateur Tracker

Application web de gestion du cycle de vie des Concentrateurs CPL pour EDF SEI.

## 🚀 Démarrage rapide

### Prérequis

- Python 3.10+
- Node.js 18+
- npm

### Installation

```bash
# 1. Backend (Django)
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate

# 2. Frontend (React/Vite)
cd frontend
npm install
```

### Lancement (développement)

Lancer les deux serveurs en parallèle :

```bash
# Terminal 1 - Backend (port 8000)
source venv/bin/activate
python manage.py runserver

# Terminal 2 - Frontend (port 5173)
cd frontend
npm run dev
```

L'application sera accessible sur **http://localhost:5173**

## ⚙️ Configuration

1. Copier le fichier d'environnement :
```bash
cp .env.example .env
```

2. Modifier les variables dans `.env` selon votre configuration.

## 📁 Structure du projet

```
Defi-EDF/
├── api/                     # API REST (Django REST Framework)
│   ├── serializers.py       # Sérialiseurs DRF
│   ├── views.py             # ViewSets et APIViews
│   ├── urls.py              # Routes API
│   └── permissions.py       # Permissions personnalisées
│
├── apps/                    # Applications Django
│   ├── core/                # Modèle User, authentification
│   ├── inventory/           # Modèles Concentrateur, Carton, Poste
│   ├── tracking/            # Historique des actions
│   └── dashboard/           # Statistiques
│
├── config/                  # Configuration Django
│   ├── settings.py          # Paramètres du projet
│   ├── urls.py              # Routes principales
│   └── wsgi.py              # Point d'entrée WSGI
│
├── services/                # Logique métier
│   └── business_logic.py    # ConcentrateurService (transitions d'état)
│
├── frontend/                # Application React (Vite)
│   ├── src/
│   │   ├── components/      # Composants réutilisables
│   │   │   ├── Layout.jsx   # Layout principal avec sidebar
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/         # Contextes React (Auth, Theme)
│   │   ├── pages/           # Pages de l'application
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Reception.jsx
│   │   │   ├── Commande.jsx
│   │   │   ├── Operations.jsx
│   │   │   ├── Labo.jsx
│   │   │   └── WorkspaceSelector.jsx
│   │   ├── services/        # Client API (axios)
│   │   └── App.jsx          # Routeur principal
│   ├── package.json
│   └── vite.config.js
│
├── manage.py                # Script de gestion Django
├── requirements.txt         # Dépendances Python
└── README.md
```

## 🔗 Endpoints API

| Endpoint | Description |
|----------|-------------|
| `POST /api/v1/auth/login/` | Authentification |
| `POST /api/v1/auth/logout/` | Déconnexion |
| `GET /api/v1/auth/me/` | Utilisateur courant |
| `GET /api/v1/concentrateurs/` | Liste des concentrateurs |
| `GET /api/v1/cartons/` | Liste des cartons |
| `GET /api/v1/postes/` | Liste des postes |
| `POST /api/v1/actions/reception/` | Réception carton (Magasin) |
| `POST /api/v1/actions/commande/` | Commande cartons (BO) |
| `POST /api/v1/actions/pose/` | Pose concentrateur (Terrain) |
| `POST /api/v1/actions/depose/` | Dépose concentrateur (Terrain) |
| `POST /api/v1/actions/test/` | Test concentrateur (Labo) |
| `GET /api/v1/dashboard/stats/` | Statistiques stock |

## 🛠️ Technologies

### Backend
- **Django 5.x** - Framework web Python
- **Django REST Framework** - API REST
- **SQLite** (dev)

### Frontend
- **React 18** - Framework UI
- **Vite** - Bundler et dev server
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **Recharts** - Graphiques
- **Lucide React** - Icônes

## 👥 Rôles utilisateurs

| Rôle | Permissions |
|------|-------------|
| **Magasin** | Réception des cartons |
| **BO Commande** | Commande de cartons |
| **BO Terrain** | Pose/Dépose de concentrateurs |
| **Labo** | Tests des concentrateurs |

## 📄 Licence

Projet développé dans le cadre du Défi EDF.
