# Chrono Crawler deployment

## Quality gate

Pull requests are validated before merge by GitHub Actions. Direct main updates also pass build, systems and browser checks before the Pages deploy can replace the live version.

## GitHub Pages

A push to `main` starts the Pages workflow. Production remains on its last successful deployment until the new build passes all release checks. A pushed commit is not, by itself, a deployed version.

The Pages job performs:

1. checkout `main`
2. install locked dependencies with `npm ci`
3. build the production bundle
4. run the browser-independent systems suite
5. install Chromium and run the full browser suite
6. retain test evidence, including failures
7. copy runtime assets into `dist/assets`
8. upload the Pages artifact
9. deploy to GitHub Pages

If build or tests fail, deployment stops. The hosted runner uses software rendering: one campaign capture case took about 28-31 seconds in the September 10 run. Do not treat a long-running suite as a stall without failure evidence. Tests have isolated page/storage fixtures and run with two CI workers; the suite stops after five failures or 30 minutes, and the job is bounded at 35 minutes. Local runs keep one worker.

CI pass/fail and renderer assertions do not replace a human visual review or a continuous ordinary-input campaign playthrough. The agent's local browser remains subject to task access settings; CI captures must not be used to circumvent a saved browser denial.
