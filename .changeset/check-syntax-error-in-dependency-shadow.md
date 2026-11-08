---
"@rsvelte/svelte-check": patch
---

fix(svelte-check): a syntax error that makes TypeScript skip type checking no longer reads as a clean pass. A parse error in the shadow of an imported workspace-sibling package (`<cache>/ext/<n>/`) was dropped as a library internal, and one inside a generated (`Ωignore`) region of a component's own overlay was recorded but never reported; both suppress every semantic diagnostic in the program, so the run printed `0 errors`. Both now surface. Which diagnostics count as syntax errors is now the set tsgo's parser and scanner emit, instead of the `TS1xxx` range: checker grammar errors such as `TS1064` or `TS1378` no longer raise the invalid-overlay alarm (and stay dropped inside a dependency), while parser-emitted JSX and JS-file errors such as `TS17002` and `TS8010` now do.
