---
"@rsvelte/compiler": patch
---

Stop rewriting a prop name that is a binding in a destructuring parameter

In a legacy `$:` statement, the client prop-read rewriter decided that an
identifier followed by `,` or `}` and preceded by `{` was a shorthand
object-literal property, without asking whether the enclosing `{ … }` was an
object literal or a **binding pattern**. A prop name occupying a slot of a
destructuring parameter was therefore expanded as if it were a value read, and
the emitted module was not JavaScript:

```svelte
<script>
  export let id;
  export let items;
  $: found = items.find(({ id }) => id);
</script>
```

emitted `items().find(({ id: id() }) => id)` — `Invalid binding pattern` in every
JS parser. Array patterns took the plain wrap instead (`([id(), n]) =>`), as did
nested, aliased and rest slots, and a `function ({ id })` parameter list.

A pattern slot is a declaration, so nothing is wrapped there now. Reads that only
look like pattern slots are unchanged and still wrap: a default value
(`({ n = id }) =>`), a computed key (`({ [id]: n }) =>`) and an object literal
defaulting a parameter (`(o = { id }) =>`).
