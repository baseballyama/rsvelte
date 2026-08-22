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
| `x<Style />` (not at a line start / not after `>`) | `component` |

So the trigger is: tag name case-insensitively equal to `script` or `style`,
**self-closing**, **whitespace before the `/>`**, and starting a line or
following a `>`.

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

## Why this matters here rather than being just an upstream bug

`compatibility/lint-adversarial/no-nested-style-tag/14-component-lookalike.svelte`
reproduces it, and it is the one divergence on that file. rsvelte classifies
`<Style />` from the compiler AST, so it agrees with `svelte/compiler` and
reports nothing — the divergence is upstream being wrong, not rsvelte.

Reproducing it in rsvelte is not an option worth taking: element kind is shared
by every template rule, so a deliberate misclassification of `<Style />` would
have to be threaded through all of them to buy one gate row, and it would make
rsvelte disagree with the compiler it is a port of.

No adversarial pattern is filed under
`compatibility/lint-adversarial/html-self-closing/` for this shape: the gate's
ratchet is expected to stay empty, and a pattern that reproduces an upstream
defect would only add a row that cannot be fixed here.
