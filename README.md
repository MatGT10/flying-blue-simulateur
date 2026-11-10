# Simulateur de miles Flying Blue

Site statique une page (Vite + React + Tailwind v4, TypeScript) qui compare ce que rapportent
les cartes AMEX Flying Blue Silver, Gold et Platinum selon vos dépenses mensuelles.

## Mettre à jour les chiffres

Tout est dans **`src/data/config.json`**. Aucun autre fichier ne contient de donnée chiffrée.

1. Remplacez chaque valeur marquée `PLACEHOLDER` et vérifiez les nombres à côté des clés `_note`.
2. Mettez `dateMiseAJour` à la date du jour.
3. Passez `donneesVerifiees` à `true` : le bandeau jaune « chiffres en cours de vérification » disparaît.

Au lancement en développement, la console du navigateur liste ce qui reste à compléter.

Les clés commençant par `_` sont des commentaires ignorés par le site.

## Lancer en local

Node.js doit être installé. Il a été installé dans `~/.local/node` : ajoutez-le au PATH
dans `~/.zshrc` si ce n'est pas déjà fait :

```
export PATH="$HOME/.local/node/bin:$PATH"
```

Puis :

```
npm install
npm run dev      # serveur de développement
npm test         # tests du calcul (src/lib/calcul.test.ts)
npm run build    # build de production dans dist/
```

## Déployer sur Vercel

1. Poussez le dossier sur GitHub (ou importez-le avec la CLI Vercel).
2. Sur vercel.com, « Add New Project », choisissez le dépôt : Vercel détecte Vite automatiquement.
3. Déployez. Chaque mise à jour de `config.json` poussée sur la branche principale redéploie le site.

Le site est en ligne sur https://flying-blue-simulateur.vercel.app/ (dépôt GitHub MatGT10/flying-blue-simulateur).
L'image `public/og-image.jpg` (1200 × 630) sert aux
aperçus de lien sur LinkedIn, WhatsApp et Instagram.

## Logique de calcul

Fonctions pures dans `src/lib/calcul.ts`, sans React.

- Dépenses annuelles = saisies mensuelles × 12.
- Miles par carte = Σ (dépenses annuelles par catégorie × taux de la carte pour cette catégorie),
  plus le bonus de bienvenue en mode « 1ère année » si la condition de dépense est atteinte.
- Valeur = miles × valeur du mile (fourchette basse / haute).
- Gain net = valeur − cotisation (cotisation à 0 en mode « 1ère année » si l'offre l'offre).
- Point mort = dépense mensuelle totale, à mix constant, pour que la valeur basse couvre la cotisation.
- Meilleure carte = meilleur gain net médian. Si tout est négatif, « Aucune carte » gagne.
