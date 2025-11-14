🎄 Secret Santa Project

Bienvenue dans le projet Secret Santa ! Ce projet permet de créer des événements, inviter des participants, faire un tirage au sort et gérer les wishlists. Ce guide vous explique comment lancer le projet et tester les fonctionnalités.

🖥️ Prérequis

Avant de commencer, assurez-vous d’avoir installé :

Node.js
(version 18 ou supérieure recommandée)

npm
(normalement installé avec Node.js)

MongoDB
ou un accès à une base MongoDB distante

Postman
pour tester les API

📂 Cloner le projet
git clone https://votre-repo-git.com/secret-santa.git
cd secret-santa

⚙️ Installer les dépendances
npm install

🔧 Configuration

Copiez le fichier .env.example en .env et remplissez vos variables :

# MongoDB
MONGODB_URI=mongodb://localhost:27017/secret-santa

# Mailjet
MJ_APIKEY_PUBLIC=your-public-key
MJ_APIKEY_PRIVATE=your-private-key
SENDER_EMAIL=your-email@example.com

# Node environment
NODE_ENV=development
PORT=3000


Remplacez your-public-key, your-private-key et your-email@example.com par vos identifiants Mailjet.

🚀 Lancer le serveur
npm run dev


Le serveur démarre sur http://localhost:3000.

📝 Tester l’API avec Postman

Importer la collection Postman :

Créez une collection Secret Santa et ajoutez les routes suivantes :

Authentification

POST /auth/login : Se connecter pour récupérer le token.

POST /auth/register : Créer un utilisateur.

Événements

POST /events/create : Créer un nouvel événement.

GET /events/list : Lister tous les événements.

GET /events/:id : Récupérer les détails d’un événement.

POST /events/join/:id : Rejoindre un événement.

POST /events/invite/:id : Inviter un participant.

POST /events/draw/:id : Lancer le tirage au sort.

Wishlist

POST /wishlist/add : Ajouter un item.

GET /wishlist/list : Lister vos items.

DELETE /wishlist/delete/:id : Supprimer un item.

GET /wishlist/draw/:uuid : Récupérer la wishlist du receiver (après tirage).

N’oubliez pas d’ajouter le token Bearer dans les headers pour toutes les routes protégées par authMiddleware.

🧪 Tests unitaires

Le projet utilise Vitest pour les tests :

npm run test


Les tests couvrent :

Création d’événements

Tirage au sort

Envoi d’emails (mocké)

Gestion des wishlists

📬 Email

Le projet utilise Mailjet pour envoyer les notifications.

Vérifiez vos identifiants API et votre domaine pour éviter d’être considéré comme spam.

⚡ Tips pour les débutants

Lancez MongoDB avant le serveur si vous utilisez une base locale.

Utilisez Postman pour tester chaque route séparément.

Inspectez les logs pour comprendre les erreurs (console du serveur).

Commencez par créer un utilisateur, puis un événement, inviter des participants et enfin lancer le tirage.

🛠️ Commandes utiles
Commande	Description
npm run dev	Démarre le serveur en mode développement
npm run build	Compile le projet (production)
npm start	Lance le serveur en production
npm run test	Lance les tests unitaires