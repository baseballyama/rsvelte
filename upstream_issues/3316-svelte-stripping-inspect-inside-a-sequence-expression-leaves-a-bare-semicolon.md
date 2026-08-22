# Stripping `$inspect` inside a sequence expression leaves a bare `;`

`$inspect` is removed in production builds. When the call sits inside a sequence
expression, the call text goes but the statement's `;` stays where the call was,
so the emitted module is not JavaScript:

```svelte
<script>
	let base = $state(1);
	(0, $inspect(base));
</script>
<p>{base}</p>
```

`compile(source, { generate: 'client', dev: false })` emits

```js
(0, ;);
```

which `acorn` rejects with `Unexpected token`. Both compile calls succeed — no
error, no warning.

## The axis, measured (`svelte@5.56.8`, acorn on every cell)

Each row is the one statement in the instance script; `client` and `server` agree
on every cell, and `dev: true` is unaffected throughout because nothing is
stripped there.

| statement | `dev: false` output | verdict |
|---|---|---|
| `$inspect(base);` | *(removed)* | parses |
| `(0, base);` | `(0, base);` | parses |
| `(0, $inspect(base));` | `(0, ;);` | **unparseable** |
| `($inspect(base), 0);` | `(;, 0);` | **unparseable** |
| `(0, $inspect(base), 1);` | `(0, ;, 1);` | **unparseable** |
| `String((0, $inspect(base)));` | `String((0, ;));` | **unparseable** |
| `const q = (0, $inspect(base));` | `const q = (0, ;);` | **unparseable** |

So the position inside the sequence does not matter, the sequence's own host does
not matter, and both targets reproduce it: **10 unparseable cells** over the grid.
`(0, $effect(() => base));` is not in the table because both compilers reject it
with `effect_invalid_placement` before codegen.

The shape is that the removal is textual over the call while the terminator is
owned by the enclosing statement, so a sequence — the one host where the call is
neither the whole statement nor a nested statement of its own — leaves the `;`
stranded between the commas.

## rsvelte's output for the same input

```js
(0, );
```

Also unparseable, and for an unrelated reason: rsvelte does not recognise a
parenthesised rune call at all, so the stripping removes the whole inner
expression rather than just the call. That is rsvelte issue #3315 and it has to
be fixed on its own terms; it is not a reproduction of the upstream defect.

## Decision taken in rsvelte

**Once #3315 lands, this is listed, not reproduced** — the same rule as
`upstream_issues/3306-svelte-a-bindings-read-expression-lands-on-the-lhs-of-a-write.md`.
Byte equality is rsvelte's goal and the standing precedent
(`3_transform/client/dead_comments.rs`) is to reproduce an upstream defect rather
than carry a permanent ratchet entry, but that precedent covers output that still
runs. rsvelte's shape-matrix gate scores `output-unparseable` as a verdict of its
own, ratcheted apart from `js-mismatch`, so that "wrong text" and "text that is
not JavaScript" never suppress one another; reproducing these cells would mean
writing permanent entries into the one ratchet whose purpose is that no such
entry exists.

Nothing is pinned by a test yet, because rsvelte's own output for these inputs is
still wrong for the #3315 reason. The test belongs with that fix.
