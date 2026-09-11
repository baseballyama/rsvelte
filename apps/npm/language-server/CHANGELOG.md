# @rsvelte/language-server

## 0.7.8

### Patch Changes

- 60b3470: Reduce WebAssembly size by sharing the compiler's compact JSON serializer for `parse_svelte` and repeating size optimization until it converges. The returned AST JSON no longer includes indentation; its data and UTF-16 positions are unchanged. Compiler features and exports remain available.

## 0.7.7

### Patch Changes

- de9c73b: fmt: lay out a wrapped attribute value's interpolations at the indent they print at

  A quoted attribute value with several `{…}` interpolations had each broken
  interpolation shaped on the room its first line had, and that shape was kept
  for continuation lines that had the whole width — `parentRowId === row.id`
  split at `===` on its own line, `{session?.user?.email}` split at every `?.`.
  Each interpolation is now rebuilt at the attribute's real indent when it
  prints, measured up to its first break opportunity, and the closing `"` is
  charged only where prettier charges it.

## 0.7.6

### Patch Changes

- 7ae32be: svelte2tsx: anchor an attribute key's opening quote on the name it opens

  The generated key `"data-open"` is an inserted quote, the attribute name kept as
  a source chunk, and a closing quote. The opening quote was flushed inside the
  preceding gap's single `overwrite`, so its map segment anchored on the end of
  the _previous_ attribute. TypeScript reports a definition or hover range that
  starts at that quote, so the range's start resolved to the previous attribute —
  and on a multi-line start tag, to the previous line.

  The delimiter is now written over the name's own first character, which is what
  the reference does. Generated text is unchanged.

- 3839dee: parse: omit `CallExpression.optional` where acorn-typescript omits it

  acorn-typescript writes `optional` on a call carrying type arguments only when
  the subscript chain was already optional at that point — `_optionalChained` in
  `parseSubscript`, threaded left to right — so `f<T>(x)` has no `optional` key at
  all while `o?.m<T>(x)` has `optional: false`. rsvelte wrote the key
  unconditionally, which is the largest single field in the `parse()` AST parity
  ratchet: 1,876 corpus files, 16.6% of all field divergences.

  The predicate is local to the call's own callee chain, so a `?.` that comes
  after the call (`f<T>(x)?.g(y)`) or one cut off by parentheses
  (`(a?.b)<T>(x)`) does not reach it — being inside a `ChainExpression` is not the
  rule. Generated code is unchanged: only the parse path can set type arguments.

- 4b19fb2: Ship a compiler-only browser wasm as the default @rsvelte/compiler entry, retain the stable /wasm subpath, and add compileModule for JavaScript rune modules. Move lint and svelte2tsx to the separately loaded /playground and /playground/wasm exports, and update their consumers.
- 16e21f3: feat(language-server): document a CSS property completion from the vendored MDN data

  A CSS property completion carried `` `<name>` CSS property `` as its
  `documentation` — the same one-line stub the hover answered with, from the same
  place: `known_css_properties.rs` is a list of names and nothing else. So one
  data gap produced divergences in `textDocument/hover` and
  `textDocument/completion` alike, and repairing only the hover would have left
  the second emission site of one lookup behind.

  `cssCompletion.js:244` and `cssHover.js:83` both render an entry through
  `getEntryDescription`. Hover passes a third `settings` argument that completion
  does not, so "the same function" is an assumption rather than a fact; driving
  the official server for both on one document measures the two strings
  **byte-identical**, which is what licenses one lookup serving both here.

  The `markdown` flag is threaded to both call sites — an embedded `<style>` block
  and a `style="…"` attribute value — so a client without markdown support gets
  the description unrendered rather than a markdown body it cannot display. A
  property the vendored data has no description for now carries no documentation
  at all, rather than the name stub.

  Two upstream fixtures stop being pinned divergences: `css-smoke-hover-normal`
  and `css-smoke-hover-nested` were recorded as answering `none` where upstream
  answers `some`, on the reason "rsvelte CSS hover does not provide
  selector-specific hover" — which the selector hover in this same change makes
  false. The manifest's known-difference count goes 57 → 55.

  The selector hover now follows the client's hover `contentFormat` as well.
  `CSSHover.convertContents` (`cssHover.js:125-147`) maps a `MarkedString[]`
  through `c.value` when the client declares no markdown support, so official
  answers a plain `"<h1>"` where a markdown client gets
  `{language: "html", value: "<h1>"}`; rsvelte emitted the tagged form to both.
  That divergence was unreachable while rsvelte answered a selector with `null` —
  the ratchet recorded the whole response as mismatched and never compared inside
  it — so it became visible only once the selector hover existed. Two
  `differential:fixtures/css-smoke-hover-normal` entries retire, taking
  `lsp-known-failures.json` from 24128 to 24126.

- 16e21f3: feat(language-server): hover a CSS declaration with its MDN description

  `css::hover` answered only `:global(...)`, so hovering `color` in a `<style>`
  block or in a static `style="…"` attribute fell through to tsgo, which answered
  about the `style` attribute or about nothing at all. `css_data` has carried the
  vendored MDN property set and a `getEntryDescription` port since the completion
  work; only the consumer was missing.

  The `Declaration` arm of `CSSHover.doHover` (`services/cssHover.js`) is now
  ported: `CSSDataManager.getProperty` is an exact, case-sensitive lookup on a
  name that `Property.getName` strips of a trailing `_`/`+` less merge, and the
  reported range is the whole `Declaration` node — so the colon, the value and a
  trailing `!important` all answer with the property's own description.
  `inStyleAttributeWithoutInterpolation` (`CSSPlugin.ts:256-265`) is ported with
  it, which declines the whole `style` attribute when its value holds a `{`.

  Measured against the official server over the same 24 offsets: 5/24 identical
  before, 17/24 after. The 7 that remain are selector hovers, which
  `CSSHover.doHover` answers from its `Selector`/`SimpleSelector` arms via
  `selectorPrinting` — not ported here.

- 16e21f3: feat(language-server): hover a CSS selector with its element tree and specificity

  `cssHover.doHover` walks the node path outermost-first and breaks at `Selector`,
  so a pseudo-class, a pseudo-element and `:global()` are all answered there
  rather than by the declaration arm. rsvelte answered none of them: hovering a
  selector produced a bespoke `:global(...) prevents Svelte CSS scoping` string —
  a sentence that appears nowhere in `language-tools` — or nothing at all.

  This ports `selectorPrinting.js`'s `Element`, `toElement`, `MarkedStringPrinter`
  and `Specificity` over the CSS AST `1_parse/read/style.rs` already produces, so
  a selector now answers with the element tree and the specificity link, ranged
  over the whole selector as upstream ranges it.

  Two things the port turns on that are not visible in a table of answers.
  `isPseudoElementIdentifier` is `/^::?([\w-]+)/` followed by
  `getPseudoElement('::' + name)`, so **the pseudo-element/pseudo-class split is a
  CSS-data lookup, not a colon count** — `p:before` scores `(0, 0, 2)` like
  `p::before`, and rsvelte parses it as a `PseudoClassSelector`, so the node type
  is not the classification. And `Element.addAttr` merges a repeated name with a
  space, so `.a.b` renders `class="a b"` rather than two attributes.

  A selector answers with a `MarkedString[]` where a declaration answers with a
  `MarkupContent` (`CSSPlugin.doHoverInternal` passes the `Hover` through
  untouched), so `css::hover` now returns which of the two it produced.

- 62410db: Append the Svelte-specific guidance upstream adds to two TypeScript diagnostics: a component
  constructor-type error (TS2345 mentioning `ConstructorOfATypedSvelteComponent`) and
  `Modifiers cannot appear here.` (TS1184).
- c1571c6: fix(language-server): find a document opened through a symlink

  `DocumentStore` is keyed on the URI string the client sent, and several
  responses are post-processed by looking the document up with a URI the server
  derived from the overlay's _resolved_ path. When the two differ — a workspace
  under macOS's `/var`, which is a symlink to `/private/var`, is enough — every
  one of those lookups misses and the post-processing is silently skipped.

  The store now also indexes each open document by its resolved path and consults
  that only after a direct hit fails, so the common request costs no extra
  syscall and a response still names the URI the client itself opened.

  Measured on the hover quote-widening, the loss this was found through: with a
  symlinked workspace the probe scored 2/11 EQ against 6/11 on the realpathed one;
  with the fix the two workspaces are identical cell for cell.

- 2c3614d: fmt: rebuild a broken content mustache at the column it starts and against what follows it

  A mustache in prose that had to break across lines was re-formatted at the
  width its continuation lines get, as if its first line started at the indent
  and nothing followed its `}`. prettier measures each JS group of the
  expression in place — the first against the column the `{` sits at, after the
  words before it on the line, and the last against the closing brace and any
  text glued to it — so `Best happened at {categoryData.record_holders` now
  breaks after the member that still fits on that line rather than after the one
  that fits at the indent, and a mustache ending in `}.` leaves room for the dot.

- 2b0dc16: fmt: charge a directive value's `name={` prefix to its first line only

  Once an open tag wraps, a directive value was formatted at a print width
  narrowed by its own `class:<name>=` prefix, so continuation lines that fit at
  their real indent were broken again (`selected_category.id ===` / `category.id}`
  where prettier keeps `selected_category.id === category.id}`), and the per-shape
  discounts that softened that for arrow bodies and object literals left an
  object flat past the print width where prettier expands it.

  The prefix is now a first-line offset: the expression is formatted with a
  same-line placeholder of the prefix's width in front of it and the full width
  for every later line, which is how prettier's printer measures each group
  against the column it starts at.

- 4def6f8: fmt: measure a following mustache up to its first break opportunity

  When deciding whether an inline element or an earlier interpolation fits, the
  breakable mustache behind it was charged up to the head of its outermost
  group (`{record.holders` for a member chain). prettier stops at the first
  line-break opportunity anywhere in the expression (`{record`), so
  `<span class="label">Label text</span>{record` now keeps the span's hug and
  breaks inside the mustache where the oracle does.

- 414babe: fmt: keep a `<pre>`'s attributes flat when its content offers the first break

  A `<pre>` whose one-line form overflowed had its attributes wrapped one per
  line where prettier keeps `<pre class="…">` on one line and breaks inside the
  content — at a mustache's member chain or call, at a child `<code>`'s hugged
  `>`, or at a child component's attributes. prettier's `fits` runs past the open
  tag to the content's first line-break opportunity, and only a content with no
  opportunity at all (a bare identifier, a long first text line) wraps the
  attributes.

  The formatter now measures that prefix, and lays the content line's mustaches
  out left to right the way prettier's printer does: a mustache breaks when its
  flat form plus everything up to the next opportunity overflows, its first line
  is charged the open tag before it and its last line the `}</pre>` after it, and
  its continuation lines sit one level inside the element.

- 15ef4ec: fix(language-server): answer "is this inside generated code" the way upstream does

  Upstream has one `isInGeneratedCode`
  (`language-server/src/plugins/typescript/features/utils.ts:102-109`). The rename
  correction layer carried its own second answer, and it disagreed with upstream in
  two independent ways.

  `lastIndexOf(needle, from)` in JS matches a needle _beginning_ at or before
  `from`, so it finds a marker straddling the position; `text[..start].rfind(…)`
  requires the needle to end before `start`, so it does not. And upstream's
  `lastEnd === nextEnd` disjunct — whose own comment says it fires when the
  position sits inside an END marker — had no counterpart at all.

  The reachable case is a position on a marker's own leading `/`, which is exactly
  where a TypeScript node's `pos` sits: `getStart()` skips leading trivia and `pos`
  does not. Upstream answers _generated_ there and the rename port answered _not
  generated_. Measured over every position of six texts, the two disagree only at
  or inside a marker's own bytes; every ordinary span already agreed.

  Both markers open and close with `/`, so `/*Ωignore_endΩ*/` immediately followed
  by its own tail contains a second end marker starting one byte before the first
  one ends. JS `lastIndexOf` finds it and a non-overlapping scan does not, so the
  port scans overlapping positions; a randomized comparison against upstream's
  verbatim source over 256,462 probes reports 0 disagreements, with the
  non-overlapping variant kept as a live control at 131.

  `textDocument/rename` is requested by nothing under `scripts/compat-lsp/` — the
  ratchet holds 0 rename keys against 3,569 for hover — so no gate has ever
  compared this predicate and no ratchet moves. Whether tsgo returns a rename span
  whose start abuts a marker is unmeasured, and two call-site guards could mask it,
  so this may change no observable behaviour.

  The marker constants were defined twice inside the crate, which is what let two
  predicates exist; there is now one definition and one predicate.

- c7ecaf6: fix(language-server): `textDocument/inlayHint` answers `null` when the client enabled no category

  `getInlayHints` returns `null` before asking TypeScript for anything when
  `areInlayHintsEnabled(userPreferences)` is false (`InlayHintProvider.ts:38-43`),
  and `ls-config.ts:515-522` maps each of the six categories from the client's
  config with **no fallback** — so a client that sends no `inlayHints` has every
  one of them undefined and gets `null`. rsvelte read none of them: the only
  occurrence of `inlayHints` in the language server was a literal in
  `TsgoPreferences::default()` that turned all six on, so hints were produced
  whatever the client asked for and `null` was not a reachable answer.

  The config is chosen by the document's own script kind rather than by the
  shadow's extension — `getUserPreferences` picks `'typescript'` for
  `ScriptKind.TS`/`TSX` and `'javascript'` otherwise
  (`LSAndTSDocResolver.ts:339-342`) — which rsvelte could not have got right by
  looking at the shadow, because every shadow is a `.svelte.tsx` and so reads as
  TypeScript. `is_typescript_component` already answers the question the way
  upstream's `DocumentSnapshot` does, so the decision is the sibling of the one
  `component_reference_code_lens_enabled` already makes.

  Measured against the official server over stdio with the LSP gate's own
  configuration, which gives `typescript` all six categories and `javascript`
  none. Before, a plain `<script>` component answered a list where official
  answered `null`; after, both answer `null`, while a `lang="ts"` component still
  answers a list on both sides:

  | component                                        | official | rsvelte before | rsvelte after |
  | ------------------------------------------------ | -------- | -------------- | ------------- |
  | `codeaction-checkJs.svelte` (plain)              | `null`   | list           | `null`        |
  | `organize-imports-error.svelte` (plain)          | `null`   | list           | `null`        |
  | `another-ref-format-date.svelte` (`lang="ts"`)   | list     | list           | list          |
  | `codeaction-const-reassign.svelte` (`lang="ts"`) | list     | list           | list          |

  The `lang="ts"` rows are the load-bearing half: a rule that read the six
  categories off rsvelte's own merged defaults, or that keyed on the shadow's
  extension, disables hints there too and still turns the plain rows green.

  The built-in defaults are removed rather than kept alongside the check, because
  upstream forwards exactly what the client asked for; leaving them would mean a
  client that enables one category gets six.

  `parameterNames` is a string enum (`'literals'` / `'all'` are on, `'none'` is
  off) while the other five are booleans, so reading all six the same way is wrong
  in both directions — that is one of the pinned cells.

- c95dbfb: Drop the inlay hint on the generated `$$render` return type

  Upstream's `InlayHintProvider` filters hints against the generated TSX before
  mapping them back, and one of its predicates is the return-type slot of the
  `$$render` function svelte2tsx emits. rsvelte forwarded tsgo's hints unfiltered,
  so every component reported a return-type hint for a function the user never
  wrote.

  Measured against the live official server over the `upstream-features` and
  `upstream-testfiles` suites, on a tree with #4488 merged: 40 divergent keys
  retired, 0 new, and 0 movement outside `textDocument/inlayHint` in either
  direction. All 17 carriers are `lang="ts"` components.

## 0.7.5

### Patch Changes

- 192592b: Stop returning a file unformatted because of the expression wrapper

  `rsvelte-fmt` parses a template expression as `(<expr>\n);`, and that `(` makes
  OXC speculate an arrow parameter list — so a head it reads as a TypeScript
  parameter modifier (`accessor`, `declare`, `readonly`) failed the parse and the
  whole component came back verbatim. The wrapper is retried as
  `const _rsvelte_x_ = <expr>;`, which is the same expression position with no `(`
  at the head, and is accepted only when it yields the one declarator it was
  given. Measured against the oxfmt oracle over nine template hosts, this takes
  the grid from 53 to 71 matching cells and moves none the other way.

## 0.7.4

### Patch Changes

- 2904e02: fix(lsp): css diagnostics read declarations, not the first colon on a line

  `css::diagnostics` took the first `:` on each line of a `<style>` body, so a
  selector's own pseudo-class was reported as an unknown property (`a:hover` on
  its own line reports `a`) and every declaration after the first `;` on a line
  was invisible. It now walks the body tracking brace depth, comments and string
  literals, and reads a property only from a chunk that sits inside a block —
  which is what `vscode-css-languageservice` gets from a parsed stylesheet.

- f70245f: fix(lsp): a malformed request is an error, and a tag highlight is a `Read`

  `textDocument/formatting` turned a params deserialization failure into a
  successful empty result, so "I could not read your request" and "I have nothing
  to change" reached the client as the same `[]`. It now answers `InvalidParams`.

  `html_tags::highlights` emitted `DocumentHighlightKind::Text` where
  `vscode-html-languageservice` (`htmlHighlighting.js:18,21`) — and therefore the
  official server — emits `Read`.

- 87fbdef: feat(lsp): offer the four language-attribute tag completions

  `getLangCompletions` (`HTMLPlugin.ts:281-317`) offers a `lang=`-carrying copy
  beside the plain `script`, `style` and `template` tag items —
  `script (lang="ts")`, `style (lang="less")`, `style (lang="scss")` and
  `template (lang="pug")`. rsvelte had no counterpart, so it answered 128 items
  where the official server answers 132 on the same document and offset.

- e24ac7e: Resolve a `tsconfig` `paths` alias that names a `.svelte` module.

  The tsgo overlay inherited `paths` through `extends`, so an alias resolved
  against the source tree — where a component's `.svelte.tsx` shadow does not
  exist, because the shadow is served from memory under the cache directory.
  `rootDirs` lists both trees but governs relative resolution only, so
  `import Widget from '$lib/Widget.svelte'` had no type at all: hover returned
  `null` and the symbol was `any`, with no diagnostic to say so.

  The overlay now re-declares every mapping with its shadow-tree twin beside the
  original, the original first so nothing that resolves today moves. This covers
  SvelteKit's generated `"$lib/*": ["../src/lib/*"]`, which is the alias most
  projects import components through.

## 0.7.3

### Patch Changes

- d79bf20: Drop the declarator parentheses the JS printer adds around an assignment used as a `{@const}` body.

  `{@const y = h = 0}` was printed `{@const y = (h = 0)}`. The tag's body is formatted by wrapping it as `const <body>;` and handing it to the JS printer, which parenthesizes an assignment in declarator-initializer position; the oracle formats the same body as an expression and neither adds the parentheses nor keeps the source's. Measured against `oxfmt(svelte: true)`, both engines print `const y = (a = b);` for the plain JS statement, so this is rsvelte asking the engine a different question rather than an engine divergence.

  Only a top-level assignment initializer is affected: `(h = 0) + 1`, `c ? (h = 0) : 2` and `() => (h = 0)` keep the parentheses they need.

## 0.7.2

### Patch Changes

- b860ab5: Re-express a `<style>` body's residual tabs as the configured indent unit. The block indent prepended to the CSS is built from that unit, so a tab-indented body the engine passed through verbatim — a rejected body, or a comment's own leading whitespace inside a declaration value — came out as spaces and tabs on one line, honouring neither `useTabs` setting.

## 0.7.1

## 0.7.0

### Patch Changes

- a4ec3f2: A broken interpolation's line breaks are chosen at the column it prints at, not at column 0.

  `Doc::RawExpr` carries a pre-formatted expression whose broken form was built before the
  printer knew the indent, so an interpolation nested six elements deep was broken at the same
  width as one at the top level and overflowed the print width. The variant now carries the
  expression source, and the printer rebuilds the broken lines against `width - indent`.

  The build-time shape is the same call with no budget, so it is unchanged and stays as the
  fallback for a rebuild that fails. `fits` still measures the build-time first line: it has no
  indent to rebuild against, and giving it one would move the measurement as well as the print.

## 0.6.0

### Minor Changes

- 024e8a5: `textDocument/completion` offers HTML close tags.

  `tag_prefix` excluded a `/` prefix outright, so every `</` position answered with nothing
  while the official server answers with `collectCloseTagSuggestions`
  (`vscode-html-languageservice`). Measured on 29 documents against both servers, rsvelte
  emitted zero `/`-prefixed items in all of them.

  The rule has two branches whose `filterText` disagree about the `>`, so each is the other's
  negative control: with a still-open ancestor whose line indent differs from the cursor's,
  the edit replaces the whole line prefix and filters on `<indent></tag`; otherwise it
  replaces from the `/` and filters on `/tag`. With no ancestor the whole tag table is
  offered and the filter carries the `>`.

  The ancestor's name comes from the document, not the tag data, because a component and a
  `svelte:` element are ancestors the provider does not list — only the no-ancestor fallback
  reads it. An ancestor stops being one when its end tag begins before the cursor, so a fully
  typed `</div>` falls back to the tag table rather than offering `/div`.

### Patch Changes

- 6329638: Vendor the CSS data the official language server reads, with the provenance discipline `html_data/` already uses: the version comes out of language-tools' `pnpm-lock.yaml`, the resolved package has to agree with it, and the SHA-256 of every file read is recorded in the generated header. `getEntryDescription` is ported rather than wrapped and compared to the function itself on all 3,194 entries in both markup kinds.
- 49465da: `textDocument/linkedEditingRange` returns a `wordPattern` that accepts its own ranges.

  The protocol says the pattern describes valid contents for the ranges returned beside it, and a
  client uses it to decide whether an in-flight edit still applies. rsvelte sent a pattern that
  rejected the contents of the very ranges it accompanied — a tag name containing a `.`, such as
  `Foo.Bar`, failed to match — so a client validating an edit against it would stop applying the
  linked rename partway.

  The pattern is now byte-identical to the official server's, which is VS Code's default word
  pattern. The ranges themselves already agreed with official on every measured case; only the
  pattern diverged.

## 0.5.5

### Patch Changes

- cb290b5: A `{:then}` / `{:catch}` binding keeps its own source-map segments, so a diagnostic, symbol or hover on it reports the identifier's real range instead of a zero-width position at the start of the generated chunk
- 4d24fac: Mark unused and deprecated code in diagnostics: fill `DiagnosticTag` from the TypeScript code, which tsgo's LSP omits.
- 846473c: Load `svelte/compiler` from a bundle's `default` export, so preprocessing works in a real project.
- 2152f06: Report an unknown `{#...}` block at its opening type with `expected_block_type`, matching the official compiler instead of deferring the error until a later closing tag. Return the language server's existing `null` result for invalid block-marker completions before attempting to map them through a projection that the malformed template cannot produce.

## 0.5.4

### Patch Changes

- 4840a2e: Stop queued analysis work when the language server shuts down.

## 0.5.3

### Patch Changes

- 81d9def: Ship the VS Code extension as one VSIX per platform.

  The extension bundled all five native language servers — ~110 MB uncompressed,
  including a 24 MB unsigned Windows PE — into a single universal VSIX, and every
  release since 0.5.0 failed the Marketplace's virus check on upload. Open VSX,
  which does not scan, carried 0.5.0/0.5.1/0.5.2 while the Marketplace stayed on
  0.4.1 and has since dropped the extension entirely.

  Each platform now gets its own VSIX carrying only its own server, alongside a
  binary-free universal package that the registries serve to every other platform,
  where the extension falls back to the bundled JS server as before. The publish
  guard also became per `(version, targetPlatform)`: one platform failing
  validation no longer reads as "published" for the rest, so the next run retries
  exactly what is missing.

## 0.5.2

### Patch Changes

- 955b2ac: Declare the language-server capabilities the server already answers. Completion now advertises the TypeScript and Emmet trigger characters (`.` above all, so member completion opens on its own instead of only on an explicit request) as well as `labelDetailsSupport`; `source.addMissingImports` joins the advertised code-action kinds it was already serving; pull diagnostics declare `interFileDependencies`, so editing an imported module refreshes the reports that depend on it; and `prepareProvider` is offered only to a client that advertised prepare support.

## 0.5.1

### Patch Changes

- a70f939: Keep serving after an undecodable LSP message. `lsp_server`'s stdio transport ends its reader thread on the first frame whose body will not deserialize, which closed the connection and took the server down — one malformed message from any client, extension or proxy in the chain and every open document lost its language features. The body of such a frame has already been consumed in full, so the stream is still framed correctly; the message is now dropped with a warning and the server keeps reading. A malformed _header_ stays fatal, because the reader no longer knows where the next frame begins.

## 0.5.0

### Minor Changes

- e69cf32: Ship the complete native editor distribution: upstream-compatible VS Code settings and commands, native VSIX binaries, standalone release archives, and setup for Neovim, Zed, Sublime Text, Helix, and Emacs.
- 8689058: Add native Svelte code lenses, extract-component refactoring, and lint code actions.
- 8ac8590: Add the full TypeScript language surface through a supervised tsgo LSP child and diskless Svelte shadow workspace.

### Patch Changes

- f679440: Add native HTML and CSS language assistance for Svelte documents.
- 3dbee3b: Apply trusted-workspace Svelte preprocessors through a supervised Node sidecar and compose their source maps with TypeScript shadow mappings.

## 0.4.1

### Patch Changes

- 9c22cc3: Build the Linux binaries against glibc 2.35 instead of whatever `ubuntu-latest` happens to provide. The release matrix ran on the hosted `ubuntu-latest` image, which moved to Ubuntu 24.04 (glibc 2.39), so every published `linux-x64-gnu` / `linux-arm64-gnu` artifact refused to start on Ubuntu 22.04 LTS and other distributions on an older glibc — `libc.so.6: version 'GLIBC_2.39' not found`. The Linux legs are now pinned to `ubuntu-22.04`, and each one asserts the requirement by reading the artifact it just built, so a future image bump fails the release instead of shipping.

## 0.4.0

### Minor Changes

- 3c25cd9: Ship the native Rust `rsvelte-language-server` as per-platform npm packages and prefer it from the `@rsvelte/language-server` launcher.

  The launcher's `rsvelte-language-server` bin now resolves the prebuilt binary from the optional `@rsvelte/language-server-<triple>` dependency and execs it, falling back to the bundled JS server when no platform package is installed. `RSVELTE_LANGUAGE_SERVER_BIN` overrides the binary path and `RSVELTE_LANGUAGE_SERVER_JS=1` forces the JS fallback.

## 0.3.0

### Minor Changes

- b0eb890: feat(language-server): apply the project's `rsvelte-lint.json` to editor diagnostics

  The linter runs as wasm and has no filesystem, so `json_api::lint` hardcoded the
  `recommended` preset: every rule ran at its default severity and no project
  config could change that. In a codebase that has never been linted with rsvelte
  — or one whose Svelte rules are already tuned in ESLint — that meant thousands
  of unsuppressable warnings, and turning `rsvelte.lint.enable` off was the only
  way out.

  The server now discovers `rsvelte-lint.json` / `.rsvelte-lintrc.json` by walking
  up from the document's directory (the same file, in the same order, that the
  `rsvelte-lint` CLI resolves) and passes it to the new
  `lint_with_config(source, filename, config)` wasm export, so the editor reports
  what CI does. Resolved configs are cached and dropped when a config file is
  saved. A config that can't be read or parsed is reported to the client's log and
  the recommended preset is used, so a typo never leaves the editor without
  diagnostics.

## 0.2.2

## 0.2.1

### Patch Changes

- fd4572e: `svelte/no-top-level-browser-globals` now uses real scope resolution (oxc_semantic) instead of name matching: local bindings that share a browser global's name — `let { open = $bindable() }` props, imports, `let top` — are no longer falsely flagged, in both `<script>` and template expressions. Fail-safe: unresolvable scripts fall back to the previous behaviour.

## 0.2.0

### Minor Changes

- 678b7b0: feat(language-server): add `@rsvelte/language-server` + `rsvelte-vscode` extension

  A new Language Server (`@rsvelte/language-server`) exposes rsvelte's formatter
  and linter over LSP, and a thin VS Code extension (`rsvelte-vscode`) bundles and
  launches it.

  - **Formatting** — `textDocument/formatting` shells out to the native
    `rsvelte-fmt` CLI (resolved from `node_modules/.bin`, or `rsvelte.rsvelteFmtPath`)
    and returns a whole-document edit; silently disabled when the binary is absent.
  - **Diagnostics** — push diagnostics from the `rsvelte_lint` engine compiled to
    wasm and vendored into the package (no extra install), on open / change
    (300 ms debounce) / save.

  Settings: `rsvelte.format.enable`, `rsvelte.lint.enable`, `rsvelte.rsvelteFmtPath`.
  Type-checking is out of scope for v1.
