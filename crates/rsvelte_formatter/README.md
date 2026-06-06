# rsvelte_formatter

> **This is the library crate — the in-process formatting engine.**
> If you just want to format files from the command line, reach for the
> [`rsvelte-fmt`](../rsvelte_fmt) CLI instead. It wraps this crate for
> `.svelte` files and also formats `.js` / `.ts` / `.css` via `oxfmt`.

Fast Svelte 5 formatter built on the [rsvelte](../..) parser and
[`oxc_formatter`](https://github.com/oxc-project/oxc/tree/main/crates/oxc_formatter).

`rsvelte_formatter` powers [`rsvelte-fmt`](../rsvelte_fmt) — a Rust-native
replacement for `prettier-plugin-svelte`. It formats `.svelte` source strings
**in-process, with zero subprocesses and zero Node**. JS/TS expression
formatting is handed to `oxc_formatter`, so the JavaScript half of a Svelte file
matches exactly what `oxfmt` produces for standalone `.ts` / `.js` files.

CSS inside `<style>` is formatted through a caller-supplied
[`style_formatter`](#options) callback — the crate ships no CSS engine of its
own. (`rsvelte-fmt` wires that callback to `oxfmt`.)

## Status

Functional and tested — **105 tests**, full hygiene (`cargo fmt`,
`cargo clippy -- -D warnings`). Not yet published to crates.io; consumed by
`rsvelte-fmt` via a workspace path dependency.

On 3,852 real `.svelte` files (Apple M1 Pro), `format` runs **35× faster
single-threaded and 204× faster multi-threaded** than `prettier-plugin-svelte`.
Micro-bench it with `cargo bench -p rsvelte_formatter --bench formatter`.

## What it formats

| Surface | Notes |
|---|---|
| `<script>` / `<script context="module">` body | Re-parsed with `oxc_parser`, formatted via `oxc_formatter::Formatter::build` |
| `<style>` body | Delegated to the [`style_formatter`](#options) callback (lang-aware: `css` / `scss` / `less` / …). Verbatim when no callback is set |
| Template-position `{expr}` interpolations | Formatted; whitespace inside braces collapsed |
| Attribute values: `class={expr}`, `class="a{expr}b"` | Formatted inline |
| Spread attribute: `{...obj.props}` | Formatted inline |
| `{@html EXPR}`, `{@render EXPR}`, `{@debug ID, …}`, `{@attach EXPR}` | Formatted inline |
| Directives: `bind:` / `class:` / `on:` / `transition:` / `in:` / `out:` / `animate:` / `use:` / `style:` | Expression formatted, modifiers preserved |
| Block headers: `{#if}`, `{#each}`, `{#await}`, `{#key}`, `{#snippet}` | Test / iterable / promise / key formatted |
| Destructuring patterns: `{#each … as PATTERN}`, `{:then PATTERN}`, `{:catch PATTERN}`, `{#snippet name(PARAM, …)}`, `let:item={PATTERN}` | Object / array / default / rest patterns normalized via oxc |
| `<svelte:component this={X}>` / `<svelte:element this={X}>` | `this` rendered as the first attribute |
| Open-tag attribute spacing | Single space between attributes, self-closing normalized to ` />` |
| Close-tag whitespace | `</div >` → `</div>` |
| Attribute shorthand | `name={name}` → `{name}`, `bind:name={name}` → `bind:name`, `class:name={name}` → `class:name` |
| Child indentation | Re-indented per nesting depth and `indent_style` / `indent_width` |
| Block body indentation | Body of `{#if}` etc. indented one level deeper than the block |
| Open-tag line wrapping | When the one-liner would overflow `line_width`, attributes break one-per-line |
| `<pre>` / `<textarea>` whitespace | Preserved verbatim |

## What it does NOT (yet) format

| Surface | Why deferred |
|---|---|
| `{@const ident = expr}`, `{let …}`, `{const …}` | Statement-shaped tags (VariableDeclaration, not a bare expression) — need statement formatting |
| Text-content whitespace collapse (`<p>hello   world</p>`) | Behaviour decision pending |

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
    ..FormatOptions::default()
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

### Formatting `<style>` bodies

Supply a `style_formatter` callback — it receives `(body, lang)` and returns the
formatted CSS. Without it, `<style>` content is passed through unchanged.

```rust
use std::sync::Arc;
use rsvelte_formatter::FormatOptions;

let opts = FormatOptions::default().with_style_formatter(Arc::new(
    |body: &str, lang: &str| -> Result<String, String> {
        // Run your CSS formatter for `lang` ("css" / "scss" / "less" / …).
        Ok(body.to_string())
    },
));
```

The callback is `Send + Sync`, so a single `FormatOptions` can drive parallel
file formatting via `rayon`.

## Options

`FormatOptions` carries the Svelte-specific knobs and wraps
[`oxc_formatter::JsFormatOptions`](https://docs.rs/oxc_formatter/) so JS and
Svelte share the same configuration:

| Field | Default | Effect |
|---|---|---|
| `js.indent_style` | `Space` | Per indent level: `Space` or `Tab` |
| `js.indent_width` | `2` | Spaces per indent level (ignored for tabs) |
| `js.line_width` | `80` | Open-tag wrapping threshold |
| `js.quote_style` | `Double` | String / attribute quote |
| `js.semicolons` | `Always` | Semicolons in `<script>` bodies |
| `js.trailing_commas` | `All` | Trailing commas in `<script>` bodies |
| `js.arrow_parentheses` | `Always` | `(x) => x` vs `x => x` |
| _everything else on `JsFormatOptions`_ | — | Used for `<script>` bodies and embedded expressions |
| `style_formatter` | `None` | Callback formatting each `<style>` body; verbatim when unset |

`IndentStyle`, `IndentWidth`, `LineWidth`, `JsFormatOptions`, and
`StyleFormatter` are all re-exported from the crate root.

## Architecture (current implementation)

`format` collects a list of source edits `(start, end, replacement)` from five
passes, sorts them by descending start offset, and applies them in reverse so
earlier offsets stay valid. Each pass owns a disjoint set of source spans, so
they compose without overlapping:

```
lib.rs::format
  ├─ script::format_script            (<script> bodies, oxc_formatter)
  ├─ markup::collect_open_tag_edits   (element open + close tags)
  ├─ expression::collect_template_edits (template-position expressions, block headers, top-level @-tags)
  ├─ indent::collect_indent_edits     (whitespace-only Text nodes between siblings)
  └─ style::collect_style_edit        (<style> body, via the style_formatter callback)
```

A more principled Doc-IR-based formatter (using `oxc_formatter_core::Format`)
remains on the roadmap once the upstream builder helpers stabilize.

## Roadmap

- [ ] `{@const}` / `{let}` / `{const}` statement formatting
- [ ] Text-content whitespace collapse (`<p>hello   world</p>`)
- [ ] User-extensible whitespace-sensitive element list
- [ ] Doc-IR-based formatter via `oxc_formatter_core::Format` once the upstream
      builders stabilize

## License

MIT
