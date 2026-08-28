# A self-closing `<Style />` / `<Script />` component is parsed as an HTML element

**Package:** `svelte-eslint-parser` (version pinned by
`scripts/compat-corpus/lint-oracle/package.json`; observed on 1.8.1)
**Surfaces as:** `svelte/html-self-closing` reporting
`Disallow self-closing on HTML elements.` for a Svelte component
**Affects:** every eslint-plugin-svelte rule that branches on
`SvelteElement.kind`

## Reproduction

```svelte
<script>
  import Style from './Style.svelte';
</script>

<Style />
```

```
5:8  warning  Disallow self-closing on HTML elements.  svelte/html-self-closing
```

`Style` is a component: the compiler's own parse of the same source returns
`Component`, and `html-self-closing`'s default for `component` is `"always"`, so
the correct answer is no finding. The message text names the misclassification —
the rule chose the `normal` (`"never"`) category, which only an HTML element
reaches.

## What is minimal, and what is not

`parseForESLint(...).ast` element `kind`, measured directly:

| input | `kind` |
|---|---|
| `<Style />` | **`html`** |
| `<Script />` | **`html`** |
| `<Style/>` (no space before `/>`) | `component` |
| `<Style></Style>` | `component` |
| `<Template />` | `component` |
| `<Styled />`, `<Stylex />`, `<Div />`, `<Head />`, `<Slot />` | `component` |
| `x<Style />` | `component` |
| `x\n<Style />` | **`html`** |
| `<div><Style /></div>` | **`html`** |

So the trigger is: tag name case-insensitively equal to `script` or `style`,
**self-closing**, **whitespace after the name**, and a prefix satisfying the
parser's `/>\s*$|^\s*$/m` test.
Because the regex is multiline, a qualifying earlier line is enough even when
the tag itself is later on a non-qualifying line.

## Mechanism

`lib/context/index.js` blanks the script/style blocks out of the template it
hands to the Svelte compiler. Its scanner is
`extractBlocks`:

```js
const startTagOpenRe = /<!--[\s\S]*?-->|<(script|style|template)([\s>])/giu;
```

The `i` flag makes `<Style ` match, and `([\s>])` is why `<Style/>` does not.
A block that turns out to be self-closing takes this branch (same file, in the
`Context` constructor):

```js
// Self-closing blocks are temporarily replaced with `<s---->` or `<t---->` tag
// because the svelte compiler cannot parse self-closing block(script, style) tags.
templateCode += `${code.slice(start, block.startTagRange[0] + 2)}${"-".repeat(block.tag.length - 1)}…`;
```

so `<Style />` is handed to the compiler as `<S---- />`. `S----` fails Svelte's
component-name test (`-` is not an identifier character), so the compiler
returns a `RegularElement`, and `convertChildren` maps that to
`kind: "html"` (`lib/parser/converts/element.js`). `extractElementTags` then
restores the *name* from the original source, so the node reads as an HTML
element literally named `Style`.

`<Template />` escapes because the constructor explicitly skips self-closing
`template` blocks; `script`/`style` have no such guard.

## Compatibility handling in rsvelte

`compatibility/lint-adversarial/no-nested-style-tag/14-component-lookalike.svelte`
reproduces it. rsvelte keeps the compiler AST's `Component` classification, then
mirrors the parser quirk locally in `html_self_closing.rs`. This gives the lint
rule byte-compatible behavior without leaking the wrong element kind into every
other template rule.

That adapter also reproduces the oracle's multi-pass fix oscillation when the
whole rule universe is enabled. The report and fix-all ratchet entries are both
therefore closed, while focused unit tests retain the exact positive and
negative boundary.
