# Session Handoff

## Current Objective

None. Central homepage original-image control is implemented and verified locally. User explicitly authorized commit and push on 2026-10-07; publication is proceeding. Previous optional-image implementation3a2c399 was committed/pushed; deployment status was not checked.

## Current Product

11 practice sets with657questions and48study pages. Homepage title「環保志工群英會」now has one compact「顯示原圖」checkbox controlling every question set. No control appears on practice pages. Existing default-off browser key competition-practice:show-original-images:v1 is preserved. Enabled scans appear automatically only after answering; essential question/choice images remain. StudyReader behavior is unchanged.

The shared useSyncExternalStore subscription updates readers on same-page preference events and cross-tab storage events. A browser-session fallback preserves preference through client navigation when storage writes fail; a full reload cannot preserve it when browser storage is blocked. Original source data and saved full/review progress helpers are unchanged.

## Verification

2026-10-07 baseline and final npm run verify passed validation,lint,typecheck,86tests,staticbuild and789export references.375/880px Chromium passed compact control placement beside title,52px target, keyboard focus/Space, no practice checkbox, default-off/cross-set/reload on/off, automatic postanswer loaded scans, essential images, no progress writes and answerlocking. Blocked read/write and write-only preference navigation passed. Existing alias resume/random/review/cancel/reset regression passed. No overflow/pageerrors; visual verdict96/pass. Evidence: ignored tmp/central-images/ and .omx/state/central-original-images/. Physicaldevices/nativezoom untested.

## Changed Files

src/app/page.tsx, src/app/globals.css, src/components/QuestionPractice.tsx, new src/components/OriginalImagesToggle.tsx, new src/lib/originalImages.ts, README.md, feature_list.json, progress.md, session-handoff.md.

## Remaining Work / Next Step

None for implementation. Follow the next user request. Commit and push the verified changes under the explicit user authorization. Check Actions/Pages separately before claiming deployment.
