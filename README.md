# EDF CPL Manager

Application web de gestion du cycle de vie des Concentrateurs CPL pour EDF.

## 🚀 Installation

### Prérequis

- Python 3.10+
- pip

### Installation des dépendances

```bash
pip install -r requirements.txt
```

### Configuration

1. Copier le fichier d'environnement :
```bash
cp .env.example .env
```

2. Modifier les variables dans `.env` selon votre configuration.

### Migrations

```bash
python manage.py migrate
```

## 🏃 Lancement

### Serveur de développement

```bash
python manage.py runserver
```

L'application sera accessible à l'adresse : http://127.0.0.1:8000

## 📁 Structure du projet

```
Defi-EDF/
├── api/                 # API REST (Django REST Framework)
├── apps/                # Applications Django
├── config/              # Configuration du projet
├── services/            # Services métier
├── static/              # Fichiers statiques (CSS, JS)
├── templates/           # Templates HTML
├── manage.py            # Script de gestion Django
└── requirements.txt     # Dépendances Python
```

## 🔗 Endpoints principaux

- `/` - Page d'accueil
- `/dashboard/` - Tableau de bord
- `/labo/` - Gestion laboratoire
- `/search/` - Recherche de concentrateurs
- `/api/v1/` - API REST

## 🛠️ Technologies

- **Backend** : Django 5.x, Django REST Framework
- **Base de données** : SQLite (dev) / PostgreSQL (prod)
- **Frontend** : HTML, CSS, JavaScript vanilla

## 📄 Licence

Projet développé dans le cadre du Défi EDF.
