**BookNest** est une API REST pour la gestion de livres, développée avec **Node.js**, **Express**, et **MongoDB**. Elle permet aux utilisateurs de gérer leurs lectures, de pouvoir les ajouter à des listes, de découvrir par système de suggestion de nouveaux livres ou encore d'avoir un espace communautaire grâce à un forum pour discuter de leurs trouvailles.

## Fonctionnalités

- **Gestion des livres** : CRUD pour les livres (création, lecture, mise à jour, suppression).
- **Gestion des utilisateurs** : inscription, connexion sécurisée avec JWT.
- **Critiques et notes** : noter et commenter des livres.
- **Suggestions de livres** : Recommander des livres basés sur les genres ou sur les livres que l'utilisateur a déjà consultés ou notés.
- **Scan du code ISBN** : Scanner le code ISBN d’un livre pour accéder directement à sa page de détails.
- **Trouvaille des livres en géolocalisation dans les bibliothèques les plus proches** : 
Pour savoir ou aller lire ce dernier roman dont vous ne pouvez vous passer.

## Prérequis

- **Node.js** et **npm**
- **MongoDB** (local ou distant)