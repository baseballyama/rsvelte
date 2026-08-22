# oxfmt rewrites a single-quoted attribute to double quotes without escaping

`oxfmt` 0.63.0 with `svelte: true` — the corpus fmt oracle — normalises attribute
quotes to `"` and does not check whether the value already contains one:

```svelte
<div title='he said "hi"'>d</div>
```

```svelte
<div title="he said "hi"">d</div>
```

The output is not a valid Svelte document; the Svelte parser stops at the second
`"` with `expected_token` (`Expected token =`). It reproduces with any
double-quote-bearing value:

| input | oxfmt output | valid |
|---|---|---|
| `<div title='he said "hi"'>` | `<div title="he said "hi"">` | **no** |
| `<div style='content: "a"'>` | `<div style="content: "a"">` | **no** |
| `<div title='no quotes here'>` | `<div title="no quotes here">` | yes |
| `<div title="it&apos;s">` | unchanged | yes |

Either the value needs `&quot;` escaping or the single quotes have to be kept.
Both the official Svelte compiler and rsvelte accept the input and produce
byte-identical output for it on `client` and `server`; `rsvelte-fmt` refuses to
parse oxfmt's output, which is how this surfaced.

This is the same class as the `{#each}` pattern key drop recorded in
`oxfmt-each-pattern-default-unknown-node-type.md`: a formatting pass that
changes the document rather than its layout.
