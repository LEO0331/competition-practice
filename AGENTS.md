# Competition Practice — Agent Guide

<!-- AUTONOMY DIRECTIVE — DO NOT REMOVE -->
YOU ARE AN AUTONOMOUS CODING AGENT. EXECUTE TASKS TO COMPLETION WITHOUT ASKING FOR PERMISSION.
DO NOT STOP TO ASK "SHOULD I PROCEED?" — PROCEED. DO NOT WAIT FOR CONFIRMATION ON OBVIOUS NEXT STEPS.
IF BLOCKED, TRY AN ALTERNATIVE APPROACH. ONLY ASK WHEN TRULY AMBIGUOUS OR DESTRUCTIVE.
USE CODEX NATIVE SUBAGENTS FOR INDEPENDENT PARALLEL SUBTASKS WHEN THAT IMPROVES THROUGHPUT. THIS IS COMPLEMENTARY TO OMX TEAM MODE.
<!-- END AUTONOMY DIRECTIVE -->

## Startup Workflow

Before writing code:

1. Confirm the checkout and inspect `git status --short` and `git log -5 --oneline`. Preserve other people's changes.
2. Read `README.md`, `feature_list.json`, `progress.md`, and `session-handoff.md`. Read `docs/ADDING_QUESTION_SET.md` and `docs/source-review.md` for dataset work.
3. Use Node.js 24 and npm. On a fresh checkout, run `npm ci`. Run `npm run verify` to establish the baseline before substantive application/tooling changes; for wording-only edits, check links and `git diff --check`.
4. Follow the current user request. If no work is requested and no feature is active, report readiness; do not invent a feature or restart completed work.

## Product Invariants and Scope

- Elderly users come first: Traditional Chinese (`zh-Hant`), Taiwanese terminology, body text about 20px+, questions about 28px, touch targets at least 52px, visible focus, simple navigation, no color-only feedback. Preserve the calm light design.
- Remain a Next.js App Router / React / TypeScript static export on GitHub Pages. No backend, accounts, database, external API, new dependencies, or service worker/offline caching unless explicitly requested.
- Do not add search, categories, dashboards, timers, gamification, or other unrequested features.
- Keep PDF wording, choices, answers, explanations, images, and provenance intact. Clean only extraction artifacts. Missing explanations stay `null`; uncertain transcription goes in `docs/source-review.md`.
- PDFs are independent typed question sets. Register new sets in `src/data/questionSets/index.ts`; do not build a generic PDF importer or hard-code first-set UI logic.
- Preserve `competition-practice:v1:<setId>` full progress. Review uses `competition-practice:review:v1:<setId>` separately. Review cannot overwrite full results. Only explicit restart confirmation may reset unfinished full progress; old `?restart=1` URLs must not reset it.
- Derive published paths from the repository name, not stale Pages metadata. Never hard-code `/competition-practice/` into application asset URLs. A repository rename previously broke CSS/JavaScript; always verify exported paths after deployment changes.

## Working Rules

- One feature at a time: record one `in-progress` feature in `feature_list.json`, with scope, dependencies, and acceptance criteria. Use `not-started`, `in-progress`, `blocked`, or `done`; do not mark done without evidence.
- Keep changes proportional and reuse existing helpers. For cleanup/refactoring, write a bounded plan and protect existing behavior before edits. Prefer deletion over new layers.
- Use native subagents only for independent, bounded work that improves quality or speed. Assign file ownership, tell agents they share the checkout, integrate results, and own final verification. Do not launch OMX/tmux workflows unless requested and supported by the session.
- Never rewrite history, force-push, discard unrelated edits, expose secrets, or hide destructive commands in tooling. Resolve routine reversible choices autonomously; escalate only genuine ambiguity, destructive actions, or missing authority.
- Commit/push only within the user's authorized scope. Commit messages follow Lore: an intent line explaining why, narrative context, and useful native trailers such as `Constraint:`, `Rejected:`, `Confidence:`, `Scope-risk:`, `Tested:`, and `Not-tested:`.

## Verification Commands

- `npm run verify` — fail-fast validation, lint, typecheck, tests, static build, and export checks. Works in PowerShell and Bash. `bash init.sh` is a thin wrapper.
- The runner uses `PAGES_BASE_PATH` if supplied; otherwise it derives the project prefix from Git `origin`. It never installs packages or deploys.
- Individual gates: `npm run validate:data`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, then `node scripts/check-export.mjs` with the same `PAGES_BASE_PATH` as the build.
- UI changes: check actual 375px rendering, keyboard focus, answer locking, progress resume, reset/cancel, and applicable review flows. Inspect images and metadata URLs. Record actual results and untested device/zoom behavior; do not substitute a successful HTTP response for a working page.
- Deployment changes: also build/export-check a renamed repository prefix. A local build is not a live deployment; report remote status only if checked.

## Definition of Done

Requested behavior is implemented within scope, applicable checks pass, source content and saved progress are preserved, evidence/limitations are recorded, and the checkout is restartable. Do not label old test results as current-session verification.

## End of Session

Update `feature_list.json` and append a concise entry to `progress.md` with files, commands/results, decisions, and blockers. Refresh `session-handoff.md` with the current objective, remaining work, and recommended next step. Leave no placeholder tasks; use “none” when nothing is active. Report what changed, what was verified, any gaps, and whether changes are local, committed, pushed, or deployed.
