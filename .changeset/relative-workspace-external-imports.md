---
"@rsvelte/svelte-check": patch
---

Fix `--workspace .` (a relative workspace path — the documented CLI form) emitting one extra `../` in rewritten escaping relative imports, producing false-positive `TS2307` diagnostics.

Two compounding bugs in the `svelte2tsx` external-import rewrite pass: `relative_posix` filtered empty path segments but not `.`, so a leading `./` (introduced when a relative `.` workspace path is joined onto a file path) was counted as one directory level — one `../` too many in any specifier that did get rewritten. Separately, a relative workspace made `is_within_dir`'s containment check fail to recognize workspace-internal targets, so the rewrite fired at all for imports that resolve inside the workspace and need no rewrite. `relative_posix` now skips `.` segments, and `compute_rewrite` absolutizes `source_path`/`generated_path`/`workspace_path` against the process CWD before doing any path math — the same class of fix as #1900's `oxc_resolver` absolutization.
