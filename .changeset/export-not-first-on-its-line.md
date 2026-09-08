---
'@rsvelte/compiler': patch
---

Split a top-level `export let` / `export var` onto its own line when the statement before it ends on the same line, so the legacy prop lowering sees it. Previously `let a = 1; export let p = 1;` was copied into the component function verbatim, emitting an `export` below the top level.
