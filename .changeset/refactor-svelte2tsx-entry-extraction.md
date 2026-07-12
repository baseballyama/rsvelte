---
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

refactor(svelte2tsx): extract svelte2tsx() entry-point steps into helpers

The `svelte2tsx()` entry point had grown to ~2000 lines with several cohesive
processing steps inlined into the body. This splits the mechanically-separable
ones out into private helper functions with no behavior change:

- `remove_orphan_scripts` — blank embedded `<script>` tags and collect their content
- `emit_svelte_options_element` — emit `<svelte:options>` as a `createElement` call
- `blank_style_tags` — blank `<style>` blocks (parsed + fallback scan)
- `hoist_top_level_snippets` — analyze/relocate top-level `{#snippet}` blocks
- `build_dollar_declarations` — build `$$props`/`$$restProps`/`$$slots` decls
- `build_slots_str` / `build_events_str` — build the component-export slots/events literals

Pure code motion: the generated TSX, source maps, and errors are byte-identical
(verified against the full svelte2tsx fixture suite — the same 8 pre-existing
known failures, no regressions).
