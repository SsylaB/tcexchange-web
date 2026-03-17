# Exchange Destinations Catalog

Petit projet React permettant de consulter un catalogue de destinations universitaires pour un échange académique.  
L'application permet actuellement d'afficher des cartes de destination, de rechercher une université et de filtrer les résultats par pays.

## Stack

- React
- Vite
- React Router
- CSS
- Données mockées en JSON

## Features actuelles

- Affichage d'un catalogue de destinations
- Cartes réutilisables avec infos principales
- Lien vers le site officiel de l'université
- Navigation vers une page détail
- Barre de recherche
- Filtre par pays

## Lancer le projet

```bash
npm install
npm run dev
```

Puis ouvrir l'application sur l'URL affichée dans le terminal, en général `http://localhost:5173`.

## Structure du projet

```bash
src/
  components/
    DestinationCard.tsx
  pages/
    CatalogPage.tsx
    DestinationPage.tsx
  data/
    destinations.json
```

L'application est pour l'instant construite avec des données locales afin d'avancer rapidement sur le front avant une éventuelle connexion à une API.

## Objectifs à venir

- Ajouter d'autres filtres, par exemple langue ou type d'échange
- Améliorer la page détail
- Ajouter une page favoris ou comparaison (feature en développement)
- Connecter le front à une API plus tard
- Ajouter un chatbot d'aide pour l'échange (feature en développement)
- Ajouter un quiz pour aider à choisir sa destination (feature en développement)

## Auteur

Projet réalisé dans le cadre d'un apprentissage React / développement web.