# Chrono Crawler deployment

## Quality gate

Pull requests are validated before merge by GitHub Actions. The PR workflows own browser smoke tests, production boot checks, visual QA captures, and the production build.

## GitHub Pages

A push to `main` deploys the already-reviewed source state. The Pages workflow intentionally does not run the full Playwright suite again because browser timing on the Pages runner must not turn a successfully reviewed merge into a stale production deployment.

The Pages job performs only deterministic release work:

1. checkout `main`
2. install locked dependencies with `npm ci`
3. build the production bundle
4. copy runtime assets into `dist/assets`
5. upload the Pages artifact
6. deploy to GitHub Pages

If the production build fails, deployment stops. Browser regressions belong to the PR quality gate, where diagnostics and visual QA artifacts are available before merge.
