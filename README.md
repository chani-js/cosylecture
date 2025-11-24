📚 Coin Lecture Cosy (by Chani)

Application web Vue 3 / Vite / Firebase
Suivi de lectures avec authentification, Kanban dynamique, suggestions automatiques et pochette de livres.

✨ Fonctionnalités
🔐 Authentification Firebase

Création de compte (email + mot de passe)

Connexion / déconnexion

Interface qui s’adapte automatiquement selon l’état logged-in

📚 Gestion complète des livres

Chaque utilisateur possède sa propre collection dans Firestore.
Un livre contient :

Titre

Auteur

Statut (À acheter / À lire / En cours / Terminé)

Note sur 5

Tags

Commentaire

Pochette (URL automatique via OpenLibrary)

🔍 Suggestions automatiques

Dès que l’utilisateur tape 3 lettres, l’application propose :

Titres proches

Auteur

Et récupère automatiquement la pochette officielle (si disponible)

🗂️ Vue Kanban multi-colonnes

Les livres sont triés par catégorie :
🛒 À acheter • 🌱 À lire • 🔁 En cours • ✅ Terminés

🎨 Interface cosy

Palette douce

Design épuré

Adapté mobile/tablette

☁️ 100% hébergé

Base de données Firestore

Déploiement Netlify

Version en ligne accessible partout

📦 Structure du projet
root
│── index.html
│── package.json
│── vite.config.js
│── README.md
│
└── src
    │── main.js
    │── App.vue
    │── firebase.js
    │── styles.css
    │
    ├── components
    │   ├── AuthPanel.vue
    │   ├── BookForm.vue
    │   └── BooksColumns.vue
    │
    └── services
        └── booksService.js

🚀 Installation & Lancement
1. Installer les dépendances
npm install

2. Lancer le projet localement
npm run dev


Le site sera accessible sur :
👉 http://localhost:5173

🔧 Configuration Firebase

Dans src/firebase.js, coller votre config Firebase :

export const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};


Active :

Authentication → Email/Password

Firestore Database

🌐 Déploiement Netlify
1. Build du projet
npm run build

2. Déployer

Depuis Netlify :
New Site → Deploy manually → Glisser/déposer le dossier /dist

Ou en CLI :

netlify deploy

🔎 API OpenLibrary

Les suggestions viennent de :

https://openlibrary.org/search.json?title=xxxx


Les pochettes :

https://covers.openlibrary.org/b/id/{cover_i}-M.jpg
https://covers.openlibrary.org/b/isbn/{isbn}-M.jpg

📘 Évolution possible

Pagination + filtres avancés

Vue “Bibliothèque” avec miniatures

Mode sombre

Statistiques de lecture

Synchronisation avec Goodreads

Export PDF / CSV de la bibliothèque
