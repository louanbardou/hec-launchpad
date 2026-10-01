# HEC Launchpad — plateforme communautaire (plan v1, 2026-10-01)

## Objectif
Une seule plateforme mobile-first pour la promo Launchpad : poster des idées, trouver un cofondateur,
upvoter, commenter. Hébergée et déployée sur GitHub (GitHub Pages + GitHub Actions).

## Contrainte clé
GitHub Pages ne sert que du statique : pas de base de données, pas de serveur.
Les upvotes, comptes et posts exigent donc un backend hébergé ailleurs, gratuit, appelé depuis le navigateur.

## Stack retenue
| Couche | Choix | Pourquoi |
|---|---|---|
| Front | Vite + React + TypeScript | build statique, rapide, bien documenté pour GitHub Pages |
| UI | Tailwind CSS | mobile-first natif, thème sombre/clair simple |
| Routing | React Router en HashRouter (ou fallback 404.html) | GitHub Pages ne gère pas le history routing |
| PWA | vite-plugin-pwa | installable sur l'écran d'accueil iOS/Android, icône, splash |
| Backend | Supabase (Postgres + Auth + Realtime + Storage) | gratuit, RLS côté DB, 50k MAU, open source |
| Auth | Magic link par email, domaine restreint à @hec.edu (trigger SQL) | zéro mot de passe, réservé à la promo |
| Déploiement | GitHub Actions → GitHub Pages | push sur main = mise en prod |
| Keep-alive | GitHub Actions cron (ping toutes les 72h) | évite la pause Supabase après 7 jours d'inactivité |

Alternatives écartées : Firebase (propriétaire, facturation par lecture), PocketBase (nécessite un VPS),
GitHub Discussions comme backend (oblige chaque étudiant à avoir un compte GitHub).

## Modèle de données (Postgres / Supabase)
- profiles : id (= auth.users.id), display_name, avatar_url, bio, skills[] (tech, business, design, ...),
  looking_for[] (cofounder / idée / équipe), availability, linkedin_url, created_at
- ideas : id, author_id, title, pitch (280 car.), description, stage (idée / proto / lancé),
  needs[] (compétences recherchées), tags[], created_at, updated_at
- votes : (user_id, idea_id) PK → un upvote par personne, toggle
- comments : id, idea_id, author_id, body, created_at
- cofounder_posts : id, author_id, headline, body, skills_offered[], skills_wanted[], status (open/closed)
- bookmarks : (user_id, idea_id)
- Vue idea_feed : ideas + count(votes) + count(comments) + voted_by_me, tri "hot" / "new" / "top"
- RLS : lecture réservée aux connectés ; insert/update/delete réservés à l'auteur.

## Écrans (mobile d'abord, 5 onglets en bas)
1. Feed — cartes d'idées, bouton upvote large, tri hot/new/top, pull-to-refresh
2. Cofounders — annuaire filtrable par compétence / besoin, cartes profil, bouton "contacter"
3. + (FAB) — poster une idée ou une annonce cofondateur en 3 champs
4. Idée (détail) — pitch, besoins, auteur, commentaires, bouton "je veux rejoindre"
5. Profil — édition, mes idées, mes votes, déconnexion
Connexion : écran unique "ton email HEC" → lien magique.
Desktop : même app centrée à 640 px max, nav en haut.

## Phases
### Phase 0 — Setup (jour 1)
- Repo GitHub `hec-launchpad`, projet Supabase, schéma SQL + RLS + trigger domaine @hec.edu
- Vite + React + TS + Tailwind + PWA, workflow Actions, premier déploiement vide sur Pages
### Phase 1 — MVP (semaine 1)
- Auth magic link, profil, feed d'idées, création d'idée, upvote (optimistic UI), détail + commentaires
### Phase 2 — Cofounders (semaine 2)
- Annuaire, filtres par compétence, annonces cofondateur, contact (mailto ou lien LinkedIn)
### Phase 3 — Finitions (semaine 3)
- Realtime sur les votes, notifications push PWA (optionnel), modération admin (rôle admin), domaine custom
### Phase 4 — Lancement
- Test sur 5 téléphones (iOS Safari + Android Chrome), import des membres, annonce promo

## Risques / points d'attention
- Pause Supabase après 7 jours sans activité → cron keep-alive + l'usage réel suffit
- Domaine @hec.edu : vérifier le format exact des adresses étudiantes (prenom.nom@hec.edu ?)
- Spam / modération : rôle admin + bouton signaler dès le MVP
- RGPD : mention légale minimale, suppression de compte en un clic

## Sources
- Supabase free tier 2026 : https://uibakery.io/blog/supabase-pricing, https://costbench.com/software/database-as-service/supabase/free-plan/
- Domaine email restreint (trigger SQL) : https://www.rapidevelopers.com/supabase-tutorial/how-to-allow-sign-in-only-with-specific-domains-in-supabase
- Vite → GitHub Pages : https://vite.dev/guide/static-deploy, https://github.com/sitek94/vite-deploy-demo
- Routing SPA sur Pages : https://paulserban.eu/blog/post/deploy-vite-react-with-react-router-app-to-github-pages/
- Comparatif backends 2026 : https://semakod.cz/en/blog/supabase-vs-firebase-vs-appwrite-vs-pocketbase-2026/
