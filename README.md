# HEC Launchpad

Plateforme mobile-first de la promo Launchpad HEC : idées, cofondateurs, votes, commentaires.

- Front : Vite + React + TypeScript + Tailwind, PWA installable.
- Backend : Supabase (Postgres, auth par code email, RLS). Sans clés Supabase l'app tourne en **mode démo** (données locales au navigateur).
- Hébergement : GitHub Pages, déployé par GitHub Actions à chaque push sur `main`.

## Développement

```bash
npm install
cp .env.example .env.local   # optionnel, sinon mode démo
npm run dev
```

## Brancher Supabase (10 minutes)

1. Créer un projet gratuit sur https://supabase.com (région EU).
2. Dans **SQL Editor**, coller le contenu de `supabase/schema.sql` et exécuter.
3. Dans **Authentication → Providers → Email** : activer Email, désactiver "Confirm email" n'est pas nécessaire, laisser "Enable email OTP".
4. Dans **Authentication → Email Templates → Magic Link**, remplacer le corps par (pour avoir le code à 6 chiffres dans l'email) :
   ```html
   <h2>Ton code HEC Launchpad</h2>
   <p style="font-size:28px;letter-spacing:6px"><b>{{ .Token }}</b></p>
   <p>Ou clique : <a href="{{ .ConfirmationURL }}">me connecter</a></p>
   ```
5. Dans **Authentication → URL Configuration** : Site URL = l'URL GitHub Pages (ex. `https://<user>.github.io/hec-launchpad/`) et l'ajouter aux Redirect URLs.
6. Dans le repo GitHub : **Settings → Secrets and variables → Actions → Variables**, créer
   `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` (Project Settings → API dans Supabase).
7. Relancer le workflow "Deploy to GitHub Pages" (onglet Actions → Run workflow).

Les domaines email autorisés sont dans la table `allowed_domains` (`hec.edu`, `hec.fr` par défaut).
Pour nommer un admin : `update profiles set is_admin = true where id = '<uuid>';`

## Structure

```
src/lib/        types, API (Supabase ou démo), auth
src/pages/      Feed, IdeaDetail, NewPost, Cofounders, Members, Profile, Login
src/components/ BottomNav, IdeaCard, VoteButton, Chips, TopBar, Avatar
supabase/       schema.sql (tables, vue idea_feed, RLS, trigger domaine)
.github/        deploy.yml (Pages), keepalive.yml (ping Supabase tous les 3 jours)
```
