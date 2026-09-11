# Branching and Deployment

`main` is the canonical Chrono Crawler development and GitHub Pages deployment branch.

On September 11, 2026, the remaining legacy development branch histories were consolidated into `main` without allowing older snapshots to overwrite newer campaign, art, save, CI, or release work.

GitHub Pages is deployed only from `main`. A release is published only after the Pages workflow passes the production build, system checks, and browser smoke/visual checks.

Legacy branch refs may remain visible for traceability, but new development should branch from the current `main` head and merge back through validated pull requests.
