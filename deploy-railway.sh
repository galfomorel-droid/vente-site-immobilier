#!/usr/bin/env bash
# Déploiement Railway en une commande : bash deploy-railway.sh
set -e
cd "$(dirname "$0")"

if ! command -v railway >/dev/null 2>&1; then
  echo "→ Installation du CLI Railway..."
  npm i -g @railway/cli
fi

echo "→ Connexion à Railway (ouvre le navigateur)..."
railway whoami >/dev/null 2>&1 || railway login

echo "→ Initialisation du projet (si nécessaire)..."
railway status >/dev/null 2>&1 || railway init

echo "→ Déploiement..."
railway up

echo "→ Génération d'une URL publique..."
railway domain || true

echo "✅ Terminé. Ouvre l'URL affichée ci-dessus."
