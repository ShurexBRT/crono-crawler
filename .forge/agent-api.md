# Forge agent runtime

Project key: `CHR`
Gateway: `https://yljhffprkprbgjdaarqi.supabase.co/functions/v1/agent-gateway`
Secret: `FORGE_AGENT_TOKEN`

Read `AGENTS.md` and `.forge/project.json` before work. Chrono Crawler is currently `needs_alignment` in Forge.

Standard loop: `next_ticket` -> `claim` -> work -> `handoff`.

Audits and scoped bug fixes may proceed. Broad gameplay, progression, narrative, platform/input or visual-direction choices must use `decision_request` and block dependent work until PM/owner alignment. Never store or print the raw agent token.

Gateway details and handoff schema are documented in the Forge repository under `docs/AGENT-GATEWAY.md`.