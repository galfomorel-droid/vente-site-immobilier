# 🚀 Mise en ligne sur GitHub Pages — creationsiteimmobilier.fr

Le site est statique : GitHub Pages l'héberge gratuitement, et Web3Forms envoie
les demandes du formulaire par email. Le code est déjà prêt (fichier `CNAME`, formulaire).

---

## ÉTAPE 1 — Activer GitHub Pages (2 min)
Sur github.com → dépôt **galfomorel-droid/vente-site-immobilier** → **Settings → Pages** :
1. **Source** : *Deploy from a branch* → branche **main**, dossier **/ (root)** → **Save**.
2. **Custom domain** : `www.creationsiteimmobilier.fr` → **Save**.
3. Quand le certificat est prêt (quelques minutes après l'étape 2), cocher **Enforce HTTPS**.

---

## ÉTAPE 2 — Pointer le domaine chez OVH (5 min)
OVH → **Noms de domaine → creationsiteimmobilier.fr → Zone DNS** :
- Modifier l'entrée **CNAME** du sous-domaine **www** : cible `galfomorel-droid.github.io.`
  (elle pointait vers Railway : `2f00140r.up.railway.app.`).
- Domaine sans `www` : onglet **Redirection** → `creationsiteimmobilier.fr` vers
  `https://www.creationsiteimmobilier.fr` (redirection permanente 301).

La propagation prend de quelques minutes à quelques heures.

---

## ÉTAPE 3 — Recevoir les demandes du formulaire (2 min)
1. Sur **web3forms.com**, saisir l'adresse email qui doit recevoir les demandes → la clé arrive par email.
2. La coller dans `index.html`, champ `access_key` du formulaire `#contact-form`, puis publier.

---

## ÉTAPE 4 — Résilier Railway
Le site n'utilise plus Railway : supprimer le projet sur railway.app pour éviter toute facturation.

---

## ÉTAPE 5 — Référencement Google
- **Search Console** → soumettre `sitemap.xml`.
- **Google Business Profile** → créer la fiche (référencement local).
