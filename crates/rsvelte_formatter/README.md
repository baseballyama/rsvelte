# rsvelte_formatter

Fast Svelte 5 formatter built on top of the [rsvelte](../..) parser and
[`oxc_formatter`](https://github.com/oxc-project/oxc/tree/main/crates/oxc_formatter).

`rsvelte_formatter` is the library that powers [`rsvelte-fmt`](../rsvelte_fmt) —
a Rust-native replacement for `prettier-plugin-svelte`. It formats `.svelte`
source strings in-process, with zero subprocesses, zero Node, and JS/TS
expression formatting handled by `oxc_formatter` so the JS half of a Svelte
file matches what `oxfmt` produces for `.ts` / `.js`.

## Status

Functional and tested — **88 tests**, full hygiene (`cargo fmt`, `cargo
clippy -- -D warnings`). Not yet shipped to crates.io; depended on by
`rsvelte-fmt` via a workspace path.

## What it formats

| Surface | Status |
|---|---|
| `<script>` / `<script context="module">` body | Re-parsed with `oxc_parser`, formatted via `oxc_formatter::Formatter::build` |
| Template-position `{expr}` interpolations | Formatted; whitespace inside braces collapsed |
| Attribute values: `class={expr}`, `class="a{expr}b"` | Formatted inline |
| Spread attribute: `{...obj.props}` | Formatted inline |
| `{@html EXPR}`, `{@render EXPR}`, `{@debug ID, …}`, `{@attach EXPR}` | Formatted inline |
| Directives: `bind:` / `class:` / `on:` / `transition:` / `in:` / `out:` / `animate:` / `use:` / `style:` | Expression formatted, modifiers preserved |
| Block headers: `{#if}`, `{#each}`, `{#await}`, `{#key}`, `{#snippet}` | Test / iterable / promise / key formatted |
| `<svelte:component this={X}>` / `<svelte:element this={X}>` | `this` rendered as first attribute |
| Open-tag attribute spacing | Single space between attributes, normalized self-closing as ` />` |
| Close-tag whitespace | `</div >` → `</div>` |
| Attribute shorthand | `name={name}` → `{name}`, `bind:name={name}` → `bind:name`, `class:name={name}` → `class:name` |
| Child indentation | Re-indented per nesting depth and `indent_style` / `indent_width` |
| Block body indentation | Body of `{#if}` etc. indented one level deeper than the block |
| Open-tag line wrapping | When the one-liner would overflow `line_width`, attributes break to one-per-line |
| `<pre>` / `<textarea>` whitespace | Preserved verbatim |

## What it does NOT (yet) format

These are intentionally deferred — they need a pattern-formatting path
(for destructuring-pattern formatting) or a CSS engine integration:

| Surface | Why deferred |
|---|---|
| `{@const ident = expr}` | VariableDeclaration, not a bare expression — needs statement formatting |
| `{#each iter as PATTERN}` context binding | Destructuring pattern |
| `{#await … as PATTERN}` / `{:then PATTERN}` / `{:catch PATTERN}` | Destructuring patterns |
| `{#snippet name(PARAM, …)}` parameter list | Destructuring patterns |
| `let:item={PATTERN}` directive value | Destructuring pattern |
| `<style>` body | CSS engine integration (see Roadmap) |
| Text-content whitespace collapse | Behaviour decision pending (`<p>hello   world</p>`) |

## Usage

```rust
use rsvelte_formatter::{format, FormatOptions, IndentStyle, JsFormatOptions, LineWidth};

let source = r#"<script>let count=1+2</script>
<button on:click={() => count++} class:active={count > 0}>
  { count + 1 }
</button>"#;

let opts = FormatOptions {
    js: JsFormatOptions {
        indent_style: IndentStyle::Space,
        line_width: LineWidth::try_from(80).unwrap(),
        ..JsFormatOptions::new()
    },
};

let formatted = format(source, &opts)?;
```

Output:

```svelte
<script>
  let count = 1 + 2;
</script>
<button on:click={() => count++} class:active={count > 0}>
  {count + 1}
</button>
```

## Options

`FormatOptions` is a thin wrapper around
[`oxc_formatter::JsFormatOptions`](https://docs.rs/oxc_formatter/) so JS
and Svelte share the same knobs:

| Field | Default | Effect |
|---|---|---|
| `js.indent_style` | `Space` | Per indent level: `Space` or `Tab` |
| `js.indent_width` | `2` | Spaces per indent level (ignored for tabs) |
| `js.line_width` | `80` | Open-tag wrapping threshold |
| `js.quote_style` | `Double` | String / attribute quote |
| `js.semicolons` | `Always` | Semicolons in `<script>` bodies |
| `js.trailing_commas` | `All` | Trailing commas in `<script>` bodies |
| `js.arrow_parentheses` | `Always` | `(x) => x` vs `x => x` |
| _everything else on `JsFormatOptions`_ | — | Used for `<script>` body and embedded expressions |

`IndentStyle`, `IndentWidth`, and `LineWidth` are re-exported from
the crate root.

## Architecture (current implementation)

The current implementation collects a list of source edits
`(start, end, replacement)` from four passes, sorts them by descending
start, and applies them in reverse order to the source string. Each pass
owns a disjoint set of source spans:

```
lib.rs::format
  ├─ script::format_script          (<script> bodies, oxc_formatter)
  ├─ markup::collect_open_tag_edits (element open + close tags)
  ├─ expression::collect_template_edits (template-position expressions, block headers, top-level @-tags)
  └─ indent::collect_indent_edits   (whitespace-only Text nodes between siblings)
```

The passes are independent and compose because their spans don't
overlap. A more principled Doc-IR-based formatter (using
`oxc_formatter_core::Format`) is on the roadmap once the upstream
builder helpers stabilize.

## Roadmap

- [ ] `<style>` body formatting (likely via `oxc_formatter`'s
      `ExternalCallbacks::embedded_formatter` once the API stabilises,
      or a small CSS engine integration)
- [ ] Pattern formatting (destructuring inside `{#each as PATTERN}`,
      `{#snippet name(PARAM)}`, `let:item={PATTERN}`)
- [ ] `{@const}` statement formatting
- [ ] Text-content whitespace collapse (`<p>hello   world</p>`)
- [ ] User-extensible whitespace-sensitive element list

## License

MIT
