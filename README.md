# Création Site Immobilier — site vitrine

Site vitrine (HTML/CSS/JS) servi par un petit serveur Node, avec un backend de formulaire
de contact. Déployable sur **Railway** en quelques minutes.

## Lancer en local
```bash
npm install      # installe nodemailer (pour l'email du formulaire)
npm start        # http://localhost:4173
```

## Déployer sur Railway

### Option A — Railway CLI (la plus rapide, sans GitHub)
```bash
npm i -g @railway/cli   # déjà installé pour vous si possible
railway login           # ouvre le navigateur
railway init            # crée le projet
railway up              # déploie ce dossier
railway domain          # génère une URL publique
```

### Option B — via GitHub
1. Pousser ce dossier sur un dépôt GitHub.
2. Sur railway.app : **New Project → Deploy from GitHub repo** → sélectionner le dépôt.
3. Railway détecte Node, lance `npm install` puis `npm start`.

## Recevoir les messages du formulaire par email
Dans Railway → onglet **Variables**, ajouter (voir `.env.example`) :
`CONTACT_TO`, `CONTACT_FROM`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`.

Sans SMTP configuré, les messages restent visibles dans les **logs Railway**
(le formulaire reste fonctionnel côté visiteur).

## Domaine personnalisé
Railway → **Settings → Domains → Custom Domain** → `creationsiteimmobilier.fr`,
puis créer l'enregistrement DNS indiqué chez votre registrar (OVH/Gandi). HTTPS automatique.
