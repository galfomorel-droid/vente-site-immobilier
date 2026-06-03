#!/usr/bin/env bash
# Déploiement Railway en une commande :  bash deploy-railway.sh
# Utilise npx (aucune installation globale nécessaire).
set -e
cd "$(dirname "$0")"

# Utilise le railway global s'il existe, sinon npx.
if command -v railway >/dev/null 2>&1; then
  RW="railway"
else
  RW="npx --yes @railway/cli@latest"
fi

echo "→ Connexion à Railway (ouvre le navigateur)..."
$RW whoami >/dev/null 2>&1 || $RW login

echo "→ Initialisation du projet (si nécessaire)..."
$RW status >/dev/null 2>&1 || $RW init

echo "→ Déploiement du dossier courant..."
$RW up

echo "→ Génération d'une URL publique..."
$RW domain || true

echo "✅ Terminé. Ouvre l'URL affichée ci-dessus."
