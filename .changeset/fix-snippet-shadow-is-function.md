---
"@rsvelte/compiler": patch
---

A client-side attribute expression, event handler, or `{@const}`/`$derived` compile-time-known check that reads a block-local `{#snippet}` shadowing a same-named outer binding (a plain script-level `function`, `let`, or `$derived` — not a prop) now resolves to the snippet instead of the outer binding. Upstream's `Binding#is_function()` always returns `false` for a snippet, so the read is treated as having state; rsvelte's `get_binding` walks a root scope that is intentionally polluted with every scope's declarations for backward compatibility and prefers whichever declaration was merged in first, which could resolve to the outer (non-snippet) binding and wrongly skip the `$.template_effect` wrap or the dev-mode `$.apply` event-handler wrap.
