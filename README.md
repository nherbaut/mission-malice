# Mission Malice

Le jeu des petits et grands malins : un jeu familial de missions secrètes, dès 4 ans, sur un seul téléphone. Site statique en français, sans compte, serveur applicatif ni dépendance JavaScript à l’exécution.

Le catalogue contient **60 missions** : mots à faire dire, cris d’animaux, chansons, gestes, imitations et petits services avec des objets du quotidien. Chaque mission possède une consigne audio et une illustration. Les nouvelles missions sont proposées dans les prochaines parties ; les missions d’une partie déjà enregistrée sont conservées.

## Jouer

1. Ajouter les joueurs, y compris l’administrateur. Choisir leur personnage (femme, homme, fille, garçon), leurs cheveux, leur t-shirt, leur peau et leur prénom. Les silhouettes portent une jupe, un pantalon ou un short.
2. Lancer la distribution et choisir un code administrateur de 4 à 8 chiffres. Les joueurs forment une boucle aléatoire unique ; chacun reçoit une cible et une des 60 missions.
3. Passer le téléphone au joueur dont l’avatar et le prénom sont affichés. Un tap révèle sa cible et sa mission illustrée. Le bouton haut-parleur lit la consigne sans changer d’écran. Un autre tap masque la mission et affiche le joueur suivant.
4. Après la distribution, chaque joueur peut revoir sa mission autant de fois qu’il le souhaite, sans code administrateur : toucher **👀 Revoir ma mission** en haut de l’écran, choisir son avatar, puis tapoter pour révéler la mission. Le bouton 🔊 permet de la réécouter. Un nouveau tap la masque et revient aux avatars. Ce parcours reste disponible après fermeture et réouverture du navigateur et affiche toujours la mission actuelle, y compris après une élimination. Lorsqu’une cible a réalisé l’action, le joueur touche « Ma cible a réussi l’action ! » et les deux participants confirment. La cible est éliminée ; sa mission et sa cible sont transmises au joueur qui l’a attrapée.
5. Le dernier joueur en jeu gagne. Il n’y a pas de clôture automatique à une heure donnée ni de départage automatique si plusieurs personnes restent en jeu à la fin de la journée.

Le **Coin des grands**, protégé par le code, affiche les missions actives et les joueurs éliminés. Il permet de changer le code, de préparer une nouvelle partie avec les mêmes avatars ou de tout remettre à zéro après confirmation. Il ne faut pas perdre ce code ; il est enregistré en clair dans le stockage local et ne constitue pas une protection de sécurité.

## Sauvegarde et audio

Toutes les données du jeu sont conservées dans `localStorage`, sous la clé `mission-malice.v1`. Chaque changement est enregistré avant de poursuivre. Après rechargement, les missions et le mode administrateur sont masqués. Un changement d’onglet ou de fenêtre masque aussi les secrets. Une sauvegarde invalide n’est pas écrasée : un écran permet de la télécharger et, avec son code, de la réinitialiser.

Utiliser le même navigateur et la même adresse pour reprendre la partie. Le stockage n’est pas partagé entre téléphones, navigateurs ou domaines ; l’effacer supprime la partie. Les autres sites hébergés sous la même origine GitHub Pages partagent le même stockage du navigateur : la clé du jeu est spécifique à cette application.

La lecture audio utilise `speechSynthesis`, avec une voix française si le téléphone en propose une. La disponibilité et le fonctionnement hors connexion de la voix dépendent du navigateur et des voix installées. Écouter discrètement ou avec une oreillette pour conserver sa mission secrète. Les polices Google sont facultatives ; sans connexion, des polices système prennent le relais. Les avatars et illustrations sont des SVG locaux.

## Développement local

Pour lancer le jeu : Make et Python 3.

```sh
make run
```

Ouvrir <http://127.0.0.1:4173>. Aucun build ni installation n’est nécessaire pour jouer. Arrêter le serveur avec `Ctrl+C`. Le port peut être changé avec `make run PORT=8080`. La commande `npm run dev` reste disponible.

Pour les tests, Node.js 22 est également nécessaire.

```sh
npm ci
npm test
```

Pour les tests de parcours dans Chromium :

```sh
npm ci
npx playwright install chromium
npm run test:browser
```

Un Chrome/Chromium déjà installé peut être utilisé avec `CHROME_PATH=/chemin/vers/chrome npm run test:browser`.

## GitHub Pages

Les chemins d’assets sont relatifs : le site fonctionne à la racine d’un domaine ou dans le sous-dossier d’un dépôt GitHub Pages.

1. Mettre ces fichiers dans un dépôt GitHub et les pousser sur la branche `main` ou `master`.
2. Dans **Settings → Pages → Build and deployment**, choisir **GitHub Actions** comme source.
3. Le workflow `.github/workflows/pages.yml` vérifie les règles et publie les six fichiers publics. Les tests, les dépendances de développement et les sauvegardes ne sont pas publiés.

Aucun secret, aucune variable d’environnement et aucun service tiers ne sont nécessaires au déploiement. Pour une branche par défaut différente, adapter `branches` dans le workflow.
