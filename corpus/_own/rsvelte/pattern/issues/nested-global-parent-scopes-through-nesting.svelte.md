# `nested-global-parent-scopes-through-nesting.svelte`

**Issue:** corpus residue

Upstream's `NestingSelector` case in `css-prune.js` tests the **immediate** parent rule's prelude and short-circuits on `complex_selector.children.every(is_global)`, so a `&` whose parent rule is entirely `:global(...)` matches every element and the parent chain is never tested. rsvelte flattens nesting instead of porting that case, so `.input { :global(a) { &:hover {} } }` produced `.input :global(a):hover&` and scoped nothing — eight huly / networking-toolbox / trakt-web components lost the scope class on most of their elements. Only the SUBJECT `&` takes the short circuit: `:global(.holder) { & svg {} }` (an earlier `&`) already worked through ordinary substitution, and rewriting it too dropped the `svg` ancestor and broke `appwrite-console`'s icon components — the two directions are why this file pins the subject form and the corpus holds the other.
