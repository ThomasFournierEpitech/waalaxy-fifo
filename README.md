
## Description
Projet fait avec NestJs et React (Via Create React App), consistant à reproduire un système Fifo à base d'action qui s'effectue toute les 2 minutes et de crédits qui se recharge toute les 24h.

L'applicatif NestJs sert l'applicatif ReactJs à travers son build statique. Les timers sont gérés coté serveur et sont transmit au client via websocket. Une interface utilisateur basique permet également de mettre en liste d'attente des actions. Ces actions sont configurable depuis le fichier

```bash
/src/shared/config/initialActions.ts
```
et l'état initiale de la Fifo est configurable depuis

```bash

/src/shared/config/initialActions.ts
```



## Installation

```bash
$ npm install
$ cd frontend && npm install && cd -

```

## Running the app

```bash
# development
$ npm run start

```

## Running the app

```bash
# unit test
$ npm run test

```

## NOTE
N'étant pas très familier avec les monorepos, j'ai un peu bidouillé les package.json pour que les commandes npm run start et npm run test installent les dépendances et lancent les applications frontend et backend.

## Features

- Gestion des timers coté serveur
- Call API HTTP (Get, Post) pour récupérer l'état de la FIFO au moment de la connexion du client
- Test unitaire Frontend
- Test unitaire Backend
- Système d'alert UX simple
- Gestion d'erreur des appels API
- Communication par Websocket pour les mises à jour des crédits
- Transmission des erreurs API standardisée
- Simulation d'une database via un provider Repository
- Configuration possible des Actions et de l'état initiale de la FIFO
- Validation des Actions et de l'état initiale de la FIFO pour s'asssurer que la configuration soit cohérente.
- Check des données envoyé par le client via validation des DTO
- Projet structuré par module

## Env
# environnement par défault


```bash
/root/app/test-walaaxy/waalaxy-fifo/fifo/.env
PORT=3001
```

```bash

/root/app/test-walaaxy/waalaxy-fifo/fifo/frontend/.env
REACT_APP_BACKEND_URL='http://localhost:3001'
```