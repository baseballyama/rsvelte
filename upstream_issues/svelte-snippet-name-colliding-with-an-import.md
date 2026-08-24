# A snippet whose name collides with an import emits output no JS parser accepts

```svelte
<script>
	import Thing from "./Y.svelte";
</script>

{#snippet Thing(l)}<b>{l}</b>{/snippet}
{@render Thing("a")}
```

Official compiles this successfully and the generated module contains both the
import and the snippet function under the same name:

```
SyntaxError: Identifier 'Thing' has already been declared
```

on both `generate: 'client'` and `generate: 'server'` (Svelte 5.56.9). The
compiler already has the right diagnostic for this shape — it just does not
reach it when the other declaration comes from an import or from
`<script module>`:

| the other declaration of `Thing` | official |
|---|---|
| `import Thing from "./Y.svelte"` | **unparseable output** |
| `import { tick as Thing } from "svelte"` | **unparseable output** |
| `<script module>` `const Thing = 1` | **unparseable output** |
| instance `let Thing = 1` | `declaration_duplicate` |
| instance `const Thing = 1` | `declaration_duplicate` |
| instance `function Thing() {}` | `declaration_duplicate` |
| `let { Thing } = $props()` | `declaration_duplicate` |
| a second `{#snippet Thing}` | `declaration_duplicate` |

So the check exists and covers five of the eight sources of a colliding name;
the three it misses are exactly the ones that live outside the instance scope.

rsvelte raises `declaration_duplicate` for all eight, which is why the shape
cannot be added to `compatibility/pattern-corpus/` — the corpus requires
official to accept the file, and here official accepting it is the bug.
