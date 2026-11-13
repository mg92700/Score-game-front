# score-game-front

Front Angular de **score-game** : matchs du jour, fiche match (blessés + motifs, pronostic, compositions, stats,
résumés des conférences de presse) et classements. Mise à jour en temps réel via Supabase Realtime.

- Lecture seule via les fonctions RPC `sg_*` de Supabase (clé *publishable*, protégée par la RLS).
- `npm ci && npx ng serve` pour développer ; `npx ng build` pour compiler.
- Déploiement GitHub Pages (workflow `deploy.yml`, routage par hash).
