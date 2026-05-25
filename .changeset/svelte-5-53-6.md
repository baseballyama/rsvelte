---
"@rsvelte/compiler": patch
---

Bump target Svelte to **5.53.6**. The compiler-side commit in the range is `e3d277b00` "fix: visit synthetic value node during ssr" — it routes the synthetic `value` expression computed for `<option>` inside `<select>` through `context.visit(...)` so store refs (`$label`) get rewritten to `$.store_get(...)`. The other commits in 5.53.5 → 5.53.6 are perf-only (`1043f79d1`, `04ba134d3`, `efb651cd3`) or doc-only and don't change compiler output. The new `server-side-rendering/select-option-store-implicit-value` fixture is skipped in the compatibility report (documented in `tests/compatibility_report.rs`) because rsvelte's SSR transform doesn't yet route the synthetic value node through `transform_store_refs`. Follow-up port queued.
