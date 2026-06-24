---
"@rsvelte/svelte-check": patch
---

svelte-check: in `--incremental` mode, emit `incremental` + `tsBuildInfoFile`
into the overlay tsconfig so tsgo / tsc persist their program graph and
per-file check state across runs. Previously `--incremental` only
short-circuited svelte2tsx (the cheap part); the compiler still re-parsed and
re-checked all ~8k program files (node_modules `.d.ts` included) every run —
the dominant cost. The overlay tsconfig is byte-stable across runs, so the
build info stays valid and an unchanged warm run on a large SvelteKit app
drops from ~5.5s to ~1.5–1.9s.
