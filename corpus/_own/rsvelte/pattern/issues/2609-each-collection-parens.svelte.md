# `2609-each-collection-parens.svelte`

**Issue:** [#2609](https://github.com/baseballyama/rsvelte/issues/2609)

A legacy `{#each}` whose collection binds looser than member access, with the item `bind:`-bound so it is **reassigned** and therefore read back as `collection[$$index]`. The collection was spliced into that member as opaque text, which carries no precedence, so `servers ?? []` printed as `$.get(servers) ?? [][$$index]` — a different expression, and on the left of `=` not JavaScript at all. `box?.list` pins the chain half (a member built on an optional chain must close it, or it joins the chain and stops being an assignment target); `ready` pins the other polarity, where no parentheses may appear
