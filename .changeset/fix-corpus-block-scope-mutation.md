---
"@rsvelte/compiler": patch
---

fix(compiler): resolve block-scoped local shadowing a prop in mutation tracking

A block-local `let` that shadows a prop of the same name was mis-attributed to
the prop, inflating its `$.prop(...)` flags with `PROPS_IS_UPDATED`:

```svelte
<script>
  let { css = "" } = $props();
  const days = $derived.by(() => {
    for (…) {
      let css = "";        // block-local, shadows the prop
      css += " wx-selected"; // mutates the LOCAL, not the prop
    }
  });
</script>
```

The Phase-2 scope builder created a lexical scope for each `BlockStatement` (so
the local `css` lived there), but it didn't register that scope anywhere the
later visitor pass could find it, and the visitor's `BlockStatement` walk never
entered block scopes. So `css += …` resolved up to the prop binding and marked it
reassigned → `$.prop($$props, "css", 7, "")` instead of `3`.

Register each (non-function) block's scope in `function_scope_map` keyed by the
block start, and have the typed visitor walk enter that scope for `BlockStatement`
nodes (mirroring how function bodies are already handled). Block-local mutations
now resolve to the correct local binding. Clears
`svar-core/svelte/src/components/calendar/Month.svelte` (42 → 41).
