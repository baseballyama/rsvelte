---
"@rsvelte/compiler": patch
---

A `{#snippet}`'s render sites are keyed by the snippet it renders, not by that snippet's name

Upstream fills `SnippetBlock.metadata.sites` in one pass over `analysis.snippet_renderers`
(`2-analyze/index.js:847`): a renderer whose callee resolves to a local snippet is a site of
that block NODE, one that resolves to nothing gets `node.metadata.snippets =
analysis.snippets` and so is a site of every snippet in the component, and one that resolves
outside it — a prop, an import — is a site of none. rsvelte keyed that map by the snippet's
name, so two `{#snippet row()}` in different scopes merged and each was given the other's
ancestors; and it had no notion of an unresolved renderer, so `{@render f()}` with `f` an
ordinary local, `<Comp {...spread}>` and `<Comp foo={row} />` contributed nothing. A
component is now kept `resolved` when an expression attribute is an identifier naming a
snippet, as upstream does, rather than being unresolved for any non-literal.

The registration for a snippet declared directly inside a component tested
`context.path.last()`, but `visit_node` pushes the node before dispatching, so inside the
SnippetBlock visitor that is the snippet itself and the branch had never run. Nothing
noticed while a missing site meant "unknown, stay conservative"; a real `svelte.dev`
component starts losing a CSS rule the moment an empty site set becomes an answer.

The same upstream rule is ported a second time in `2_analyze/css_scoping.rs`, which still
keys by name and whose `{@render}` arm does not follow the tag into the snippet at all;
that half is unfixed and is `compatibility/GATES.md#two-ports-inventory` row 27.
