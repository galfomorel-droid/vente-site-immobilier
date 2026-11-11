# Création Site Immobilier — site vitrine

Site vitrine statique (HTML/CSS/JS), hébergé gratuitement sur **GitHub Pages**
(domaine `www.creationsiteimmobilier.fr`, déclaré dans le fichier `CNAME`).
Le formulaire de contact passe par **Web3Forms** : aucun serveur à maintenir.

## Aperçu en local
```bash
python3 -m http.server 4173   # puis http://localhost:4173
```

## Publier une modification
Commit + push sur la branche `main` (GitHub Desktop → « Push origin ») :
GitHub Pages republie le site en 1 à 2 minutes.

## Formulaire de contact
Dans `index.html`, formulaire `#contact-form`, champ caché `access_key` :
y coller la clé Web3Forms (gratuite, obtenue sur web3forms.com avec l'adresse
qui doit recevoir les demandes). Sans clé, le formulaire affiche un message
d'indisponibilité et renvoie vers le téléphone — jamais de faux succès.
