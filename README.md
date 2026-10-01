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

## Supabase (projet `vefteekkrtoyshkhhedp`, région eu-west-1)

Déjà configuré le 2026-10-01 via l'API de management : schéma `supabase/schema.sql` appliqué, URL du site et
redirections, code OTP à 6 chiffres, variables `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` dans GitHub Actions.
Le token d'accès Supabase est dans le trousseau macOS (`security find-generic-password -s supabase-access-token -w`), jamais dans le repo.

Rejouer le schéma après modification :

```bash
T=$(security find-generic-password -s supabase-access-token -w)
python3 -c "import json,sys;print(json.dumps({'query':open('supabase/schema.sql').read()}))" | \
  curl -s -X POST https://api.supabase.com/v1/projects/vefteekkrtoyshkhhedp/database/query \
  -H "Authorization: Bearer $T" -H "Content-Type: application/json" -d @-
```

### Emails de connexion : limite à lever avant le lancement

L'envoi d'emails par défaut de Supabase est limité à quelques emails par heure et le template n'est pas modifiable
sur le plan gratuit : l'email contient seulement un lien, pas le code à 6 chiffres. Le lien fonctionne s'il est
ouvert dans le même navigateur que celui qui l'a demandé (PKCE).

Pour une promo entière, brancher un SMTP gratuit (Brevo : 300 emails/jour) :
1. Compte sur brevo.com, puis SMTP & API → clé SMTP.
2. Dans Supabase, Authentication → SMTP Settings (ou via l'API `config/auth` : `smtp_host`, `smtp_port`, `smtp_user`, `smtp_pass`, `smtp_sender_name`, `smtp_admin_email`).
3. Ensuite, le template "Magic Link" devient modifiable : y mettre `{{ .Token }}` pour afficher le code.

Domaines autorisés : table `allowed_domains` (`hec.edu`, `hec.fr`). Nommer un admin : `update profiles set is_admin = true where id = '<uuid>';`

## Structure

```
src/lib/        types, API (Supabase ou démo), auth
src/pages/      Feed, IdeaDetail, NewPost, Cofounders, Members, Profile, Login
src/components/ BottomNav, IdeaCard, VoteButton, Chips, TopBar, Avatar
supabase/       schema.sql (tables, vue idea_feed, RLS, trigger domaine)
.github/        deploy.yml (Pages), keepalive.yml (ping Supabase tous les 3 jours)
```
