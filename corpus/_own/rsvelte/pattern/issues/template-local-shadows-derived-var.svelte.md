# `template-local-shadows-derived-var.svelte`

**Issue:** corpus residue

A `var` declared inside a template-expression arrow and **written** (`v--`) while an outer `$derived` of the same name exists. Phase 2 produced two `Binding` records for such a declaration — the scope builder's, carrying `declaration_start` and the initializer, and a throwaway pushed by the statement walker through `ScopeRoot::push_binding` — so a resolver keyed on the NAME reaches the outer `$derived` and grafts this initializer onto it. The write is the axis, because upstream's guard is `!binding.updated`; the fix keys on the declaration's own position. Green on `main` and on the fix, red only on a name-keyed resolution — a **guard, not a repro**. The repro is upstream's `delegated-locally-declared-shadowed` snapshot, whose `client-dev` ratchet entry lands retired with this row. `handler-local-update-through-the-json-path.svelte` is the sibling that pins the update lowering for the same shadowing.
