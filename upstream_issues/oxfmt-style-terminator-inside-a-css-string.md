# oxfmt refuses a `<style>` block whose CSS contains the text `</style>`

`oxfmt` 0.63.0 with `svelte: true` — the corpus fmt oracle, which uses
`prettier-plugin-svelte` for the Svelte structure. It ends the `<style>` block at
the first `</style` in the raw bytes, with no notion of a CSS string or comment,
so a document the official Svelte compiler compiles is rejected outright:

```svelte
<b class="host">a</b>

<style>
	.host::after {
		content: "</style>";
	}
</style>
```

```
CompileError: `</style>` attempted to close an element that was not open
https://svelte.dev/e/element_invalid_closing_tag
  5 |     content: "</style>";
    |                        ^
```

Official's `read_style` never runs that test inside a rule — its `finished`
predicate is consulted only at CSS top level between rules
(`phases/1-parse/read/style.js:29`), so the CSS grammar consumes the declaration
value and the text is emitted verbatim.

| `<style>` body | official | oxfmt |
|---|---|---|
| `content: "</style>";` | ok | **rejects** |
| `content: '</style>';` | ok | **rejects** |
| `background: url("</style>");` | ok | **rejects** |
| `background: url(</style>);` (unquoted) | ok | **rejects** |
| `@import url(</style>);` | ok | **rejects** |
| `/* </style> */` | ok | **rejects** |
| `b[data-a="</style>"] { … }` | ok | **rejects** |
| `content: "</style";` (no `>`) | ok | ok |
| `content: "</b>";` | ok | ok |

rsvelte had the identical defect and it is fixed; the repro therefore cannot
live in `compatibility/pattern-corpus`, because the oracle cannot format it.

This is the fourth oracle-side defect recorded here. The other three change the
document rather than refusing it — see
`oxfmt-each-pattern-default-unknown-node-type.md`,
`oxfmt-single-quoted-attribute-containing-a-double-quote.md` and
`oxfmt-const-tag-ending-in-a-line-comment.md`.
