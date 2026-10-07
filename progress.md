# Session Progress Log

## Current State

**Last Updated:** 2026-10-07 (Asia/Taipei)
**Active Feature:** none — four-scanned-source-groups is done locally.
**Application baseline:** 7e47cd9; repository `LEO0331/competition-practice`.

## What's Done

Added a project-specific agent contract, factual feature state, cross-platform verification command and concise session handoff. No placeholder backlog, application change or new dependency. The harness protects the elderly-user design, original PDF content, separate full/review progress and rename-safe Pages paths.

## What's Next

No product feature is pending. Start from the next concrete user request. Read `AGENTS.md` and the handoff before edits; track one active feature and record fresh evidence.

## Blockers / Risks

No known blocking failure. Physical iOS home-screen installation and actual browser zoom remain untested from the previous UI session; narrow-width reflow is not a substitute. Browser-only progress has no cloud copy. Structural harness scores do not prove improved real-world agent outcomes; representative before/after sessions have not been benchmarked.

## Files Modified This Session

`AGENTS.md`, `feature_list.json`, `progress.md`, `session-handoff.md`, `init.sh`, `.gitattributes`, `scripts/verify.mjs`, and the `verify` entry in `package.json`.

## Evidence of Completion — 2026-10-01

- `npm run verify`: PASS in PowerShell. Derives `/competition-practice` from origin and runs dataset validation, ESLint, TypeScript, all 25 Node tests, static build and export verification (70 asset references).
- `bash init.sh` using Git Bash: PASS through the same gates. LF shell line endings are enforced by `.gitattributes`.
- Fail-fast probe with a temporary failing npm CLI: first validation gate exited 23; subsequent gates did not run. The runner preserved the failure status. Probe is under ignored `tmp/`.
- `PAGES_BASE_PATH=/harness-rename-check` build + export check: PASS, 70 asset references. Normal production-prefix output restored afterwards.
- Skill `validate-harness.mjs --target . --json`: 100/100 structural score; instructions, state, verification, scope and lifecycle each 5/5. No subsystem is lower than the others.
- `git diff --check`: PASS. UI, source dataset, storage keys, icons and deployment workflow unchanged.

## Decisions Made

Use a small root guide with existing docs for details. Keep `npm run verify` as the Windows/Bash entry point; `init.sh` only delegates. Verification neither installs dependencies nor deploys. Keep the customer-facing README unchanged; agent state belongs in dedicated files.

## Notes for Next Session

Do not infer a new product feature from this harness or rerun completed work without a new requirement. Check Git history/status for commit and publication state; local verification alone is not live deployment evidence.


## Session — Environment Source Images (2026-10-01)

- Request: adapt the supplied question pictures and review-only pictures into the existing simple site.
- Added 28 questions for 112 北市金頭腦考題, 58 for 112 全國金頭腦考題, and 48 review pages. All79 original JPGs retained unchanged and SHA-256 inventoried. Original114 dataset still has60 questions without any diff.
- UI: existing question flow reused; source images only available after answering. Separate `/notes/environment-notes/` reader uses the existing typography/cards/previous-next layout and a `competition-practice:notes:v1:<collectionId>` position key. No practice results overwritten, new dependency or advanced menu.
- Source boundaries: national 第4-3/4-4 absent; IMG_9613 absent; source carbon-cycle answer4 contains a question-mark annotation. Blurry poster fine print uses explicit placeholders. Full details in `docs/IMAGE_SOURCE_REVIEW.md`; no guessed questions or facts.
- Verification: `npm run verify` PASS — validation, lint, typecheck,36 tests, static build and243 asset refs. Renamed `/renamed-practice/` build/export also PASS. Original current-prefix output restored.
- Browser: 375px reader/quiz no horizontal overflow,20px body text; saved reading position restored after reload; new quiz answers locked and question2 resumed; original JPG loaded at correct prefix and summary expanded with keyboard. Independent review compared12 MCQs from5 originals and found no discrepancies.
- Files: new source question/study data and inventory, original images, notes route/cards/reader, source/study types/helpers/validators, existing homepage/practice/CSS/export/data report, source review docs, README, tests and harness state.
- Remaining gaps: actual browser zoom and physical mobile installation remain earlier-session gaps; some source text/answers intentionally require manual source review. No current code/test blocker. Check Git history for publication/deployment state; local build alone does not prove live deployment.


## Session — Additional Source PDFs (2026-10-02)

- Added113 群英會全國賽－環保金頭腦:65 questions, including5 warmup and60 main rows. Retained original source labels and4 actual PDF page references; no source explanations or images.
- Added114 群英會－灌籃高手:30 questions across3 pages,15 source explanations and15 null. RecoveredQ11 explanation from a borderless cell; preserved source typos and Q1's original citation rather than inventing commentary. No images/URLs required.
- Source verification: visually inspected all7 rendered pages; independent table comparison matched all95 stems, four choices, answer indices and page mappings after whitespace/Unicode compatibility normalization. Detailed audit records in docs/113-national-source-review.md and docs/114-guanlan-source-review.md.
- Current checks: npm run verify PASS — dataset validation, lint, typecheck,39 tests, static build and269 exported asset references. Added tests for65/30 counts, deterministic IDs, warmup/main label boundaries, page distribution and recovered source explanation.
- Browser375px: both new routes work, correct answer locks all four choices, PDF source labels display, question2 resumes after refresh. Existing UI/design, old datasets, study pages and full/review/notes progress helpers unchanged.
- Files: two typed data files, registry, three provenance docs, README, tests and harness state. Site now241 practice questions across5 sets plus48 review pages.
- No unreadable or missing new-source rows. Original suspicious wording remains unchanged and documented. Actual browser zoom and physical home-screen installation remain earlier-session gaps.
- Publication: consult Git history/Actions for the current commit and deployment state; local build alone is not publication evidence.


## Session — Study Navigation and Random Practice (2026-10-02)

- Added native48-pageTOC and labelled select. Valid jumps save existingnotes:v1 position and focus H1 without a route reload.20 optional navigation labels only on generic pages1–12,27–31,34–35,45; source title/text/images/order unchanged.
- Fisher-Yates creates one optionalquestionOrder on fullv1 progress. Existing sequential records remain valid; invalid orders fall back safely without rewriting storage on load. Source questions and answer choices unchanged. Wrong review remains source-ordered on its separate key.
- Random buttons use existing inline reset confirmation/cancel. Completed random attempts explicitly offer再次隨機練習 and draw fresh progress.
- Actual checks: individual validation/lint/typecheck/tests and npm run verify PASS;50 tests; production andrenamed builds/export PASS with269 assets each.
- Browser375px: TOC labels wrap/no horizontal overflow; select/TOC focus sourceH1; reload kept page45. Random reload/cancel preserved position;30 unique questions completed; source-first wrong review preserved full8/30 result; fresh random retry cleared answers and changed order.
- Files: StudyReader/QuestionPractice/QuestionSetCard; study/progress/review/shuffle helpers; study type/validation/navigation metadata; scoped CSS; tests; README/data docs and state. Independent review found no blocker.
- Publication NOT performed. Automatic approval review rejected the combined commit/push-main action because the current request lacked explicit authorization for that externally consequential publication. A permission question is pending. Do not bypass rejection; publish only after direct user approval.
- Physical mobile installation/actual browser zoom remain previous-session gaps. Implementation has no pending code work; GitHub Pages still runs the prior committed version.

### Publication approval

The user directly answered "Yes, publish to main" to the explicit commit/push/deployment question. The prior missing-authorization condition is resolved; publishing this verified update is authorized. Check the final Git/Actions state for completion.

## Session — Dropdown-Only Study Navigation (2026-10-02)

- User chose the native dropdown as the sole mobile page-jump control. Removed the duplicate複習目錄 block and5unused CSS rules; updated README/data-guide wording. Source data, saved notes key, navigation summaries and jump/focus helper unchanged.
- Checks:10existing study regression tests passed before deletion; npm run verify PASS (50tests, validation/lint/typecheck/build and269export references).375px browser verified no directory or horizontal overflow, select focusesH1 and page2 resumes after reload.
- Files: StudyReader.tsx, globals.css, README.md, ADDING_QUESTION_SET.md and harness state. No new dependency, risk or migration. Publishing this correction follows the user's approved navigation-update workflow; final remote status must be checked.

## Session — Prepublication Mobile Polish (2026-10-02)

- Actual issue: brand hit rectangle27px, whileotherimportant controls52px+. Increasedbrand min-height to52; headercontainerflex and adjusted verticalpadding retain measuredheader75px mobile/87px tablet. Body20px, question28px, button21px andchoice22px preserved.
- CSS safe areas: left/right max(gutter,envinset) avoids extra padding on normalbrowsers; header adds top inset andfooter adds bottom inset. Viewport-fit=cover added with no zoom restriction. html text-size-adjust100% prevents unexpected Safari text inflation; systemfonts retained.
- Added safe button wrapping/maxwidth/minwidth only. Existing image aspect/maxwidth, primarycontinue/secondaryreset hierarchy, stackedmobileactions, randomlabel anddropdown are already sound. Directory stays removed. No sticky/bottom navigation, new feature/dependency/backend/offline code.
- Checks: baseline andpostchange npm run verify PASS — validation/lint/typecheck/50tests/build/269exportreferences.375/390/430/768 homepage nooverflow; brand52, primaryactions59.5, normalheaderheight unchanged.375image choices allloaded/aspectpreserved; select56, posteraspectpreserved andoriginal-link retained.
- 2xCSS magnification (ignoredtemporarypreview query) exercised homepage, restartconfirmation, answerresult, unansweredquestion, randompractice andstudyreader: nohorizontaloverflow andminimumphysicaltarget104px. This is an approximation, NOT actualbrowserzoom. Zoomshortcuts hadnoeffect; IAB exposesnozoomcapability. Actual200%browserzoom andphysicalSafari/notch/homeindicator behavior remain unverified.
- Application files changed: globals.css andlayout.tsx only. Statefiles updated. No sourcecontent/storage/behavior changes. Result is local, uncommitted andnotpublished, consistent with the requested prepublication review.

## Session — CI Toolchain Repair (2026-10-02)

- Fast-forwarded cleancheckout to maina1305bb, whichmerged DependabotTS7.0.2 andESLint10.11.0 despite failingchecks. TS7 lacksAPIexpectedbycurrenttypescript-eslint (peer>=4.8.4<6.1); TSrollback thenreproducedESLint10React display-name crash (removedgetFilenameAPI).
- Restoredtypescript~5.9.3 andeslint^9.39.5; regeneratedlock. PreservedNode typings26 andotherunrelatedupdates. TargetedDependabotignoresTS>=7/ESLint>=10 preventrepeatproposals whilemonthlygroups/limits remain.
- Actualchecks: npm install thennpm ci succeeded,0auditvulnerabilities. npm run verify PASS: validation/lint/typecheck/50tests/build/269exportrefs. YAMLparsed andskips asserted; everylockedTS/ESLintversion confirmed; gitdiffcheckpass. No application/source/workflow change.
- Temporarytradeoff: ESLint9 emits EOLdeprecationnotice; revisitignoredmajorlines whenNextlintplugins supportnewAPIs. DualTypeScript7+6 compileraliases rejectedas unnecessarycomplexity.
- PublishNOTperformed. Automaticapprovalreview rejectedcombinedcommit/pushmain becausecurrentrequestdidnotexplicitlyauthorizepublication. A directapprovalquestion ispending. Do notbypassreview orclaimGitHubCIrepaireduntilpublishedandchecked.

### Publication approval

User directly answered "Yes, publish the fix" to commit/pushmain andtriggerCI/Pages. The missingauthorizationconditionisresolved. Publicationproceeding; verifyactualActionsstatus.

## Session — Four Scanned Source Folders (2026-10-07)

- Started clean at c802a01 with Node 24.14.0. Current baseline verification passed 50 tests and 269 export references. Next.js Windows path resolution required host execution outside the restricted sandbox; no tooling changes were needed.
- Preserved six PDFs unchanged with a SHA-256 manifest in sources/scanned-practice/. Visually inspected all 36 pages and rotated them upright at original resolution. Eight independent sets add 472 questions (191/24/20/45/65/45/22/60), preserving source labels, pages, answers and explanations. Existing datasets, assets, progress and UI are unchanged; no dependencies added.
- Four review pages retain nine incomplete 2023 rows: 53,68,169,176,179,181,184,185,191. Five partial explanations explicitly mark unclear text. A supplementary URL token and an AQI printed2/handwritten4 conflict remain documented. Source clipping cannot be recovered through sharpening; no text was invented or generatively redrawn.
- Readable transcription avoids miniature table reading. Two reviewers confirmed the city paper's blurry option from an enlarged image; it now displays as text. Full scans appear only after answering or in explicit review material. The scanned national paper overlaps the existing official version but differs in wording, order and pages; a new ID protects existing progress.
- Changed: eight question files and registry; one review collection and registry; 36 source JPEGs; six PDFs and manifest; two source-path validators; dataset/study/scanned-source regression tests; README, source-review index and five review documents; feature/progress/handoff records. Validators now accept safe independent source folders, with traversal, external URL and missing-asset checks.
- Final npm run verify passed validation, lint, typecheck, 56 tests, static build and 862 export references. git diff --check passed. Actual 375px Chromium checks passed for all eight sets: choices at least52px, visible focus, locked answers, originals hidden before answering, upright images loaded, no overflow and question2 resume. Review page4 resume and restart cancellation passed; zero page errors. Screenshots/results are in ignored tmp/new-scans/; visual verdict94/pass is in ignored .omx/state/four-scanned-source-groups/ralph-progress.json.
- Local and uncommitted; not pushed or deployed. Physical devices, native browser zoom and live publication remain untested. No pending implementation or permission question.

### Publication authorization — 2026-10-07

User explicitly requested commit and push. The verified scan additions will be committed to main using Lore trailers and pushed to origin. Remote CI/Pages must be checked separately; local verification does not establish deployment.
