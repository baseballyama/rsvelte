# svelte2tsx: a `style:` shorthand store is referenced but never declared

`svelte2tsx` 0.7.61 emits, for

```svelte
<script>
	import { writable } from 'svelte/store';
	const store = writable('v');
</script>

<div style:$store>x</div>
```

a render body that reads `$store` without declaring it:

```ts
const store = writable('v');
…
__sveltets_2_ensureType(String, Number, $store);
```

Every other directive kind declares the subscription first. Measured across all
nine kinds:

| directive | `let $store = __sveltets_2_store_get(store)` emitted? |
|---|---|
| `use:` `transition:` `in:` `out:` `animate:` `class:` `bind:` | yes |
| `style:` `on:` | no |

`on:$store` is consistent — the handler slot never reads `$store`. `style:` is
not: it emits the read and omits the declaration, so the generated TSX names a
binding that does not exist and the language server reports an error on valid
source.

Two controls separate this from the neighbouring rules:

- `class:$store` (the same shorthand form, a different directive) declares it.
- `style:color={$store}` (the same directive, a value rather than a name)
  declares it.

So it is neither "shorthand names are not store references" nor "`style:` does
not resolve stores" — only the combination diverges.

rsvelte mirrors the behaviour, because output parity with official is the
contract (see `compatibility/svelte2tsx-known-failures.md` on why a divergence
is not registered instead). The mirroring is in
`svelte2tsx/script/stores.rs::collect_store_candidates`.
