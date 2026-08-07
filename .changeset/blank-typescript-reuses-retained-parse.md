---
"@rsvelte/compiler": patch
---

Blank TypeScript for the store scan without parsing the script a third time

`detect_store_subscriptions` reads a copy of the script with type-only syntax
blanked out, and built that copy by running a full `oxc_parser` TypeScript parse
of its own — a third parse of a script the compiler had already parsed for
`retained_scripts` and stripped of TypeScript. The blanking now runs against the
retained program when it holds the same bytes, and only falls back to parsing
when it does not.

Redundant TypeScript parses over three real-world corpora, counted
deterministically: Huly plugins 1,384 → 0 (3.02 MB no longer re-parsed),
open-webui 361 → 1 (1.38 MB), SMUI 393 → 0 (0.52 MB).
carbon-components-svelte has no TypeScript scripts and stays at 0 in both
builds. All 14,036 compiled outputs (four corpora × client/server × prod/dev)
are byte-identical.
