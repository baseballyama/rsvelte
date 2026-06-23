---
"@rsvelte/svelte-check": patch
---

svelte-check (`--tsgo`): stop misclassifying binder/checker-emitted `TS1xxx`
codes as syntax errors. The overlay-validity guard treated the entire
`1000..2000` range as syntactic, but a handful of those codes — most notably
`TS1192` ("Module has no default export"), plus `TS1259` / `TS1361` / `TS1371`
— are emitted by the checker, not the parser. They do **not** trigger
TypeScript's program-wide semantic-diagnostic suppression, so flagging them as
syntactic raised a spurious `internal error: rsvelte produced invalid TSX … /
TypeScript suppressed type errors for the rest of the project` banner even
though every real type error was still reported.

This surfaced on components that have a sibling `Foo.svelte.ts` companion
module re-exported into the shadow (the `#751` feature): consumers importing
`import Default, { Named } from './Foo.svelte'` could see `TS1192`, which then
masqueraded as an overlay parse failure. Unlike official `svelte-check` — which
classifies by `getSyntacticDiagnostics` / `getSemanticDiagnostics` origin
rather than by code number — rsvelte only has tsgo's textual code, so the fix
maintains an explicit denylist of the known binder-emitted `1xxx` codes.
