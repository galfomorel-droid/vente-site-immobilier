# 🚀 Guide de mise en ligne sur Railway — creationsiteimmobilier.fr

Tout est déjà préparé. Il te reste essentiellement à **te connecter** et à **lancer 3 commandes**.

---

## ÉTAPE 1 — Réserver le nom de domaine (5 min)
- Sur **ovh.com** (ou gandi.net), achète `creationsiteimmobilier.fr`.
- Active l'adresse email **contact@creationsiteimmobilier.fr** (souvent incluse) — elle servira au formulaire.

---

## ÉTAPE 2 — Déployer sur Railway (10 min)

Ouvre le **Terminal** (app macOS), puis copie-colle :

**Le plus simple — un seul script :**
```bash
cd ~/Desktop/site-immobilier
bash deploy-railway.sh
```
Il enchaîne connexion + création du projet + déploiement + URL publique.

**Ou manuellement, commande par commande :**
```bash
cd ~/Desktop/site-immobilier
npx @railway/cli login      # ➜ ouvre le navigateur : connecte-toi / crée ton compte
npx @railway/cli init       # ➜ donne un nom au projet (ex. creationsiteimmobilier)
npx @railway/cli up         # ➜ déploie : Railway installe et lance le serveur
npx @railway/cli domain     # ➜ génère une URL publique (xxxx.up.railway.app)
```

➡️ Ton site est **en ligne** sur l'URL affichée. 🎉
*(`npx` télécharge le CLI à la volée — aucune installation requise.)*

---

## ÉTAPE 3 — Recevoir les messages du formulaire par email (5 min)
Sur **railway.app** → ton projet → onglet **Variables** → ajoute (valeurs dans `.env.example`) :

| Variable | Exemple |
|---|---|
| `CONTACT_TO` | contact@creationsiteimmobilier.fr |
| `CONTACT_FROM` | contact@creationsiteimmobilier.fr |
| `SMTP_HOST` | ssl0.ovh.net |
| `SMTP_PORT` | 465 |
| `SMTP_USER` | contact@creationsiteimmobilier.fr |
| `SMTP_PASS` | (mot de passe de l'email) |

Railway redéploie tout seul. → Les demandes arrivent dans ta boîte mail.
*(Sans ces variables, le site marche quand même ; les messages apparaissent dans les **logs Railway**.)*

---

## ÉTAPE 4 — Brancher ton domaine + HTTPS (10 min)
Sur Railway → ton service → **Settings → Networking → Custom Domain** :
1. Saisis `creationsiteimmobilier.fr`.
2. Railway donne un enregistrement **CNAME** → crée-le chez OVH (zone DNS).
3. HTTPS 🔒 activé automatiquement.

---

## ÉTAPE 5 — Personnaliser (à ton rythme)
Dans `index.html` : ton téléphone, tes réseaux (LinkedIn/Insta/Facebook), les URL et captures des réalisations.
Dans `mentions-legales.html` / `confidentialite.html` : remplace tout ce qui est surligné en jaune.

---

## ÉTAPE 6 — Référencement Google
- **Search Console** → soumettre `sitemap.xml`.
- **Google Business Profile** → créer ta fiche (référencement local).

---

✅ **Étapes 1 + 2 = site en ligne.** Le reste se complète ensuite.

> Astuce : un script `deploy-railway.sh` est inclus — lance `bash deploy-railway.sh` pour enchaîner login + init + up.
