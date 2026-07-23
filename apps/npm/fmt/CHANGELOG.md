# @rsvelte/fmt

## 0.7.0

### Minor Changes

- 5ff3dac: feat(fmt): honor sortTailwindcss.functions in the native Svelte path

  `sortTailwindcss` previously sorted only fully static `class` attribute values.
  The oxfmt option `sortTailwindcss.functions` — sorting the class strings passed
  to wrapper calls like `cn(...)` / `cva(...)` / `clsx(...)` — was ignored inside
  `.svelte` files.

  rsvelte-fmt now mirrors oxfmt's `.svelte` pipeline (verified byte-for-byte
  against `oxfmt` + `prettier-plugin-tailwindcss`):

  - **`<script>` bodies**: string and substitution-free template-literal arguments
    of a call whose callee is a bare identifier listed in `functions` are sorted.
    The descent stops at a nested call, so `cn(a, notcn("…"))` sorts only `a`; a
    nested call is sorted only when its own callee matches. Object keys, arrays,
    and nested plain containers inside a matched call are sorted.
  - **`class={…}` mustaches** (and any configured `attributes`): every class
    literal in the expression is sorted, regardless of an enclosing call — matching
    the plugin's `transformSvelte`, which is not function-gated. `class:` directives
    and standalone `{expr}` mustaches are left untouched.

  Template literals with `${…}` interpolations are sorted per static quasi; the
  token abutting an interpolation is pinned (`cn(\`flex m-2 ${x}\`)`keeps its
structure), matching`prettier-plugin-tailwindcss`.

  Sorting routes through the same class sorter as static attributes, so the native
  (zero-config) and Node-sidecar (custom-config) paths both apply. The default path
  stays untouched when `functions` is unset, and the fmt-parity corpus gate (sort
  off) is unaffected. Mixed static-plus-`{expr}` class attribute values remain out
  of scope.

- ec08b68: feat(fmt): sort custom Tailwind configs via a Node sidecar

  `sortTailwindcss` previously covered only a stock, zero-config Tailwind v4 setup
  (sorted natively in Rust); a custom `@theme` / `@plugin` / `@utility` /
  `@custom-variant` / `@config` stylesheet or a v3 `tailwind.config.js` warned and
  left classes untouched, because their order depends on the project's compiled
  CSS.

  For those custom setups `rsvelte-fmt` now shells out to a one-shot Node sidecar
  (`lib/tailwind-sort.mjs`) running the real `prettier-plugin-tailwindcss` — the
  same plugin and `createSorter` / `sortClassAttributes` API `oxfmt` uses, pinned
  to the same insiders build — so the result is byte-for-byte identical to the
  oxfmt oracle. Every static class string across the run is collected and sorted
  in a single batched sidecar call, and the sidecar never throws: if Node or the
  plugin is unavailable the run warns once and leaves class names unchanged, never
  a wrong reorder. The default zero-config path stays pure-Rust with no subprocess.

  Adds an rsvelte-only `sortTailwindcss.strategy` extension (not an oxfmt key):
  `auto` (default — stock native, custom via JS), `native` (always pure-Rust), and
  `js` (always the JS oracle, even for a stock config). With the default `auto` an
  existing oxfmt `sortTailwindcss` config works unchanged.

### Patch Changes

- b269efc: fix(deps): update prettier-plugin-tailwindcss to 0.8.1

  Dependency-only bump of the `prettier-plugin-tailwindcss` Node sidecar used by
  `rsvelte-fmt`'s custom-Tailwind-config sort path (`lib/tailwind-sort.mjs`), from
  a pre-release insiders build to the stable 0.8.1 release that `tailwind_class_order`'s
  oracle is already measured against. No sort-output changes; formatter parity
  corpus tests pass unchanged.

- 9da5da9: fix(formatter): force block-header call expressions onto one line

  A block header like `{#if isNodeVisible(node, nodes.find(...))}` whose call oxc
  expands even at unlimited width (a hug-eligible last argument) was spliced into
  the template as a raw multi-line fragment at the wrong indent. prettier-plugin-
  svelte reprints block headers with `removeLines`, which keeps a group's baked
  `shouldBreak` — so such a call joins onto one line with inner spaces
  (`fn( a, b )`) while every other call collapses without them. The flat-args
  expanded form is now folded back the same way: inner-space join for the shapes
  oxc refuses to keep flat, plain single line otherwise.

- b32fd20: fix(fmt): match prettier for two `bracketSameLine` empty/whitespace element cases

  Under `bracketSameLine: true` two residual divergences from prettier-plugin-svelte
  are fixed (both pre-existing, no effect on the default `false`):

  - a deliberate whitespace-only inline element in prose (`<p>text <span>   </span>
text</p>`) now keeps prettier's non-hug body (`<span> </span>`) instead of
    collapsing to the source-empty hug form — the source whitespace is told apart
    from the wrap artifact an earlier pass inserts into source-empty wrapped
    elements;
  - a standalone source-empty element with a long wrapping open tag (a block
    element's lone `<span class="…long…"></span>`) now dedents its `>` onto its own
    line and glues `></span>` (applying `canOmitSoftlineBeforeClosingTag`) instead
    of gluing the `>` to the last attribute and dangling `</span>`.

- 08a5942: Honour `bracketSameLine` in the children-port pass so an element whose first child is an inline `{#if}` / `{#each}` block keeps the wrapped open tag's `>` glued to the last attribute instead of dangling it onto its own line, matching prettier-plugin-svelte.
- 54debca: fix(formatter): break a prose expression/render tag's call arguments in place

  A long call inside an expression or render tag in prose (`… LineChart. {format(
chartData.length,
)} data points`) was treated as an atomic fill word, so rsvelte wrapped at the
  word boundary before it instead of breaking the call's arguments in place and
  gluing the following word to the `)}` line. Prettier builds such a paragraph as
  fill + expression-tag concat + fill — the tag sits outside the fill with its own
  call-arguments group — so the tag breaks internally while its neighbors stay
  glued. Element-body prose now represents multi-line content tags as a breakable
  flat/broken doc inside the run, reproducing that layout; all other call sites
  keep the previous atomic behavior.

- cc5667b: Claim `{@render …}` tags in the children layout port (fixing which element dangles its close tag inside `{#if}/{:else if}` branches), print a whitespace-only element body as a single space, and follow prettier's `<pre>` child open-tag rules: dangle the child's `>` on multi-line content or overflow, re-hug it only when the attributes break, and break a child element's tag in preference to the `<pre>`'s own attributes.
- 649985e: Classify a text run's boundary whitespace from the pre-collapse source instead of the intermediate multi-pass output, so prose following a hug-broken inline element keeps prettier's word-first fill and wraps at the print width.
- 9da5da9: fix(formatter): don't double-indent interpolation-led attribute value continuations

  The whole-value attribute Doc model baked the absolute attribute indent into
  continuation lines, but the open-tag assembly re-indents interpolation-led
  values (`value="{…}"`) a second time — text-led values (`class="text {…}"`) are
  kept verbatim — so a wrapped interpolation's continuation landed at double the
  intended column. The model's base indent now matches that split: absolute for
  text-led (verbatim) values, relative for interpolation-led (re-indented) ones.
  Break-point selection is unchanged.

- 9e1a73e: Reflow an overflowing single-line prose run beside a block sibling (e.g. long text inside a Component body with a block `<div slot>` child) instead of leaving it on one 100+ column line — prettier's fill always wraps a lone overflowing text node.
- 649985e: Dangle a void element's `/>` onto its own line when the open tag overflows the print width (`<br\n/>`), matching prettier; fitting void elements are unchanged.
- 66efcaf: fix(fmt): break the whitespace body of a wrapping inline element (#1707)

  An inline element with a whitespace-only body whose open tag wraps
  (`<span class="…long…"> </span>`) was formatted by the non-port markup path with
  the raw whitespace glued after the wrapped `>` (`…"`\n`> </span>`). That both
  diverged from the prettier-plugin-svelte oracle and was non-idempotent — a
  multi-space body collapsed to a single space on a re-format.

  prettier prints such an element as `group([...openingTag, '>', line, '</tag>'])`,
  so the whitespace body is a `line` that breaks once the wrapped open tag forces
  the group open: the `>` glues to the last attribute line under `bracketSameLine`
  (else dedents) and the close tag drops to its own line, absorbing the whitespace.
  Output is now byte-identical to the oracle and idempotent for both
  `bracketSameLine` values.

  `<textarea>` is handled as the raw-text exception the oracle applies: `>` stays
  glued (never dedented for this shape), `bracketSameLine: true` breaks the body,
  and the default `false` glues the close tag and drops the whitespace body
  (`…"></textarea>`). Source-empty inline elements (`<span></span>`, hug) and
  block-display elements are left to their existing layout. Also aligns
  `can_omit_softline_before_closing_tag` with prettier's `blockElements` (excluding
  `script`/`style`) via `is_html_block_display_element`.

  Also fixes a crash this uncovered: when the new whitespace-body edit overlapped
  the indent pass's edit on the same text node, the top-level section-span remap
  double-counted the dropped edit and shifted a later `<style>`/`<script>` boundary
  past the output end, panicking during section reorder. The remap is now computed
  from the overlap-resolved edit set, so it always agrees with the applied output.

## 0.6.2

### Patch Changes

- be6b5f5: fix(formatter): measure multi-interpolation attribute values as one Doc

  A quoted attribute value with two or more `{…}` interpolations was measured
  per-interpolation, with trailing interpolations counted as zero width — so the
  wrong interpolation broke, or none did. The whole value is now built as a single
  measured Doc: literal text verbatim (prettier gives attribute text no break
  points), each interpolation a group embedding its oxc-formatted flat and broken
  forms.

  Break-point selection follows prettier's fits semantics rather than a bespoke
  rule: a breakable trailing interpolation, measured in break mode, charges only
  the width up to its first internal break point and then short-circuits the
  measurement. Prettier's greedy layout — keep an earlier interpolation flat
  whenever a later one can break to absorb the overflow — emerges from that
  composition. The mode branch is pinned by unit tests: at the same width,
  flipping only a trailing interpolation's breakability flips the leading
  interpolation between flat and broken.

  Values stay on the previous path when the interpolation is deep (object /
  call-argument expansion), the text spans multiple source lines, or the value is
  a `style:` directive (whose text is a real fill, unlike regular attributes).

- c50d0fe: fix(formatter): keep a template-position `as`/`satisfies` union flat when it fits

  In an attribute value or mustache, `x as A | B` was expanded to a leading-`|`
  multi-line union whenever the annotation broke onto its own line, while the
  oxfmt(`svelte:true`) oracle keeps it flat (`… as\n  A | B`). oxc ties the
  union's leading-`|` separator into the same group as the annotation break, so
  once the annotation breaks the union always expands — no print width reaches
  the oracle's layout. The oracle formats template expressions with prettier's
  estree printer, whose `as`/`satisfies` layout breaks after the operator but
  measures the union's own group independently.

  `format_expr_core` now reproduces that layout for template expressions only: an
  `oxc_ast_visit` gate confirms the formatted program contains an `as`/`satisfies`
  node with a ≥2-member union, then each broken union block (a line ending in the
  operator token directly followed by same-indent `| ` member lines) is collapsed
  back onto the annotation line when the flat form fits the budget. Blocks with a
  multi-line member, or whose flat form overflows, stay expanded — matching the
  oracle. `<script>` blocks are untouched (they format through `format_program`
  and already agree with the oracle on oxc's leading-`|`). The eventual upstream
  fix remains a separate-group `as` layout in `oxc_formatter`.

- 5ca3d4d: fix(fmt): default to the current working directory when no paths are given, matching `oxfmt`

  `rsvelte-fmt` (no arguments) now formats the current directory in place, and
  `rsvelte-fmt --check` checks it, exactly like `oxfmt`. Previously the path
  argument was required and the no-path invocation exited with an error.
  `--stdin` mode is unaffected.

- 6df4de5: fix(formatter): include the close tag in the hugged-content width measurement

  When a multi-line open tag's hugged content line (`>{content}</tag`) overflows,
  the Doc-IR reformat printed the body alone, so the printer's fits lookahead never
  saw the close tag's width — an inner self-closing component whose own attributes
  fit, but overflow once `</tag` is appended, never broke. The overflowing hugged
  line is now printed as prettier's `group(['>', body, '</tag'])` with the dangling
  `>` appended after, so the close tag participates in the fits measurement and the
  inner component's attributes wrap exactly where the oracle wraps them.

- f95de6d: fix(fmt): exit 2 with oxfmt's own message when no files match, instead of a false success

  `rsvelte-fmt` now exits 2 with `Expected at least one target file. All
matched files may have been excluded by ignore rules.` — the same exit code
  and message `oxfmt` gives when it finds nothing to format. This covers a
  genuinely empty directory as well as a tree whose only files are excluded by
  `.gitignore`/`.prettierignore` or don't match any supported extension.
  Previously these cases printed a different message and exited 0, silently
  reporting success. `--check` behaves the same way.

- 66d7af3: Keep the leading hardline for prose text that follows a self-closing sibling (`<Code … />`), matching prettier's untrimmed `splitTextToDocs` fill so the last word tolerates overflow instead of wrapping early.
- 71aed19: fix(formatter): normalize inter-interpolation whitespace in wrapped attribute values

  A `style:`/regular attribute value made of multiple interpolations where at
  least one wraps (e.g. two nested ternaries in `style:transform-origin`) took the
  whole-value re-indent path, which prepends the attribute indent to every line.
  The literal whitespace BETWEEN interpolations still carried its source
  indentation, so the re-indent double-indented the second interpolation's opening
  line. That structural whitespace (a depth-0 newline whose next content is the
  next `{`) is now stripped before re-indent, matching prettier's normalization to
  the attribute indent; literal text lines keep their source indentation verbatim.

## 0.6.1

### Patch Changes

- 3c041bc: fix(formatter): dangle close brackets for wrapped open tags

  Two prettier-parity mechanisms for elements whose open tag goes multi-line:

  - A `<pre>` child (e.g. `<pre><code class={…}>`) whose open tag breaks now
    dangles its closing tag's `>` onto its own line, mirroring prettier's
    whitespace-sensitive close handling. This also covers the common
    highlighted-code-block shape (`<pre><code>{@html …}</code></pre>`).
  - An empty `<textarea>` whose glued last line (`{indent}{last attr}></textarea>`)
    overflows the print width now dangles the open tag's `>`. The rule is
    width-driven, not categorical — a short empty `<textarea>` stays glued, and
    `<pre>` (a block element, which prettier never hugs) is untouched. The
    boundary was pinned with a 40–76 column sweep against the oracle.

## 0.6.0

### Minor Changes

- 36df68d: feat(fmt): native `sortTailwindcss` for default-config Tailwind projects

  `rsvelte-fmt` now sorts the classes in static `class` attributes when
  `sortTailwindcss` is configured **and** the project uses a stock, zero-config
  Tailwind v4 setup (`@import "tailwindcss";` with no `@plugin` / `@utility` /
  `@custom-variant` / `@theme` / `@config` and no v3 `tailwind.config.js`). The
  sort is a pure-Rust port of `prettier-plugin-tailwindcss` / Tailwind v4
  `getClassOrder` (new `tailwind_class_order` crate), so no Node/Tailwind engine is
  spawned; it matches the real sorter on 99.8% of a 3,806-attribute real-world
  corpus.

  For a custom stylesheet/config — where the order depends on the JS engine and
  cannot be reproduced faithfully — `rsvelte-fmt` prints a warning naming the
  reason and leaves classes unchanged (previously it always warned). Values with
  `{expr}` interpolation are never touched. The `attributes` option is honored
  (default `["class"]`).

### Patch Changes

- d864f54: fix(formatter): correct attribute-value and each-key break widths

  Five width/layout divergences from prettier-plugin-svelte, each found by the
  formatter-parity corpus (baseline 74 → 55 known failures, 0 regressions across
  12,657 components):

  - **Nested attribute-value interiors were over-narrowed.** A multi-line shallow
    attribute value was re-formatted at the print width minus the full `name={`
    prefix, but that prefix only shifts the first line — deeply nested interiors
    broke earlier than the oracle. The prefix-narrowed pass is now adopted only
    when it actually changes the first line.
  - **Expression-bodied arrow directive values never broke.** The overflow width
    for `on:keypress={(e) => cond && fn(e)}` was computed as
    `prefix - indent_width`, which equals the arrow's own one-line length, so the
    break was never triggered. It now uses the minimal-break width.
  - **An interpolation starting at or past the print width stayed inline.** A
    trailing `{cond ? a : b}` in a long `class="…"` is now broken when its
    expression is breakable; atoms are unaffected.
  - **Interpolation-led multi-line string values were re-indented.** Newlines that
    all sit between interpolations (`viewBox="{a}\n {b}\n {c}"`) are literal HTML
    and are now emitted verbatim.
  - **A broken `{#each … (key)}` method chain landed at the wrong column.** Such a
    key is now reindented to the block depth, sharing the each-iterable path's
    method-chain gate so expanded-call-argument keys keep their own form.

- 08370ce: fix(formatter): keep self-closing tags self-closed and widen the children port

  `build_element_doc` had no self-closing branch, so every empty element it printed
  came out as `<path …></path>`. A corruption guard caught the rewrite and threw the
  port's whole layout away, which is why SVG-bearing elements silently fell back to
  the compact string path instead of prettier's hug/dangle form. prettier's
  `isSelfClosingTag` branch is now ported (including its `dedent(line)` trailer, so
  `/>` keeps its leading space when flat), and `didSelfClose` is read from the text
  rather than approximated, so `<div />` and `<div></div>` stay distinct.

  Alongside it, the children-port gate accepts three more shapes — element-only
  child runs, flow-block children, and whitespace-separated flow-block children —
  and `{#if}` / `{#each}` / `{#key}` bodies are built as Docs instead of being
  carried verbatim, which retires the "body already fits" freeze heuristic that
  previously stood in for real layout.

  Two independent printer bugs surfaced and were fixed on the way:

  - `fits` returned false whenever a `Doc::BreakParent` reached it via the rest
    stack, vetoing a following sibling's group even though the enclosing group was
    already broken. prettier's `fits` has no such case; `propagate_breaks` now
    consumes the sentinel.
  - `with_pre_content` restored its thread-local by hand, so a panic inside the
    re-entrant `<pre>` format left the flag set. Since callers run `format` under
    `catch_unwind` on rayon workers, that silently suppressed the port for every
    later file on the same worker. It is an RAII guard now, with a regression test.

- 9c40765: fix(formatter): honour prettier-ignore in collapse, and fix two pass-skipping bugs

  Three correctness fixes, plus the children-port work that exposed the first two:

  - **`collapse` never consulted `prettier-ignore`.** `indent`, `markup` and
    `expression` all did; collapse alone reformatted content the author had marked
    as off-limits. It stayed hidden because the port bailed on block-display
    children before reaching such content. Both collapse traversals needed the
    guard — adding it to one was not enough.
  - **The collapse re-parse skipped whole files.** It re-parses its own output, but
    its `ParseOptions` omitted `skip_non_css_lang_style`, which the main parse
    sets. A `<style lang="sass">` block therefore failed that re-parse and the
    entire collapse post-pass — every hug, dangle and children-port pass — was
    silently skipped for the file. Three further `ParseOptions` sites in the
    `<pre>` sub-parse path had the same drift, including a missing
    plain-then-TypeScript retry; a `<pre>` containing a top-level plain `<script>`
    with TypeScript syntax reproduced that one.
  - **Inline-level children broke a block body's spaces.** The oracle only converts
    a block body's inline spaces to newlines for block-display children:
    `<Icon /> {label}`, `<br /> {label}` and `<input /> <Icon />` all stay on one
    line. The fit test now measures display width rather than counting chars, so a
    full-width character is not costed at half a column.

  The children port also reaches two node kinds it previously discarded:
  block-display elements (as `Child::Block`, the variant `print_children` already
  implemented but nothing ever emitted) and Components (as `Child::Other`, pushed
  bare — prettier's `isInlineElement`/`isBlockElement` both require a
  RegularElement, so a Component is neither, but hugging still applies to it since
  only block elements suppress it). An element preceded by prose on its own line is
  no longer rejected for not starting the line.

- 7756cc0: fix(formatter): keep space indentation inside space-indented `<pre>` bodies

  `reformat_pre_inner` regenerated element-direct lines inside `<pre>` with tabs
  unconditionally, but oxfmt preserves `<pre>` bodies verbatim — tabs are only
  correct when the source itself was tab-indented. Block-tag lines (e.g. `{#if}`)
  inside a space-indented `<pre>` now keep spaces, including the closing-tag line.
  Formatter-parity baseline shrinks 48 → 46.

- 11018b6: fix(formatter): restore the collapse child-breaking passes retired as "dead" in #1505

  #1505 removed collapse passes 1.6–1.95 and the final children-port sweep on the
  premise that they were dead code. They were not: every one of those passes is
  load-bearing for real corpus components, so their removal regressed the
  formatter-parity corpus — 11 components that had matched the `oxfmt(svelte: true)`
  oracle byte-for-byte began diverging, all in the same family of "the element
  should break its children / open tag onto their own lines but rsvelte keeps them
  inline" (e.g. `<button …> Add Day </button>` staying on one line, a `<Span>` open
  tag not breaking on an overflowing prose line, an SVG `<clipPath>`/`<rect>` pair
  not hugging, a Component block child `<div>` not breaking, a `<script></script>`
  sibling of an `{@html}` not breaking).

  Each retired pass is required by at least one of those regressions:

  - 1.6 `try_collapse` sweep — inline pure-text elements revealed by pass-1
    restructuring (card-air / calendar-test / ListGroup).
  - 1.7 `hug_mixed` non-ws-prefix sweep — SVG child hug (flowbite Microsoft icon).
  - 1.8 block-break non-ws-prefix — Component block child (svelte print `formatting`).
  - 1.9 break-inline-open-tag — overflowing inline/component open tags
    (TextDecoration / Underline / html-tag-script-2).
  - final children-port sweep — faithful prettier-plugin-svelte layout for its
    gated shapes (svelte-maplibre radio labels).

  Restoring `collapse.rs` to its pre-#1505 state returns the formatter to the last
  green parity state and re-fixes all 11 regressions. This intentionally reverts
  #1505 in full: the passes cannot be separated at whole-pass granularity (each is
  needed by a regression), so a partial keep would either leave regressions or
  require new per-shape guards that belong to a dedicated formatter-layout change,
  not a regression fix.

  No compiler-output change; formatter output only.

- 3958a1c: fix(fmt): preserve full print width for `<script>` bodies when `svelteIndentScriptAndStyle` is disabled

  `format_script` always narrowed the configured `printWidth` by one indent
  level before formatting the `<script>` body, on the assumption that the body
  would subsequently be re-indented one level under the `<script>` tag. That
  assumption only holds when `svelteIndentScriptAndStyle` (default `true`) is
  enabled; with it disabled the body is spliced back in flush at column 0, so
  narrowing the width was wrong and caused lines that fit the real configured
  width to wrap unnecessarily. The width is now only narrowed when
  `indent_script_and_style` is `true`, matching the already-correct general
  pattern used by `format_nested_script` and the `<style>` formatting paths
  (`format_nested_style` / `collect_style_edit`), which derive the width
  narrowing from the body's actual indent rather than assuming a fixed one
  level.

- 3819f3d: fix(formatter): strip ASI guard from template expressions

  `oxc_formatter` inserts a leading `;` before an expression statement whose
  formatted text begins with `(`, `[`, `` ` ``, a template literal, or certain
  other tokens, when `semicolons` is set to `"as-needed"` — a defensive ASI
  (automatic semicolon insertion) guard so the line stays safe if concatenated
  after a semicolon-less statement. Every embedded `{expr}` (mustache values,
  attribute/directive values, block headers such as `{#if}`/`{#each}`) is
  internally parsed and printed as a synthetic expression statement so it can
  be run through `oxc_formatter`, so with `semi: false` that guard leaked into
  the output: `onclick={() => doSomething()}` was formatted as the invalid
  `onclick={;() => doSomething()}`.

  Template expressions are never in statement position, so the guard is never
  meaningful there — it is now stripped from the formatted text before
  splicing it back into the template. Matches `oxfmt`/`prettier-plugin-svelte`,
  which never emit the guard for embedded expressions.

## 0.5.1

### Patch Changes

- 21ab5b1: chore(deps): bump oxc + oxfmt to the 0.58 formatter-paired rev (39677ba)

  Bump every git-pinned oxc crate (`oxc_ast`, `oxc_parser`, `oxc_codegen`,
  `oxc_span`, `oxc_semantic`, … and the `oxc_formatter*` family) to a single new
  revision `39677ba50d908ea09f6d9e58ded328461212f52a` — oxc crates `0.138`,
  `oxc_formatter*` `0.58` — and bump the `oxfmt` npm dependency to `^0.58.0` (root
  - playground). This rev is the exact oxc commit the `oxfmt` `0.58.0` release was
    built from, so `rsvelte-fmt`'s in-process `oxc_formatter` engine is byte-identical
    to the `oxfmt` oracle the formatter-parity gate compares against (fixing a
    comment-placement divergence, e.g. `: !!value /* … */;`).

  All oxc crates must move to one rev together so rsvelte's AST types unify with
  `oxc_formatter`'s transitive deps, and the `oxc_formatter` rev must be paired with
  its matching `oxfmt` npm release; this consolidates the individual Renovate oxc
  bumps and the `auto-update-oxfmt` bot PR (#1434) into one coherent bump. The bump
  is compiler-output-neutral — CSR/SSR compile output is byte-identical across the
  whole compat corpus before and after; no oxc API migration was required.

  Also declares the `svelte_check` bin with `required-features = ["native"]`: it
  links `rsvelte_core::svelte_check::*` (gated on `native`), so under a feature
  resolution that omits `native` (e.g. the `cargo codspeed build` bench graph)
  cargo must skip the bin instead of trying to build it and failing to link.
  Default builds enable `native`, so this is a no-op for them.

  The oxfmt 0.58 bump also records one new known formatter-parity failure in the
  ratchet (`compat/corpus/fmt-known-failures.json`): `site-kit/…/SearchBox.svelte`,
  where rsvelte-fmt over-breaks a TS `as HTMLElement | undefined` union inside a
  deeply-nested `on…={…}` handler at print-width 80 (its embedded-expression width
  narrowing makes `oxc_formatter` break a union the oxfmt oracle keeps inline). It
  is a bounded diagnosis but a non-bounded fix (entangled with the tuned
  narrow-then-reindent plumbing), tracked as a follow-up burndown item. Four other
  oxfmt-0.58 CSS/structure divergences on pathological svelte compiler-test fixtures
  are `oracle-bug` / `invalid-input` exclusions (oxfmt's own `--svelte`-vs-raw CSS
  path inconsistencies where rsvelte matches the raw path).

- e005e19: fix(fmt): converge on parenthesized / sequence `{#each}` keys

  An each-block key written as a sequence expression (`{#each xs as x, i ((x.id, i))}`)
  or with redundant parens (`{#each xs as x ((x.id))}`) never reached a fixed
  point: the formatter re-parenthesized the inner expression but left the source's
  own parens in place, so every pass added another paren layer (and a stray space
  after the delimiter). `rsvelte-fmt --check` therefore failed forever on these
  files even right after `rsvelte-fmt` wrote them.

  The Svelte AST records only the inner key expression span; the delimiter parens
  — and any extra parens the source wrote around the key — live outside it, so the
  previous edit (which replaced just the AST span) could not consume them. The key
  handling now scans outward to the outermost delimiter paren pair, formats the key
  as written between those parens, and re-emits it wrapped in a single delimiter
  pair. This matches prettier-plugin-svelte (`((a, b))` for a sequence key,
  `(x.id)` for `((x.id))`) and is idempotent.

- 413b603: fix(fmt): write formatted files atomically

  `rsvelte-fmt --write` (and the native JS/JSON/CSS/svelte write paths) replaced
  each file with a plain `fs::write`, which truncates the target before writing.
  An interrupted run — a crash, a kill, a full disk — or a tool reading the file
  mid-write could leave a truncated or empty source file. Every output write now
  stages the content in a uniquely-named temp file in the same directory and
  `rename`s it into place (an atomic, same-filesystem swap), matching the approach
  already used by the `<style>` cache.

- 8a442d8: fix(fmt): measure attribute-value fit by visual width, not byte length

  When deciding whether a wide single-line attribute value fits with its
  trailing literal on the same line, the width check used the value's byte
  length instead of its display width. For CJK (and other multi-byte) content
  the byte count overcounts columns, so the check reported an overflow that
  does not exist and the value was broken across lines unnecessarily. Use
  `visual_width` for the value, matching the sibling force-break path.

- f568462: fix(fmt): don't over-break deeply-nested `{@const}` continuation lines

  `format_const_declaration` narrowed the whole declaration body by `lead + 2` to
  account for the `{@const ` vs `const ` affix delta. That `+2` is only correct for
  the FIRST line (rendered `{@const …}`); continuation lines (ternary branches, call
  arguments, …) are re-indented to `lead` with no `{@const` prefix, so the extra `−2`
  over-constrained them and broke a call/ternary one column too early where the
  oracle keeps it inline. The body is now formatted at `full − lead` (correct for
  continuation lines) and, only when the single-line result's real `{@const …}` tag
  overflows, re-formatted at the tighter `full − lead − 2` — so single-line `{@const}`
  output is unchanged while nested multi-line bodies wrap where prettier does.

- 6152961: fix(formatter): preserve inline control-flow prefixes

  Follow-up changeset for #1437 (by @mustafa0x, merged with `skip-changeset`).
  The break-block prefix collector treated any prefix ending in `>` as a wrapped
  block-display open-tag eligible to be reused as indentation, which misfired on
  inline control-flow markup such as `{:else}<section …>` — the `>` there closes
  inline content, not a wrapped open tag. Narrowed the guard to fire only when the
  prefix (after trimming leading whitespace) is exactly `>`, so a genuine wrapped
  open-tag continuation is still handled while inline `{:else}<el>` markup is left
  intact and formatting stays idempotent.

- eff9279: fix(fmt): preserve `&nbsp;`-only blocks and stop over-breaking exactly-80-col attribute values

  Two formatter-parity fixes:

  - **`&nbsp;` treated as blank whitespace.** The formatter detected insignificant
    whitespace-only text nodes with `str::trim().is_empty()`, but Rust's
    `char::is_whitespace` treats U+00A0 (the decoded form of `&nbsp;`) as
    whitespace, so a block body whose only content was `&nbsp;` was wrongly
    collapsed: `{#if a}&nbsp;{/if}` became `{#if a}\n\n{/if}`, dropping the
    non-breaking space. A shared `is_blank_text` helper now counts only ASCII
    whitespace as blank.
  - **Attribute value over-break at exactly 80 columns.** The single-line overflow
    guard in `render_single_expression_value` double-counted the opening `{` of
    `name={value}`, over-reporting the rendered width by one column, so an
    attribute whose value filled the print width exactly was needlessly expanded
    onto multiple lines.

- 640eb5d: fix(fmt): stop `<style>` dedent panicking on Unicode-whitespace indent and guard collapse against overlapping edits

  Two formatter robustness fixes:

  - **`<style>` dedent panic on non-ASCII leading whitespace.** `dedent` measured
    each line's indentation as `line.len() - line.trim_start().len()`, but
    `str::trim_start` strips multi-byte Unicode whitespace (e.g. U+00A0), so the
    common-indent offset could land in the middle of a code point and
    `line[min_indent..]` panicked. Indentation is now counted as leading ASCII
    space/tab only (always a char boundary), with a `get(..)` fallback.
  - **Collapse whole-element open-tag break corrupted nested edits.**
    `collect_break_inline_open_tag` pushed a whole-element edit (rewriting the tag
    _and_ its children in one span) and then still recursed into the children,
    whose edits applied against now-stale offsets inside that span — corrupting the
    output or panicking `apply_edits`. Recursion is now skipped after a
    whole-element edit, and `apply_edits` drops any edit that overlaps an
    already-applied one as a safety net.

## 0.5.0

### Minor Changes

- e38490f: feat(fmt): format CSS in-process via `oxc_formatter_css`

  `rsvelte-fmt` now formats CSS with the Rust `oxc_formatter_css` crate (the same
  engine `oxfmt` uses, so byte-identical) instead of spawning an `oxfmt`
  subprocess — mirroring the existing native JS/JSON in-process paths. This covers
  both embedded `<style>` blocks in `.svelte` files and standalone
  `.css`/`.scss`/`.less` files, and it lets the wasm formatter format `<style>`
  blocks in the browser (previously left verbatim, since spawning `oxfmt` can't run
  in wasm).

  The embedded-`<style>` path no longer needs the batch/daemon/on-disk-cache
  machinery that existed only to amortize `oxfmt` spawns; the new `--no-native-css`
  flag reverts to the legacy `oxfmt`-subprocess path as an escape hatch. Standalone
  CSS files fall back to `oxfmt` on parse errors or when an `.oxfmtrc` override /
  `printWidth > 320` can't be represented natively, exactly like the native JSON
  path. Indented-syntax dialects (`sass`/`stylus`/`.styl`) are not brace-based CSS
  and stay verbatim / delegated.

### Patch Changes

- 24023af: fix(fmt): wire the prettier-plugin-svelte children port for void-element + prose content

  Milestone-2 layout port, cut 1. Route an inline-or-block element whose content is
  prose text interleaved with single-line HTML void elements
  (`<label class="…"><input … /> Only show states starting with 'T'</label>`,
  `<div><br /></div>` runs) through the faithful `children.rs` port of
  prettier-plugin-svelte's `printChildren` + 4-case element assembly
  (`build_element_doc`), instead of the approximate `try_fill_mixed` / `try_hug_mixed`
  string logic. The approximate fill construction mis-placed the prose word-wrap
  boundary (it broke one word too early); the faithful port reproduces prettier's
  fill — including gluing the first word to the preceding void element — byte-for-byte.

  `try_children_port` returns `Some(_)` to **claim** its shape even when it produces
  no edit (the content is already correct), so the legacy passes
  (`collect` and `collect_fill_mixed_only`) don't re-break already-correct prose.

  Burns down the fmt-parity corpus by 5 (69 known failures; svelte-maplibre
  geojson_polygon / 3d_buildings, powertable example4, svelte-sonner Hero,
  svelte-pivottable).

## 0.4.1

### Patch Changes

- 53e6248: fix(fmt): don't CSS-parse non-CSS `<style lang>` blocks

  `rsvelte-fmt` hard-failed on `<style lang="scss">` (and other non-CSS dialects):
  the body was run through the internal CSS parser, which choked on SCSS syntax
  (`//` line comments, `$variables`, maps) with `css_expected_identifier` and
  aborted the whole-file format. A non-CSS `lang` block is opaque preprocessor
  input, so the formatter no longer CSS-parses it — its raw body is still handed to
  the embedded style formatter (oxfmt), exactly as before, so output is unchanged
  for already-working blocks while SCSS-syntax blocks stop aborting the format.

- 5d6c318: fix(fmt): stop over-breaking interpolations inside string attribute values

  An embedded `{expr}` inside a quoted attribute value (`class="{…} text"`,
  `style="…{expr}…"`) was broken more aggressively than the oxfmt /
  prettier-plugin-svelte oracle:

  - The "doesn't fit on one line" path re-formatted the expression narrowed by the
    _trailing_ literal width, so a call like `fieldError(form, 'fullName')` inside
    `class="{fieldError(form, 'fullName') ? … } mt-1 …"` exploded into multi-line
    arguments instead of breaking only the top-level ternary (the trailing text
    belongs on the final continuation line, not the first). It now always picks the
    minimal break point.
  - The trailing-width estimate summed _all_ following literal text, including text
    on later physical lines of a multi-line string value (`style="…\n\twidth: {r *
2}px;\n…"`), so a trivial `{r * 2}` was force-broken to fit a phantom-long line.
    Trailing width now stops at the next newline.

  Net: 9 real-world corpus files (cmsaasstarter, layercake, …) now format
  byte-identically to the oracle, with no regressions.

- 884f7b0: fix(fmt): don't force a JSX-disambiguation comma on a single arrow type parameter in `<script>`

  `<script lang="ts">` bodies were formatted with `SourceType::ts()`, whose
  `extension` field is `None`. oxc_formatter forces a trailing
  JSX-disambiguation comma on a single arrow-function type parameter
  (`const f = <T>(…) => …` → `<T,>`) for every source whose extension is not
  `.ts` (i.e. `.tsx`/`.mts`/`.cts`/unknown), so the `None` extension triggered the
  comma. oxfmt formats embedded `.svelte` scripts as `.ts` and emits `<T>`.

  Parse `<script>` bodies with `SourceType::from_extension("ts")` (extension
  `Some(Ts)`, otherwise identical to `SourceType::ts()`) so the formatter sees a
  `.ts` extension and leaves `<T>` as `<T>`. The only output-affecting use of
  `source_type.extension()` in oxc_formatter is this arrow type-parameter comma.

  Burns down the fmt-parity corpus by 1 (74 known failures; svelte-splitpanes
  Splitpanes.svelte).

- 06f0c94: fix(fmt): wrap a top-level assignment value in parens in every position

  prettier-plugin-svelte always wraps a root-level assignment expression in exactly
  one paren pair in expression position — `{x = 5}` → `{(x = 5)}`, attribute
  `class={x = 5}` → `class={(x = 5)}`, block header `{#if a = 0}` → `{#if (a = 0)}` —
  whereas OXC strips the parens at statement position. The block-header path already
  re-added them, but mustache and attribute values did not, so a value like
  `{(dataAttribute.value = [])}` lost its parens.

  `format_expr_core` now applies the same canonical one-pair rule to a top-level
  `AssignmentExpression` that it already applied to a `SequenceExpression`, covering
  all three positions uniformly; the now-redundant block-header-specific re-wrap
  (`block_header_expr_needs_parens`) is removed.

- 2a19537: fix(fmt): defer the close-tag `>` to its own line for a hug-end, multi-line inline element

  Mirror of the hug-start fix. When an inline element's body has leading whitespace
  (so the open `>` stays on the open-tag line — not hug_start) but ends directly
  adjacent to the close tag (hug_end), and the body is already broken across lines,
  prettier-plugin-svelte defers the close tag's final `>` onto its own line at the
  element indent:

  ```
    <picture …>
      …
    </picture></GroupSlot
  >
  ```

  rsvelte left `</GroupSlot>` glued. `try_hug_mixed` now handles this
  `!shouldHugStart && shouldHugEnd` shape, mirroring `build_element_doc`'s
  hug-end-only assembly (whose trailing `softline, '>'` breaks when the element is
  multi-line).

  Burns down the fmt-parity corpus by 2 (80 known failures; svelte-form-builder
  Picture, layerchart Histogram).

- d839f89: fix(fmt): move the open `>` to its own line for a hug-start, multi-line inline element

  When an inline element's body hugs the open tag (`>{content}` with no leading
  whitespace) but ends with whitespace before the close tag, and the source kept
  the body broken across lines, prettier-plugin-svelte drops the open `>` onto its
  own indented line so it hugs the first content word while a normal close tag
  follows:

  ```
  <label for={forName} style="cursor:{cursor}"
    >{label}
    <slot />
  </label>
  ```

  rsvelte left `…cursor:{cursor}">{label}` glued. `try_hug_mixed` now handles this
  `shouldHugStart && !shouldHugEnd` shape (single-line or wrapped open tag),
  mirroring `build_element_doc`'s hug-start-only assembly in `children.rs`. A
  `<slot>` (`SlotElement`) child is also now classified as inline (it is a
  `display:contents` element prettier hugs like a component), so it no longer
  disqualifies its parent from the hug path.

  Burns down the fmt-parity corpus by 3 (82 known failures; svelte-form-builder
  Label/Button/Link). First increment of the milestone-2 layout-engine alignment.

- 34184bb: fix(fmt): break a children fill when a self-closing element child is multi-line

  A non-block element (e.g. `<label>`) containing a self-closing element whose
  attributes wrapped (`<input … />`) followed by another element kept the two on one
  line (`/> <span>…</span>`) where prettier breaks them onto separate lines — a
  multi-line item in a fill forces its surrounding separators to break.

  Two causes: (1) `element_doc` returned `None` for a self-closing `RegularElement`,
  which made the whole `build_children_doc` bail, so `try_fill_mixed` skipped the
  element entirely. A new `build_self_closing_regular_doc` builds a breakable
  attribute group from the per-attribute spans (single-line even when the element
  span already wrapped), guarded to round-trip the canonical `<tag a b c />`.
  (2) `try_fill_mixed` only re-flowed non-prose content when a hardline survived the
  flat render; it now also re-flows when any non-text child is already multi-line in
  the output (`has_multiline_child`).

  Burns down the fmt-parity corpus by 4 (75 known failures; layercake AxisY /
  AxisYRight, CSR + SSR variants).

- 06f0c94: fix(fmt): don't keep wrapper parens around an object-literal attribute value

  An attribute value that is an object or arrow literal (`track={{ … }}`) is parsed
  through a `(expr);` wrapper; the redundant outer parens are then stripped only when
  `outer_parens_match` confirms they were balanced. Two cases leaked parens into the
  output where the oracle keeps none:

  - A body comment like `// 1.) No clamping` carries a lone `)`, so the literal
    paren count made a balanced value look unbalanced and rsvelte emitted
    `track={({ … })}`. `outer_parens_match` now skips parens inside string/template
    literals and `//` / `/* */` comments.
  - An object that is the _head_ of a member/call expression (`size={{ … }[key]}`)
    is parenthesized by OXC at statement position (`({ … })[key]`), which
    `strip_outer_parens` can't unwrap because the string ends with the postfix, not
    `)`. The expression head is now detected via the AST (`expr_has_object_head`) and
    the leading paren pair stripped while keeping the `[key]` / `.foo` / `( … )`
    postfix verbatim.

- dbf6292: fix(fmt): move the open `>` to its own line for a hug-start pure-text element with a wrapped open tag

  A pure-text element/component with a wrapped (multi-line) open tag whose body
  hugs the open tag (shouldHugStart) but ends with whitespace before the close tag
  (shouldHugEnd = false) is handled by `try_collapse`. It kept the open `>` glued to
  the last attribute (`disabled>Disabled button`) instead of dropping it onto its own
  indented line:

  ```
  <Button
    disabledClasses="…"
    disabled
    >Disabled button
  </Button>
  ```

  `try_collapse`'s `had_trail` branch now reconstructs the open `>` on its own
  attribute-indented line, mirroring `build_element_doc`'s hug_start assembly (whose
  `indent([softline, group(['>', body])])` softline breaks once the open tag wrapped)
  — the pure-text counterpart of the `try_hug_mixed` hug-start fix.

  Burns down the fmt-parity corpus by 1 (79 known failures; smelte).

- 83d4317: fix(fmt): don't double-count indent for interpolations in multi-line string attributes

  A multi-line quoted attribute value (`style="…\n\tleft: {expr}%;\n…"`) carries
  each interpolation's physical column in the literal text already emitted on its
  own line. The interpolation-width math was _also_ subtracting the attribute's
  logical indent, double-counting it — so an expression that actually fits was
  force-broken (and a long member chain wrapped instead of the top-level operator).
  The width now uses the physical column only for multi-line string values, so
  `left: {$xGet(d) + ($xScale.bandwidth ? … : 0)}%;` and similar stay on one line,
  matching the oxfmt / prettier-plugin-svelte oracle.

- 109960b: fix(fmt): keep preprocessor styles and prose block comments verbatim

  Two formatter-parity fixes that mirror the oxfmt / prettier-plugin-svelte oracle:

  - Indented-syntax `<style lang="sass">` / `"stylus"` bodies are not brace-based
    CSS — oxfmt cannot parse them and the oracle leaves them byte-for-byte
    verbatim. The formatter now emits no edit for those dialects (scss/less/postcss
    still route through oxfmt). Combined with the non-CSS-lang parse passthrough,
    this stops the whole-file format from falling back to the raw source for
    components whose `<style>` uses an indented preprocessor dialect.
  - `reindent` over-indented prose `/**` block comments. `oxc_formatter` only
    re-aligns a block comment whose every continuation line starts with `*`
    (prettier's `isIndentableBlockComment`); a `/**` comment with prose
    continuation lines — which may carry intentional leading whitespace such as a
    tab — is left verbatim. The old heuristic treated any `/**` as indentable and
    prepended the splice indent to those lines. Fixed with a full star-alignment
    scan.

## 0.4.0

### Minor Changes

- 0938afd: fmt: honor `prettier-plugin-svelte` / oxfmt markup options (#1057)

  `rsvelte-fmt` previously read the project `.oxfmtrc` but only applied the scalar
  JS options to embedded `<script>` blocks — markup-level and sort options were
  silently ignored. The Svelte formatter now honors them so `.svelte` output stays
  compatible with `oxfmt` + `prettier-plugin-svelte` under the same config:

  - **`singleAttributePerLine`** — break every attribute onto its own line when an
    element has more than one.
  - **`bracketSameLine`** — keep a wrapped open tag's `>` / `/>` on the last
    attribute's line (the replacement for the removed `svelteBracketNewLine`).
  - **`sortImports`** — sort imports inside embedded `<script>` (accepts `true` or
    the full oxfmt object form).
  - **`svelte.allowShorthand`** — set `false` to expand `name={name}` /
    `class:x={x}` / `style:x={x}` / `bind:x={x}` to the full form.
  - **`svelte.indentScriptAndStyle`** — set `false` to keep `<script>` / `<style>`
    bodies flush instead of indented one level.
  - **`svelte.sortOrder`** — print the top-level sections in any permutation of
    `options`/`scripts`/`markup`/`styles`, or `none` to keep source order.

  `sortTailwindcss` remains unsupported (its ordering depends on the project's
  Tailwind stylesheet); `rsvelte-fmt` now prints a warning when it is set instead
  of silently dropping it.

## 0.3.20

### Patch Changes

- ba5916c: fmt: format `.json` / `.jsonc` / `.json5` in-process via `oxc_formatter_json`
  instead of delegating them to an `oxfmt` subprocess. It's the same engine `oxfmt`
  uses for JSON, so the output is byte-identical (verified 243/243 on a real-world
  corpus) while skipping the per-invocation `oxfmt` startup — a standalone JSON
  file now formats instantly on save, like `.ts`/`.js`/`.svelte` already do.

  `package.json` keeps going to `oxfmt`: it additionally runs through
  `sortPackageJson` (a key-ordering pass that lives in oxfmt, not oxc), so
  formatting it natively would diverge. Files matched by an `.oxfmtrc` override, or
  any JSON when the base `printWidth` exceeds the native max (320), also fall back
  to `oxfmt`, as do parse errors — so coverage never regresses. The native JSON
  path is gated by the same `--no-native-js` escape hatch.

## 0.3.19

### Patch Changes

- ebe80fa: fmt: ship the CLI as a native-direct binary, dropping the Node launcher from the
  hot path. A `postinstall` step now copies the platform-native `rsvelte-fmt`
  binary over the package's `bin/rsvelte-fmt`, so the package manager's
  `.bin/rsvelte-fmt` runs the binary directly — no per-invocation Node cold start
  (~200ms measured). The consumer's `oxfmt` launcher + Node interpreter, which the
  JS launcher used to pass via `--oxfmt-bin` / `RSVELTE_FMT_NODE`, are written to a
  `rsvelte-fmt.runtime.json` sidecar at install time and read by the binary.

  The JS launcher is kept as a fallback for when `postinstall` doesn't run
  (`--ignore-scripts`, package managers that gate build scripts, or Windows, which
  stays on the launcher) — same behavior as before, just slower. Output is
  unchanged (same formatter engine); this is purely a distribution/startup change.

  Consumers that gate install scripts (e.g. pnpm's `onlyBuiltDependencies`) should
  allow `@rsvelte/fmt` to get the native-direct speedup; otherwise the fallback
  launcher is used.

- 2e87e1c: fmt: format `.ts`/`.js` files in-process via `oxc_formatter` instead of
  delegating them to an `oxfmt` subprocess. It's the same engine `oxfmt` uses for
  these files, so the output is byte-identical (verified 1496/1496 on a real-world
  corpus), while skipping the per-invocation `oxfmt` Node startup. CSS / Markdown /
  YAML / JSON stay delegated to `oxfmt` (those are a separate, prettier-based
  engine).

  `.oxfmtrc` `overrides` are now parsed and resolved per file, so each file is
  formatted at the same options `oxfmt` would apply. An override `printWidth`
  larger than `oxc_formatter` can represent (320) — e.g. a "never wrap" `1000` — is
  delegated to `oxfmt` (which honors it) to stay byte-identical. Files `oxc` can't
  parse fall back to `oxfmt`, so coverage never regresses, and `--no-native-js` is
  an escape hatch.

- b1b9f02: fmt: format inline `<style>` blocks through a warm oxfmt daemon (POSIX) instead
  of spawning `oxfmt` per block. Spawning paid a Node cold start (~370ms measured)
  every time a changed `<style>` block was re-formatted — the dominant cost of
  format-on-save once `.svelte`/`.ts`/`.js` moved in-process. A long-lived daemon
  (`daemon.mjs`, shipped in the package) keeps oxfmt loaded; the binary connects
  over a Unix socket and gets each block back in ~ms (~370ms → ~5ms warm).

  The daemon is deliberately "dumb": the Rust side resolves the per-block oxfmt
  options (base `.oxfmtrc` + the block's print width) and sends them inline, so the
  daemon never reads config files or applies `overrides` — its output is
  byte-identical to the spawn path (verified 555/555 on a real-world `.svelte`
  corpus, daemon vs spawn). Any failure (no Node, no bundle, connect/spawn/protocol
  error) falls back to spawning `oxfmt`, so correctness never depends on it; Windows
  stays on the spawn path. `RSVELTE_FMT_NO_DAEMON=1` forces the spawn path.

  The daemon is version-keyed by oxfmt fingerprint + protocol version (an oxfmt
  upgrade starts a fresh one), idle-exits after 60s, and handles concurrent
  invocations (e.g. `pnpm -r`) on one instance. Directory delegation stays a single
  `oxfmt` invocation — oxfmt already parallelizes its own directory walk there, so
  routing it per-file through the daemon would be slower, not faster.

## 0.3.18

### Patch Changes

- b72a96d: fmt: narrow a wrapped `class:NAME={EXPR}` directive value by its `class:NAME=`
  prefix, like `style:` / `on:` / `use:` already do (#795). When the open tag
  wraps and the directive's full line overflows the print width, its value now
  breaks at the right operator instead of staying flat past the margin.
- b72a96d: fmt: don't insert a blank line between a comment and the `<style>` / `<script>`
  it leads. The section-reorder pass treated a markup gap that ended with a
  comment glued to the next section (e.g. `</div>\n<!-- … -->\n<style>`) as one
  markup unit, then joined it to the section with a blank line — pushing the
  comment away from the tag it documents. The trailing comment run is now split
  off and attached to the section as its leading comment, so the blank line falls
  before the comment (matching prettier-plugin-svelte / oxfmt). UTF-8 safe for
  multi-byte markup text.

## 0.3.17

### Patch Changes

- b6a2ea7: fmt: fix inline `<style>` blocks being mangled in the file (`--write` / `--check`)
  path. The batched style pipeline records each raw `<style>` body and emits a
  single-line placeholder during the format pass, then formats every body in one
  `oxfmt` call and splices the results back. The splice was a plain string
  replace, so the in-process formatter's re-indentation never reached the
  multi-line CSS: every line after the first stayed at column 0 and `oxfmt`'s
  trailing newline leaked in as a blank line before `</style>`. On a real corpus
  this diverged ~33% of components from the `--stdin` path (which re-indents
  correctly). The splice now re-indents with the same routine the single-file /
  stdin path uses, so both paths are byte-identical.

  The batch also formatted every `<style>` body at the base print width, so a
  column-sensitive long selector or value wrapped differently from `oxfmt` (which
  narrows by the block's indentation). Bodies are now grouped by their rendered
  width — one `oxfmt` call per distinct width — so wrapping matches the stdin path
  while still batching (nearly every block shares one width). The `<style>` cache
  key now includes the width so the same body at two indentations can't collide.

## 0.3.16

### Patch Changes

- 88da008: fmt: treat `<textarea>` as a verbatim whitespace-sensitive element, matching oxfmt 0.56

  oxfmt 0.56 formats `<textarea>` content as verbatim raw text (like the browser, where a textarea's text is literal). rsvelte-fmt now matches: the open tag's `>` always hugs the last attribute (never breaks onto its own line, which would inject a newline into the content), and the interior text is preserved unchanged rather than re-indented (tabs → spaces). This is paired with bumping the `oxfmt` oracle dependency to ^0.56.0.

## 0.3.15

### Patch Changes

- 40b683f: Fix the collapse/markup layout path hardcoding 2-space indentation: the Doc-IR
  print unit and the space-count→indent-level conversion now honor the configured
  `indentWidth`/`indentStyle` (4-space, tabs, etc.) instead of assuming 2 spaces.
  Previously, fill-wrapped prose and hugged inline elements were re-indented at the
  wrong column for any non-default indent setting. Byte-identical for the default
  2-space config (0 corpus regressions); adds 4-space and tab regression tests.
- 5e2fafb: Drive the formatter-parity corpus (rsvelte-fmt vs the `oxfmt(svelte:true)` =
  prettier-plugin-svelte oracle) from 295 known failures down to a small residual,
  with no regressions. Completes large parts of the prettier-plugin-svelte HTML
  child-layout port onto the Doc IR (open-tag `dedent(softline)`, pure-text prose
  word-fill via `Doc::Fill`, wrappable self-closing components, prose-fill
  component bodies, re-hugging inline elements whose open tag already wrapped,
  `blockElements` alignment) and improves embedded-JS formatting (`{@render}`/
  `{@html}` object-arg wrapping, declaration-tag formatting, `{#each}`/`{#if}`
  block-header wrapping, `<script>`/`<style>` open-tag attribute wrapping) via
  correct width/column accounting. Also fixes several correctness bugs: preserve
  TypeScript `as` casts in spread attributes, keep leading comments in function
  bindings, and keep inline self-closing components in prose runs. Genuine
  prettier-plugin-svelte/oxfmt oracle bugs (which corrupt source) and out-of-scope
  inputs are excluded from the parity oracle and documented in
  `docs/fmt-oracle-bugs.md` for upstream filing.
- 96b92fb: Formatter-parity corpus reaches 0 known failures (from 295): every in-scope
  component across sveltejs/svelte + svelte.dev + bits-ui/flowbite/melt/shadcn now
  formats byte-identically to the `oxfmt(svelte:true)` oracle, with 23 principled
  documented exclusions (oracle bugs that corrupt source, oxc/prettier engine
  divergences, invalid input, migrate, and one oxfmt cross-platform
  non-determinism case). See `docs/fmt-oracle-bugs.md` + `docs/corpus-fmt-remaining-work.md`.
- df144a3: Formatter-parity: byte-parity for nested inline `<span>` highlighting inside
  `<pre><code>` (`code-viewer`), via the `<pre>` verbatim re-indent subsystem
  (text-only span collapse + sibling-span pack/unpack/overflow-split). `<pre>`
  content is whitespace-verbatim, so it is handled by string-level re-indentation
  by design (the documented exception to the Doc-IR element-layout rule); a faithful
  Doc-IR `printPre` refactor remains tracked in `docs/corpus-fmt-remaining-work.md`.
  Known-failures: 2 → 1.

## 0.3.14

### Patch Changes

- f06709c: Improve Svelte-structure formatting parity with prettier-plugin-svelte: strip
  quotes around single-mustache attribute values (`attr="{expr}"` → `attr={expr}`),
  reorder top-level sections into canonical order (`svelteSortOrder`: options →
  module script → instance script → markup → styles), and trim child boundary
  whitespace for components and block elements while keeping an edge space for
  inline/custom elements. Verified by the new full-corpus formatter-parity gate
  (`scripts/compat-corpus` fmt track).
- eea9a5a: Fix a regression where a `{@const}` tag carrying a TypeScript type annotation
  (`{@const name: Type = value}`, e.g. an exhaustiveness check
  `{@const _: never = column}`) failed with `script parse failed`. The collapse
  path was formatting the tag body as a bare expression (`(name: Type = value);`),
  which is not valid; it is now formatted as the TS variable declaration it
  actually is (`const name: Type = value;`) using the same TS-aware parse path as
  `<script lang="ts">`, so the type annotation is parsed and preserved.

## 0.3.13

### Patch Changes

- 359c84d: perf(fmt): hand inline `<style>` blocks to oxfmt as a directory, not N explicit paths (#707)

  On a cold run (cache miss — first run, or CI without a persisted cache) the batched inline-`<style>` pass staged every extracted CSS body into a temp dir and invoked `oxfmt s0.css s1.css … sN.css` with one explicit path per block. A multi-hundred-entry argv defeats oxfmt's parallel directory walk (and at scale risks `ARG_MAX`), making the cold path slower than it needs to be.

  `rsvelte-fmt` now passes the staging directory itself (`oxfmt <dir>`) and reads the results back by their known `s{i}` names. The staging dir holds only our files and is cleared before each batch, so the walk formats exactly the set we read back. Output is byte-identical — same `oxfmt`, same forced `-c` config — and warm runs are unchanged (still served from the `<style>` cache). The two oxfmt subprocesses (non-`.svelte` delegation and the CSS batch) already overlap via `rayon::join`.

## 0.3.12

### Patch Changes

- d5db8ae: fix(fmt): reach byte-for-byte parity with the `oxfmt(svelte: true)` oracle across the entire svelte.dev corpus (1103/1103). Markup-layout fixes: fill fragment-level inline prose runs (pure text and one-line inline elements) that overflow; hug a block's single inline-element body (`{#each …}<span>…</span>{/each}`); wrap an overflowing content mustache inside `<pre>`/`<textarea>`; member-chain-break a hugged element's overflowing trailing mustache; glue a hugged inline child to a wrapped open tag's last attribute; format `<pre>`/`<textarea>` block content (space-indented bodies + embedded JS, element-direct whitespace kept as tabs) and hug pure-text components. Correctness fixes: preserve raw entities in attribute values (no longer decode `&quot;` → `"`, which corrupted the markup); make the collapse re-parse best-effort instead of fatal; fall back to the TypeScript parser for a `<script>` without `lang="ts"` that uses TS-only syntax.
- d5db8ae: test(fmt): add the svelte.dev formatter parity corpus. A new test suite formats every `.svelte` file and every ` ```svelte ` markdown code block from the `svelte.dev` repo (added as a submodule) and asserts byte-for-byte equality with an `oxfmt(svelte: true)` oracle — `prettier-plugin-svelte` for the Svelte structure plus the oxc engine for embedded JS/CSS, the same layering rsvelte-fmt uses — so diffs isolate rsvelte's Svelte-structure formatting. A third stage runs the `rsvelte-fmt` CLI on whole markdown files vs a direct-oxfmt oracle to guard `.md` delegation. Oracle outputs are precomputed by `pnpm run generate-fmt-corpus` (gitignored, CI-cached by svelte.dev SHA); the suites track progress against committed baselines (`tests/fmt_corpus_baseline.txt`, `tests/fmt_corpus_markdown_baseline.txt`) and fail only on new regressions. Initial: Stage 1+2 726/1148, Stage 3 638/638.

## 0.3.11

### Patch Changes

- 4ce4926: fix(fmt): locate the `<script>` opening-tag terminator with a quote-aware scan so a `>` inside an attribute value no longer corrupts body extraction. A `<script lang="ts" generics="T extends Record<string, unknown>">` has a literal `>` inside the `generics` attribute value; the naive `block.find('>')` in `body_span` matched that one first and started the body slice mid-attribute, so oxc parsed garbage and reported a spurious `Unexpected token` — leaving the whole file unformatted. `find_open_tag_end` now skips any `>` that appears inside single- or double-quoted attribute values, terminating the open tag at the real unquoted `>`. Closes #946.

## 0.3.10

### Patch Changes

- aff27c5: test(fmt): lock `<script>` long type-argument wrapping to oxfmt parity (#761). The `<script>`-body reflow divergence in #761 (e.g. a long `type … = Awaited<ReturnType<…>>;` kept on one line instead of breaking its outer type-argument list) was an `oxc_formatter` digest skew, already aligned across the workspace in #771. This adds a regression test pinning the now-matching output at the pinned rev so a future digest bump that regresses the wrapping is caught. Closes #761.

## 0.3.9

### Patch Changes

- b26d4f0: fix(fmt): wrap attribute-value expressions by their rendered column, not column 0. Attribute and directive values were formatted at column 0 with the full print width, so a value that fits at column 0 but overflows once the open tag wraps and the attribute renders at its nesting indent stayed inline — diverging from prettier-plugin-svelte, which narrows the value's print width by the attribute's nesting depth. The open-tag rewrite now threads the attribute depth (`depth + 1`) into every value formatter (`render_attribute` → `render_attribute_node` / directive / spread / sequence paths) via a new `format_attribute_value_expression`, so e.g. a long `config={{ … }}` object now breaks across lines (with the existing `render_multi_line` reindent owning the continuation columns) exactly like oxfmt. This is sub-case (a) of #795 (the depth-unaware wrap decision, ~69 of 110 divergent files). Sub-case (b) — the Svelte-5 function-binding `bind:value={getter, setter}` softline brace shape — is left for a follow-up: it needs reconciling oxc's sequence-continuation indent with prettier's, which is a separate change. Partially addresses #795.
- c547af9: fix(fmt): break the braces of a multi-line Svelte 5 function binding and drop its outer parens (#795 sub-case b). A function binding `bind:value={getter, setter}` parses as a top-level sequence expression, so it previously went through the generic mustache-sequence path that re-adds the outer parens (`bind:value={(getter, setter)}`, kept for `{(a, b)}` content — #799) and hugged the braces on one line. prettier-plugin-svelte instead prints a function binding _without_ the parens and, when the members don't fit on the attribute line (or a member is itself multi-line, e.g. a block-bodied setter), breaks the `{` / `}` onto their own lines with each member indented one level:

  ```svelte
  <TextInput
    bind:value={
      () => model.x ?? '',
      (value) => {
        model.x = value;
      }
    }
  />
  ```

  A new `format_function_binding` in `crate::expression` detects the top-level sequence on a `bind:` directive, formats each member individually (so no outer parens), and either keeps the binding inline (`bind:value={a, b}`) when it fits or emits the broken-brace shape, which the existing open-tag `render_multi_line` reindent then pushes out to the attribute column. Closes #795.

- cfc2fa6: fix(fmt): remove an unused `format_expression_source` import in `markup.rs`. The dead import had no effect on formatter output, but the CI build runs with `RUSTFLAGS=-Dwarnings`, which promotes the `unused import` warning to a hard compile error and broke the Clippy, Documentation, and Test jobs on `main`. Dropping the import restores a clean build.

## 0.3.8

### Patch Changes

- c9303b5: fix(fmt): place the `>` correctly when a wrapped element has whitespace-sensitive inline content. When an element's open tag wraps to the multi-line shape, `render_multi_line` always emitted the closing `>` on its own line at the outer indent. For an element whose children are whitespace-sensitive inline content (e.g. text directly touching the tag, `>x</button>`), moving the `>` to its own line injects significant whitespace before the text — so prettier-plugin-svelte instead keeps the open `>` glued to the last attribute (`}}>x`) and breaks the _closing_ tag's `>` onto its own line (`</button\n>`). rsvelte now mirrors that: `push_open_tag` reports whether it wrapped, and the open `>` hugs / close `>` breaks when the content is non-whitespace-adjacent to the tag. Block content (children on their own line, whitespace before/after) is unaffected. Closes #798.
- dcc2134: fix(fmt): keep the outer parentheses of a top-level sequence (comma) expression in a mustache, matching prettier-plugin-svelte. `oxc_formatter` intentionally re-adds the outer parens of a top-level `SequenceExpression` (its `NeedsParentheses` impl returns true for an `ExpressionStatement` parent), and prettier-plugin-svelte keeps them — but `format_expr_core` then unconditionally ran `strip_outer_parens`, peeling the parens oxc had just added. So `{((ref = cond ? a : undefined), '')}` was emitted as `{(ref = cond ? a : undefined), ''}`. The strip is now skipped when the parsed top-level expression is a `SequenceExpression`; every other expression keeps the existing redundant-paren strip (`{(a + 1)}` → `{a + 1}` is unchanged). Because the fix lives in the shared `format_expr_core`, it also covers sequences in attribute values, directives, and block headers. Closes #799.
- 9d936d8: fix(fmt): break a long `{#snippet}` parameter list across lines like a function signature. `{#snippet name(params)}` parameters were spliced one-at-a-time and each forced onto a single line (`Expand::Never` + max width), so a long destructured/typed parameter list never wrapped — unlike prettier-plugin-svelte, which prints the snippet header as a function signature and breaks it by print width. The whole header `name<…>(params)` is now formatted as one `function name<…>(params) {}` unit with normal width-driven breaking (narrowed by the markup depth and the `{#snippet ` prefix), then reindented to the snippet's depth. The other block headers (`{#each}` / `{#await}` / `{#if}` / `{#key}`) still stay single-line — only `{#snippet}`, whose `{/snippet}` delimiter makes a multi-line header safe, breaks. Closes #797.

## 0.3.7

### Patch Changes

- 553a26e: Keep a `<script>` body indented after a regex literal that contains quotes.

  The body is formatted at indent 0 then re-indented one level under `<script>`. The re-indent scanner tracks string / comment / template context to avoid misreading a quote or `${` that sits inside one, but it doesn't lex regex literals — so quotes inside a regex (`/["']x/`) opened a string that never closed. The spuriously-open string then swallowed every following newline, and the rest of the body collapsed to column 0 (idempotent and still valid JS, so earlier break/idempotency checks didn't catch it; it surfaced as an `oxfmt` divergence). The scanner now treats a raw newline inside a string as a desync and recovers at the line boundary, so the body stays correctly indented.

  The attribute-value re-indent in `markup.rs` carried a byte-for-byte copy of the same scanner (with the same latent bug); it now shares the fixed `reindent` helper instead.

## 0.3.6

### Patch Changes

- 0a89cde: Wrap markup expressions by the column they render at, matching `prettier-plugin-svelte` (which `oxfmt` delegates `.svelte` to).

  Every JS expression was formatted at indent 0 and then spliced into the markup, so wrap decisions used the full print width regardless of nesting: a line that fit at column 0 silently overflowed once nested, and continuation lines stuck at column 0 instead of aligning to the nesting depth.
  - `<script>` bodies are narrowed by one indent level before formatting (the body is nested one level under `<script>`).
  - Content expressions (`{expr}`, `{@html}`, `{@render}`, `{@attach}`) thread the markup nesting depth through the walk, narrow the width by `depth × indentWidth`, and re-indent continuation lines to that depth.
  - Block-header expressions (`{#if}`, `{#each}`, `{:else if}`, `{#key}`, `{#await}`, snippet name) are forced onto a single line — `prettier-plugin-svelte` never breaks a block tag's expression regardless of width.

  On a 1,115-file Svelte corpus this brings `oxfmt`-divergent files from 180 to ~111, with zero idempotency breaks and zero `svelte` parse breaks. The remaining diffs are attribute-value wrapping, close-tag placement, and snippet-parameter expansion, tracked for follow-up.

## 0.3.5

### Patch Changes

- bde55be: chore(deps): align all workspace `oxc` / `oxc_formatter` / `oxc_formatter_core` git deps to a single newer revision (71e489a). The split renovate bumps (#675/#676) fail CI because they move only `oxc_formatter`, leaving the ~15 other workspace `oxc` crates on the old revision — producing a duplicate `oxc_allocator` and an `E0308` mismatch. Unifying every `oxc` dep to the same revision fixes that; verified compiler-safe (compatibility report passes) and formatter-safe (all fmt fixtures pass). Step toward oxfmt parity for `<script>` formatting (refs #761).

## 0.3.4

### Patch Changes

- 63d31a2: Decide open-tag attribute wrapping by visual (East Asian) width, matching `oxfmt` / prettier.

  `visual_width` counted bare `chars()`, so CJK-heavy tags were under-measured: fullwidth text (Japanese, fullwidth punctuation, …) is two display columns each but counted as one, so a tag that exceeded `printWidth` on screen stayed on a single line instead of wrapping. Width is now measured with `unicode-width`, so an attribute list whose visual width crosses `printWidth` wraps one-per-line as `oxfmt` does.

  On a 1,115-file Svelte corpus this brings oxfmt-divergent files from 208 to 179. (The remaining attribute diffs are expression wrapping _inside_ attribute values, which is `oxc_formatter`-driven and tracked in #761.)

## 0.3.3

### Patch Changes

- f680806: Keep `{:else if}` branches at the same indent as the opening `{#if}`, matching `oxfmt` / prettier-plugin-svelte.

  svelte desugars `{:else if}` into an `elseif` `IfBlock` nested inside the alternate fragment. Both the whitespace re-indent pass (`indent.rs`) and the open-tag pass (`markup.rs`) recursed into that nested block, adding one extra indent level per chained branch — so `{:else if}` / `{:else}` bodies (and their wrapped attributes) drifted one level deeper than `oxfmt` on every chain. They now follow the chain at the opening `{#if}`'s depth. A plain `{:else}` whose body merely starts with an `{#if}` is unaffected (it still nests one level deeper).

  On a 1,115-file Svelte corpus this brings oxfmt-divergent files from 264 to 208.

## 0.3.2

### Patch Changes

- 9de2073: Match `oxfmt` / prettier-plugin-svelte for `<style>` indentation and blank lines, so `rsvelte-fmt` output round-trips through `oxfmt --check`.
  - **`<style>` re-indentation**: the formatted CSS body is now re-indented one level under the `<style>` tag and placed on its own lines, instead of being glued onto the open tag (`<style>.foo {`). The body is dedented before formatting so repeated runs stay idempotent (multi-line comments / strings no longer accumulate indentation).
  - **Blank lines**: a single blank line is now preserved between markup siblings and where markup abuts the root `<script>` / `<style>` (the conventional blank line after `</script>`). Runs of blank lines collapse to one, and leading/trailing blanks just inside an element are removed.

  On a 1,115-file Svelte corpus this cut the files that differ from `oxfmt` from 1,095 to 270 (the remainder is `<script>`/markup divergence tracked separately), with zero parse failures and full idempotency.

## 0.3.1

### Patch Changes

- 193e184: fix(release): sync the Rust crate version into `crates/rsvelte_fmt/Cargo.toml` (and `Cargo.lock`) during the release, so `rsvelte-fmt --version` matches the published `@rsvelte/fmt` package instead of reporting a stale `0.1.0`. `sync-version.mjs` previously only mirrored `@rsvelte/compiler` → `rsvelte_core`; it now also mirrors `@rsvelte/fmt` → `rsvelte_fmt` (#745)

## 0.3.0

### Minor Changes

- 151fe49: Respect `.gitignore`, `.prettierignore`, and `.oxfmtrc` `ignorePatterns` when discovering `.svelte` files, matching `oxfmt` (which already honors them for the non-`.svelte` files it walks).

  Previously the in-process Svelte walker only skipped a hardcoded set of directories (`node_modules`, `target`, `dist`, `build`, hidden dirs), so `.svelte` files excluded by these ignore sources — e.g. test fixtures listed in `.oxfmtrc` `ignorePatterns` — were still reformatted. The walker now uses the `ignore` crate with the same gitignore semantics as `oxfmt`, and `OxfmtConfig` parses `ignorePatterns`, so `rsvelte-fmt .` and `oxfmt .` skip exactly the same `.svelte` files.

## 0.2.1

### Patch Changes

- 12dc81e: perf(fmt): hand inline `<style>` blocks to oxfmt as a directory, not N explicit paths (#707)

  On a cold run (cache miss — first run, or CI without a persisted cache) the batched inline-`<style>` pass staged every extracted CSS body into a temp dir and invoked `oxfmt s0.css s1.css … sN.css` with one explicit path per block. A multi-hundred-entry argv defeats oxfmt's parallel directory walk (and at scale risks `ARG_MAX`), making the cold path slower than it needs to be.

  `rsvelte-fmt` now passes the staging directory itself (`oxfmt <dir>`) and reads the results back by their known `s{i}` names. The staging dir holds only our files and is cleared before each batch, so the walk formats exactly the set we read back. Output is byte-identical — same `oxfmt`, same forced `-c` config — and warm runs are unchanged (still served from the `<style>` cache). The two oxfmt subprocesses (non-`.svelte` delegation and the CSS batch) already overlap via `rayon::join`.

## 0.2.0

### Minor Changes

- 3194b85: perf(fmt): cache formatted inline `<style>` blocks to skip the oxfmt round-trip (#703)

  Inline `<style>` CSS is delegated to `oxfmt` (for byte-identical output parity with standalone `.css`), which means staging the body and a subprocess round-trip — the dominant cost when formatting a real `.svelte` tree. Most `<style>` bodies are already canonical on a re-run, so this work was repeated every invocation.

  `rsvelte-fmt` now keeps an on-disk content-addressed cache of formatted `<style>` results, keyed by the oxfmt version (binary fingerprint), the resolved `.oxfmtrc`, and the exact body. Unchanged blocks are served from cache and skip `oxfmt` entirely; only cache misses reach the batched oxfmt call. Cache hits are byte-identical to a fresh format, so output is unchanged.

  On a warm cache the inline-`<style>` overhead effectively disappears (in a local 343-block check, the run dropped from ~0.37s to ~0.17s; on larger real corpora the saved oxfmt round-trip is proportionally bigger). Cold runs add only the cost of writing cache entries.

  The cache is on by default. Disable it with `--no-style-cache` or `RSVELTE_FMT_NO_CACHE`; relocate it with `RSVELTE_FMT_CACHE_DIR` (defaults to the platform cache dir, e.g. `~/.cache/rsvelte-fmt`).

### Patch Changes

- 4ffd1de: fix(fmt): don't re-indent multi-line template-literal interiors in attribute values (#698)

  A multi-line template literal passed as an **attribute value** (e.g. `text={` … `}`) had its interior lines re-indented to the markup nesting level on every format pass. Because template-literal whitespace is part of the runtime string, this both **mutated the string value** and was **non-idempotent** — every pass added another indent level so the formatter never reached a fixed point. This was a residual of the #692 multi-line attribute re-indentation fix.

  `reindent_continuation` in `rsvelte_formatter`'s open-tag rewriter now uses a template-literal-aware scanner (mirroring the `reindent_body` scanner added for #686): it tracks template-literal / `${ … }` nesting plus string and comment context, and leaves lines that begin inside template-literal quasi text verbatim. Code inside `${ … }` substitutions is still re-indented as ordinary code.

## 0.1.5

### Patch Changes

- 0f599e1: fix(fmt): re-indent multi-line attribute expressions to the markup nesting level (#692)

  A multi-line expression inside an element attribute (a multi-line arrow handler, a `bind:` getter/setter pair, …) was not re-indented to its position in the markup tree: the delegated expression formatter emits at column 0, so continuation lines collapsed toward column 0–2 instead of aligning under the attribute. The output was valid and idempotent, but visually broken — and a large share of the structural churn when adopting rsvelte on a real component tree.

  Two changes in `rsvelte_formatter`'s open-tag rewriter:
  - A multi-line attribute value now forces the multi-line tag layout (each attribute on its own line). Previously a short-by-char-count value with embedded newlines was treated as fitting on one line.
  - In the multi-line layout, every continuation line of an attribute value is re-indented to the attribute column, so a multi-line `onclick={() => { … }}` / `bind:expanded={getter, setter}` aligns under the attribute and its closing `}}` sits at the attribute indent.

- 0f599e1: fix(fmt): honor `.oxfmtrc` in inline `<script>`/`<style>` and cover the full oxfmt file set on directories (#693, #694)

  Two formatter fixes for using `rsvelte-fmt` as a drop-in project formatter:
  - **#693 — inline blocks now respect the project `.oxfmtrc`.** Standalone files delegated to `oxfmt` already discovered the config, but inline `<script>` blocks (formatted in-process by `oxc_formatter`) and inline `<style>` blocks (staged in a temp dir, out of reach of oxfmt's own cwd discovery) were formatted with defaults — so e.g. `singleQuote: true` was ignored and every string in a component flipped to double quotes. `rsvelte-fmt` now resolves `.oxfmtrc.json` / `.oxfmtrc.jsonc` (upward from the working directory, or via a new `--config`/`-c` flag) and applies it to inline blocks: `singleQuote`, `semi`, `printWidth`, `tabWidth`, `useTabs`, `trailingComma`, `quoteProps`, `arrowParens`, `bracketSpacing`, `bracketSameLine`, and `endOfLine` now match standalone files. Explicit `--print-width` / `--tab-width` / `--use-tabs` flags still win.
  - **#694 — directories now cover the full oxfmt-supported set.** The walker hard-coded 9 extensions, silently skipping `.md` / `.yaml` / `.toml` / `.html` (and anything else oxfmt supports), so `rsvelte-fmt .` formatted strictly fewer files than `oxfmt .`. Directory inputs are now delegated whole to a single `oxfmt` invocation (with a `!**/*.svelte` exclude so the in-process Svelte pass keeps those, and `--no-error-on-unmatched-pattern` so a Svelte-only tree is a clean no-op). Coverage now matches `oxfmt .` and is `.gitignore`-aware, while the two passes still run in parallel.

## 0.1.4

### Patch Changes

- 31feab0: perf(fmt): batch all `<style>` blocks into a single `oxfmt` call (~23× faster on style-heavy trees)

  Formatting a tree of `.svelte` files spawned `oxfmt` once per `<style>` block. Because the consumer's `oxfmt` is a Node launcher, every spawn paid a fresh Node cold start (~26ms measured), which dominated wall-clock — on a 200-file corpus, style delegation was 99.8% of the runtime (8.1s, vs 9ms for the pure-Svelte formatting).

  `rsvelte-fmt` now formats every file in parallel with a _collecting_ style callback that records each `<style>` body and returns a placeholder, runs **one** batched `oxfmt` invocation over all of them (the same "many paths, one process" path already used for non-`.svelte` files), and substitutes the results back. The `rsvelte_formatter` library is unchanged — this is entirely in the CLI.

  Measured 23× faster (8.1s → 0.35s) on a 200-file `<style>`-heavy corpus, with byte-identical output. The single-file stdin path is unchanged.

## 0.1.3

### Patch Changes

- cd6a6bc: fix(fmt): snippet param lists, open-tag comments, and template-literal re-indentation (#684, #685, #686)

  Three formatter bugs found via a real-monorepo corpus pass:
  - **`{#snippet}` parameter lists (#684):** snippet parameters are ordinary
    (TS) function parameters, but they were routed through the destructuring
    pattern path (`let <pattern> = …`). Optional params (`x?: T`) errored
    (`Optional declaration is not allowed here`, exit 2), default values
    (`x: T = v`) errored (`Cannot assign to this expression`, exit 2), and a
    typed default (`items: string[] = []`) silently leaked the internal
    `__rsvelte_fmt_rhs__` sentinel into the output (exit 0, invalid Svelte).
    Snippet params now format through a real function parameter list
    (`function f(<param>) {}`), so optional markers, type annotations, and
    default values all round-trip.
  - **Open-tag comments dropped (#685):** a `//` line comment (or `/* … */`)
    placed between attributes inside an element's start tag was silently
    deleted, because the open-tag rewrite rebuilt the tag from the attribute
    list alone. Comments in the open tag are now collected and interleaved
    with the attributes in source order; a line comment forces the multi-line
    tag shape (it can't share a line with the closing `>`).
  - **Template-literal re-indentation (#686):** re-embedding the formatted
    `<script>` re-indented every line — including the interior of multi-line
    template literals, whose whitespace is part of the string value. That both
    mutated the embedded string and made formatting non-idempotent (each pass
    added another indent level). The re-embed step now skips lines that begin
    inside template-literal quasi text, so the string value is preserved and
    formatting is a fixed point.

## 0.1.2

### Patch Changes

- 3d87277: fix(fmt): preserve `{name}` shorthand attributes, parse template expressions as TypeScript, and drop the unsupported `oxfmt --stdin` flag (#679, #680, #682)

  Three formatter bugs that together blocked formatting most real `.svelte` files:
  - **Shorthand attribute corruption (#679):** a `{name}` shorthand attribute's
    `ExpressionTag` spans only the identifier (matching upstream `start: id.start,
end: id.end`), with no surrounding braces. The formatter unconditionally
    sliced one byte off each end of the span, so `{width}` was silently rewritten
    to `width={idt}` and the 1-char `{x}` to `x={}` — undefined-identifier
    references emitted with exit 0. Brace-stripping now only happens when braces
    are actually present at the span boundaries, so `{name}` round-trips verbatim.
  - **`oxfmt --stdin` rejected (#680):** inline `<style>` blocks were delegated to
    `oxfmt --stdin --stdin-filepath inline.css`, but oxfmt 0.49.0+ has no
    `--stdin` flag and exits non-zero (`--stdin is not expected in this context`),
    failing every file with a `<style>` block (exit 2). oxfmt reads stdin
    implicitly given `--stdin-filepath`, so the `--stdin` flag is dropped from both
    oxfmt invocations.
  - **Template expressions parsed as JS, not TS (#682):** mustache `{…}`,
    attribute, and directive expressions were always parsed as plain JavaScript,
    even in a `<script lang="ts">` component. TS-only syntax (`as` / `satisfies` /
    non-null `!` / `as const` / type-arg casts) errored with TS8016 (exit 2) and a
    generic call `fn<T>(a)` silently miscompiled to the comparison `fn < T > a`.
    Template source is now parsed in the same dialect as the `<script>` body. For
    directive values the parser narrows a cast down to its inner identifier (so
    `bind:value={value as string}` was collapsing to `bind:value`, dropping the
    cast), so directive values are now sliced from the brace source rather than
    the bare AST node.

## 0.1.1

### Patch Changes

- 6994f59: fix(fmt): preserve markup after a `<script>` block and stop the self-closing close-tag panic (#669)

  A self-closing / void element (`<span />`, `<path />`) after a leading
  `<script>` block was corrupted: the close-tag detector scanned backward for any
  `</` and matched the preceding `</script>`, emitting a bogus edit over the
  script-close plus the markup in between. One such element silently dropped the
  markup (exit 0); two or more siblings produced overlapping edits that panicked
  with a slice out-of-bounds.

  `find_close_tag_span` is now strict — the close tag must be the text immediately
  ending at the element (`<`, `/`, tag name, optional whitespace, `>`) — so
  self-closing/void elements yield no edit while genuine `</tag>` close tags still
  normalize. The Node CLI wrapper also now propagates native signal terminations
  (e.g. SIGABRT from a panic) as a non-zero exit instead of reporting exit 0.
