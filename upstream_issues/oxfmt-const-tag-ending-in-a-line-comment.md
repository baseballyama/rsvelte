# oxfmt leaks a synthetic `)` out of a `{@const}` whose initializer ends in a line comment

`oxfmt` 0.63.0 with `svelte: true` — the corpus fmt oracle. When a `{@const}`
tag's initializer ends in a `//` comment, the formatted output carries a stray
`)` and the comment escapes past the tag's closing `}`:

```svelte
{#each rows as row (row)}
	{@const doubled = row * 2 // the initializer ends in a line comment
	}
	<b>{doubled}</b>
{/each}
```

```svelte
{#each rows as row (row)}
  {@const doubled = row * 2)} // the initializer ends in a line comment
  <b>{doubled}</b>
{/each}
```

The `)` is a synthetic wrapper that should never have reached the output — the
same shape as a parser that wraps the slice in `( … )` and appends the closing
paren on the comment's own line. The document no longer parses: the Svelte
compiler stops at the `)` with `expected_token` (`Expected token }`).

| input | oxfmt output valid |
|---|---|
| `{@const x = r // c⏎}` | **no** (`expected_token`) |
| `{@const { a } = { a: r } // c⏎}` | **no** (`expected_token`) |
| `{@const x = r /* c */}` | yes |
| `{#if flag // c⏎}` | yes |
| `{#key flag // c⏎}` | yes |
| `{@html "x" // c⏎}` | yes |
| `{#await p // c⏎then v}` | yes |
| `{#snippet body(n // c⏎)}` | yes |

So it is `{@const}`-specific rather than a general block-header problem, and it
is the trailing position specifically — a block comment in the same slot is
fine, and a leading comment is fine.

Both the official Svelte compiler and rsvelte accept the input and produce
byte-identical output for it on `client` and `server`.

This is the same class as the two already recorded here — a formatting pass that
changes the document rather than its layout: see
`oxfmt-each-pattern-default-unknown-node-type.md` (a property key silently
dropped) and `oxfmt-single-quoted-attribute-containing-a-double-quote.md`.
