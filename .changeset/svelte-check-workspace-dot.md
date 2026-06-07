---
"@rsvelte/svelte-check": patch
---

fix(svelte-check): `--workspace .` / `./` / `=.` no longer discover 0 files and silently pass (#718)

The project walker pruned any entry whose name starts with `.` (the hidden-dir skip). When the workspace root was `.` or `./`, walkdir reports the root entry's `file_name()` as the bare path string (`.`), so the **root itself** was pruned and the whole tree discarded — `--workspace .` reported `found 0 errors … in 0 files` and exited 0 even with `.svelte` files present (a silent false-pass in CI). Absolute and `..`-relative roots carry a real final component, so they were unaffected.

The walk root (depth 0) is now never pruned — it's the workspace the user explicitly pointed at — which also honours a workspace directory whose own name starts with `.`. Additionally, the CLI now prints a warning to **stderr** (never stdout, so machine formats stay parseable) when zero `.svelte` files are found, so a misconfigured path can't masquerade as a passing check.
