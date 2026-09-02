---
"@rsvelte/compiler": patch
---

Ancestor scoping follows a `{@render}` into the snippet it renders

`2_analyze/css_scoping.rs` is the second port of "where is a `{#snippet}` body rendered", and
its subject is the template — which elements carry the scope class — not the CSS text. Its
`{@render}` arm computed a snippet name, looked it up in a name-keyed map and then did
nothing with the answer, so an element whose only matching descendant lives inside a rendered
snippet was left unscoped while the CSS rule that matches it was kept: two halves of one
answer disagreeing inside a single output. It now ports `get_descendant_elements`' `RenderTag`
case, keyed by the snippet's node rather than by its name, and reaches a snippet passed to a
component as an attribute through the component's own position.

A snippet body is walked once per render site, and `metadata.scoped` is the union over those
sites, so the direct-match write is `|=`: with `=`, a second site that matches nothing erased
the first site's answer. It is the only field this walk writes.

Ancestor chains are resolved transitively — a `{@render}` written inside another snippet
inherits that snippet's own sites — and a snippet may render itself, so the walk needs a guard.
Upstream's `get_ancestor_elements` adds to its `seen` set and never deletes, so a snippet is
expanded at most once per resolution; that is both the termination bound and the reason the
answer is a function of where the walk started rather than of the snippet, which is why it
cannot be memoised. Unwinding the guard on the way out instead — the readable spelling —
enumerates every acyclic path and does not finish on a real `svelte.dev` component.
