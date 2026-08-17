# A `$state` / `$derived` public class field drops every later comment in the file

Compiling a class with a **public** rune field for the client silently removes every
comment that follows it, for the rest of the module or component.

```js
// input.svelte.js
export class R {
	x = $state(0);
}

// this comment never reaches the output
export const b = 2;
```

`compileModule(source, { generate: 'client' })` emits the accessors correctly and no
`// this comment never reaches the output` anywhere. The same input with `generate:
'server'` keeps it, and so does a component's instance script for the server target.

## Why

`phases/3-transform/client/visitors/ClassBody.js` lowers a public rune field into a
private backing field plus `b.method('get', …)` / `b.method('set', …)`. A builder-made
method carries a `BlockStatement` with no `loc`.

esrap's TS language prints every block through `body(context, node)`, which starts with
`reset_comment_index(node)`; its first branch is

```js
if (!node.loc) {
	comment_index = comments.length;
	return;
}
```

`comment_index` is a single cursor over the whole comment list, and nothing ever moves it
back except `reset_comment_index` on a node that *does* have a `loc`. Every node printed
after the first synthesized accessor body is either synthesized itself or reached through
the `_` wildcard's `flush_comments_until`, which is a no-op once the cursor sits at the
end — so the drop is not scoped to the class, it runs to the end of the program.

## The axis, measured (Svelte 5.56.9, `generate: 'client'`)

| class body | later comment |
|---|---|
| `x = $state(0)` | **dropped** |
| `x = $derived(1)` | **dropped** |
| `#x = $state(0)` | kept — a private field emits `b.prop_def` only, no accessor |
| `x = 0` | kept — no rune, the body is not rebuilt |
| `x = $state(0)`, `generate: 'server'` | kept — the server visitor emits no accessors |

The private-field row is the discriminating one: it rebuilds the class body just as the
public row does, and differs only in emitting no synthesized `BlockStatement`.

A comment *inside* the class body survives, because `reset_comment_index` on the located
`ClassBody` re-syncs the cursor and the field initializer it precedes still has a `loc` —
so the loss starts at the first generated accessor, not at the class.

## Suggested fix

Either give the generated accessor bodies the `loc` of the field they replace, or make
`reset_comment_index` carry the cursor forward on an unlocated node instead of discarding
the remaining comments. The second is the more general repair: any builder-made block
anywhere in a transform has the same effect today.

Tracked in rsvelte issue #2990. rsvelte's own output was the faithful one, but byte
equality is the goal, so it now reproduces the loss deliberately:
`3_transform/client/dead_comments.rs` deletes the comments between a synthesized accessor
and the next located body. When this is fixed upstream, that pass is what has to
go — the `opaque-keyword/**__between-classes__**` rows of the generated shape matrix are
what will report it.
