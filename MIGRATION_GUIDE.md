# Migration Frontend React vers Laravel + Inertia.js

## Résumé de la migration

Ce document décrit la migration du frontend React autonome vers l'application Laravel avec Inertia.js, tout en conservant la communication avec l'API IA.

## Changements effectués

### 1. Nouveau composant React
- **Fichier créé :** `webApp/resources/js/pages/pandemic-predictions.tsx`
- **Description :** Page principale de prédictions de pandémie intégrée dans l'écosystème Laravel
- **Améliorations :**
  - Interface utilisateur moderne avec Tailwind CSS
  - Gestion d'état des erreurs améliorée
  - Support du mode sombre
  - TypeScript avec typage strict
  - Responsive design

### 2. Contrôleur Laravel
- **Fichier créé :** `webApp/app/Http/Controllers/PandemicPredictionController.php`
- **Fonctionnalités :**
  - Proxy sécurisé vers l'API IA
  - Validation des données d'entrée
  - Gestion centralisée des erreurs
  - Configuration via variables d'environnement

### 3. Routes Laravel
- **Fichier modifié :** `webApp/routes/web.php`
- **Nouvelles routes :**
  - `GET /pandemic-predictions` - Page principale
  - `POST /api/pandemic/predict` - Prédiction de cas
  - `POST /api/pandemic/predict-total-cases` - Prédiction du total
  - `GET /api/pandemic/model-info` - Informations du modèle
  - `GET /api/pandemic/processed-data` - Données traitées

### 4. Navigation
- **Fichier modifié :** `webApp/resources/js/components/app-sidebar.tsx`
- **Ajout :** Lien vers les prédictions de pandémie dans la barre latérale

### 5. Configuration
- **Fichier modifié :** `webApp/.env`
- **Ajout :** Variable `AI_API_URL=http://localhost:8000`

## Avantages de la migration

### Sécurité
- ✅ Protection CSRF automatique
- ✅ Validation des données côté serveur
- ✅ Proxy sécurisé vers l'API IA (évite les problèmes CORS)
- ✅ Authentification Laravel intégrée

### Maintenabilité
- ✅ Code organisé selon les conventions Laravel
- ✅ TypeScript pour un typage strict
- ✅ Gestion centralisée des erreurs
- ✅ Configuration via variables d'environnement

### Expérience utilisateur
- ✅ Interface moderne avec Tailwind CSS
- ✅ Support du mode sombre
- ✅ Design responsive
- ✅ Navigation intégrée

## Instructions de déploiement

### 1. Installation des dépendances
```bash
cd webApp
npm install
```

### 2. Configuration de l'environnement
Assurez-vous que la variable `AI_API_URL` dans `.env` pointe vers votre API IA :
```env
AI_API_URL=http://localhost:8000
```

### 3. Build de l'application
```bash
npm run build
```

### 4. Démarrage des services
```bash
# Terminal 1 : API IA (depuis le dossier racine)
cd aiApi
python src/main.py

# Terminal 2 : Application Laravel (depuis webApp)
php artisan serve
```

### 5. Accès à l'application
- Application Laravel : `http://localhost:8000`
- Page prédictions : `http://localhost:8000/pandemic-predictions`

## API Endpoints conservés

Toutes les fonctionnalités de l'API IA sont conservées et accessibles via les nouvelles routes Laravel :

| Fonctionnalité | Ancienne URL | Nouvelle URL Laravel |
|---|---|---|
| Prédiction cas | `POST http://localhost:8000/predict` | `POST /api/pandemic/predict` |
| Prédiction total | `POST http://localhost:8000/predict-total-cases` | `POST /api/pandemic/predict-total-cases` |
| Info modèle | `GET http://localhost:8000/model-info` | `GET /api/pandemic/model-info` |
| Données traitées | `GET http://localhost:8000/api/processed-data` | `GET /api/pandemic/processed-data` |

## Prochaines étapes

1. **Authentification :** Ajoutez l'authentification si nécessaire pour sécuriser l'accès aux prédictions
2. **Tests :** Implémentez des tests unitaires et d'intégration
3. **Cache :** Ajoutez un système de cache pour les prédictions fréquemment utilisées
4. **Monitoring :** Intégrez un système de logs et de monitoring
5. **Visualisations :** Ajoutez des graphiques et visualisations pour les prédictions
