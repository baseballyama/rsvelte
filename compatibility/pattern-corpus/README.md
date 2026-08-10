# pattern-corpus — checked-in compiler patterns

A corpus **source** like any other (registered in
[`scripts/compat-corpus/corpus-sources.json`](../../scripts/compat-corpus/corpus-sources.json)
as `pattern`, `markdown: false`), except that its files are written by hand
instead of pinned from an upstream repository. Everything under here is
dual-compiled (official vs rsvelte, client + server) by the same pipeline and
ratchets against the same `known-failures.{client,server}.json`, and — because
the manifest is shared — the same files also flow through the **fmt-parity** and
**svelte2tsx-parity** gates.

Why it exists: the pinned real-world repositories are a sample of what people
*happened* to write, so a shape nobody in the sample uses is invisible to the
corpus no matter how many repositories are added. Every divergence in the table
below was reported from a user's build, not found by the corpus. This directory
is where such a shape is written down once so it can never regress silently, and
where the axes *around* it are enumerated so the neighbouring cases are covered
too.

Ids are `pattern/issues/<file>` and `pattern/matrix/<axis>/<file>`; run just this
source with `node scripts/compat-corpus/compile.mjs --filter pattern/`.

## Conventions

1. **Self-contained.** Imports need not resolve — nothing is bundled or run —
   but the file must be a complete component on its own.
2. **The official compiler must accept it.** These are output-equality patterns,
   not error-parity cases.
3. **One behaviour per file, minimal.** Delete everything the shape does not
   need.
4. **Never write provenance in an HTML comment.** Removed comments are
   themselves a whitespace-sensitive compiler input (see #1975) — a `<!-- from
   issue N -->` line silently changes what the file tests. Provenance belongs in
   the table below and nowhere else. (The comments in
   `matrix/whitespace-comments/` are the *payload*, not provenance.)
5. **Commit formatted files.** They flow through the fmt gate, so keep them in
   the shape prettier-plugin-svelte would produce; an unformatted file is a
   needless new formatter case, not a compiler case.
6. **A repro lands with its fix, not before.** Adding a file for a still-open
   divergence would mean seeding a `known-failures` entry, and the seed then has
   to be tracked and burned down separately from the fix. Add the repro in the
   fix PR (or immediately after it merges) so it lands green.

## `issues/` — one minimal repro per fixed divergence

| File | Issue | What it pins |
|---|---|---|
| `1973-derived-ternary-default.svelte` | [#1973](https://github.com/baseballyama/rsvelte/issues/1973) | Destructured `$derived` with a **ternary** default — the property splitter must not mistake the ternary's `:` for the key separator |
| `1974-legacy-render-tag-memo.svelte` | [#1974](https://github.com/baseballyama/rsvelte/issues/1974) | A memoized `{@render}` argument in **legacy** mode must use `$.derived_safe_equal`, not `$.derived` |
| `1975-adjacent-comment-whitespace.svelte` | [#1975](https://github.com/baseballyama/rsvelte/issues/1975) | Whitespace run around **two adjacent removed comments** inside a nested element (static-template builder path) |
| `1980-definite-assignment.svelte` | [#1980](https://github.com/baseballyama/rsvelte/issues/1980) | TS definite-assignment assertion `let x!: T` is stripped, and the legacy `mutable_source` wrapper survives |
| `1981-member-component-bind.svelte` | [#1981](https://github.com/baseballyama/rsvelte/issues/1981) | `bind:` on a **member-expression component** (`<X.Y bind:open />`) — dev-only ownership-validator placement |
| `1982-attach-in-snippet.svelte` | [#1982](https://github.com/baseballyama/rsvelte/issues/1982) | A `{#snippet}` whose `{@attach}` closes over component scope must not be hoisted to module scope |
| `1992-class-optional-override.svelte` | [#1992](https://github.com/baseballyama/rsvelte/issues/1992) | TS `?` optional markers and the `override` modifier on class members are erased |
| `1994-svg-text-whitespace.svelte` | [#1994](https://github.com/baseballyama/rsvelte/issues/1994) | Whitespace between children of an SVG `<text>` survives the SVG whitespace rule |
| `2001-derived-computed-key.svelte` | [#2001](https://github.com/baseballyama/rsvelte/issues/2001) | Computed / quoted keys in a destructured `$derived` need bracket member access |
| `2002-state-destructure-default.svelte` | [#2002](https://github.com/baseballyama/rsvelte/issues/2002) | Default values in a destructured `$state(...)` become `$.fallback(...)` |
| `2004-derived-array-rest-props.svelte` | [#2004](https://github.com/baseballyama/rsvelte/issues/2004) | Array-destructured `$derived(props)` passes the **rest-prop binding** to `$.to_array`, not `$$props` |
| `2005-derived-call-default.svelte` | [#2005](https://github.com/baseballyama/rsvelte/issues/2005) | A **call-expression** destructuring default is unthunked — `$.fallback(…, f, true)`, not `() => f()` |
| `2006-form-feed-text.svelte` | [#2006](https://github.com/baseballyama/rsvelte/issues/2006) | A form-feed (`&#12;`) text node is **content**, not whitespace — `regex_not_whitespace = /[^ \t\r\n]/` excludes `\f` |
| `2007-derived-default-comma.svelte` | [#2007](https://github.com/baseballyama/rsvelte/issues/2007) | A comma **inside a string default** must not split the destructuring property |
| `2012-state-destructure-rest.svelte` | [#2012](https://github.com/baseballyama/rsvelte/issues/2012) | Object rest in a destructured `$state(...)` becomes `$.exclude_from_object` |
| `2013-state-destructure-quoted-key.svelte` | [#2013](https://github.com/baseballyama/rsvelte/issues/2013) | Quoted key in a destructured `$state(...)` needs bracket member access |
| `2014-derived-array-rest-arity.svelte` | [#2014](https://github.com/baseballyama/rsvelte/issues/2014) | An array pattern ending in a rest element passes **no length** to `$.to_array` |
| `2028-console-wrap-evaluate.svelte` | [#2028](https://github.com/baseballyama/rsvelte/issues/2028) | The dev `$.log_if_contains_state(...)` wrap follows `scope.evaluate(arg).has_unknown` — a `$state` object wraps, while a template literal, a `+`/`===` operand, `$effect.tracking()` and a `$state(0)` read do not, in the script **and** in template positions |
| `2028-console-wrap-legacy-reactive.svelte` | [#2028](https://github.com/baseballyama/rsvelte/issues/2028) | The same decision inside a legacy `$:` body, which is folded into `$.legacy_pre_effect(...)` after the per-statement pass has run |
| `2060-const-shadow-textcontent.svelte` | [#2060](https://github.com/baseballyama/rsvelte/issues/2060) | A `{@const}` **shadowing** a component-scope binding must resolve to the `{@const}`, so the read stays a static `textContent` assignment |
| `2138-legacy-assignment-destructure-rest.svelte` | [#2138](https://github.com/baseballyama/rsvelte/issues/2138) | A legacy destructuring **assignment** with quoted / computed keys and a rest — bracket member reads, an `$.exclude_from_object` key list built like `b.literal(...)`, and no `$$value` IIFE for an identifier right-hand side |
| `2139-legacy-nested-destructure.svelte` | [#2139](https://github.com/baseballyama/rsvelte/issues/2139) | A **nested** legacy destructuring declaration — `extract_paths` recurses, so a nested state leaf still gets its `$.mutable_source` (and dev `$.tag`) and every nested array pattern gets its own `$$array` helper |
| `2141-snippet-shadow-is-function.svelte` | [#2141](https://github.com/baseballyama/rsvelte/issues/2141) | A block-local `{#snippet}` shadowing a same-named outer `function` still reads as reactive (`is_function()` must resolve to the snippet, not the outer function) |
| `2162-single-target-destructure-paren.svelte` | [#2162](https://github.com/baseballyama/rsvelte/issues/2162) | A single-target destructuring **assignment** (`({ a } = obj)`, no rest) keeps its wrapping parens — upstream always lowers through a `SequenceExpression`, even with one element, and esrap always self-parenthesizes one |
| `2177-each-item-destructure-cache.svelte` | [#2177](https://github.com/baseballyama/rsvelte/issues/2177) | A legacy destructuring **assignment** inside a template expression (event handler) whose right-hand side is an each-block item — `should_cache` must be decided from the *visited* RHS (`item` → `$.get(item)`), so it caches into a `$$value` IIFE like upstream instead of staying an uncached sequence / re-reading the item |
| `2186-nested-assignment-destructure.svelte` | [#2186](https://github.com/baseballyama/rsvelte/issues/2186) | A **nested** destructuring **assignment** — `extract_paths` recurses, so every leaf is one flat `$.set(b, $$value.a.b)` in a single IIFE (never a nested `$$value` IIFE), and every array pattern at any depth contributes an `$$array` helper emitted before the assignments |
| `2187-server-array-counter.svelte` | [#2187](https://github.com/baseballyama/rsvelte/issues/2187) / [#2196](https://github.com/baseballyama/rsvelte/issues/2196) | Server: two SEPARATE array-pattern `$state(...)` declarations in one script must deconflict their `$.to_array` temp — `$$array`, `$$array_1` — instead of both emitting `$$array` (the counter must be component-wide, not reset per declaration). Client: a pattern that mixes a reassigned and a never-reassigned name still instruments the reassigned one — `a++` → `$.update(a)` — since the non-reactive shadow decision is per name, not per pattern |
| `2193-member-target-destructure-nonreactive.svelte` | [#2193](https://github.com/baseballyama/rsvelte/issues/2193) | A destructuring **assignment** with a **member-expression** target (`({ b: o.p } = src)`) whose object (`o`) is a `$state(...)` that itself resolves to a non-signal `$.proxy` — `has_reactive_target` must consult the filtered `reactive_state_set`, not the raw `state_set`, or the assignment gets needlessly lowered through the reactive path instead of staying verbatim |
| `2590-export-let-arrow-line-break.svelte` | [#2590](https://github.com/baseballyama/rsvelte/pull/2590) | A legacy `export let` default whose arrow **body starts on the next line** — the instance-script line accumulator must treat a trailing `=>` as a continuation, or the declaration closes early and emits `$.prop(..., (n) =>)`, which is not JavaScript. The `"a =>"` and following declaration pin the other side: a trailing `=>` **inside a string** must not swallow the next statement |
| `2604-regex-literal-in-instance-script.svelte` | [#2604](https://github.com/baseballyama/rsvelte/pull/2604) | A regex literal whose closing slash follows an escaped one — `/^https?:\/\//` — in a legacy `$:` statement. The client text scanners must step over the literal, or the adjacent `//` reads as a line comment: the regex is emitted unterminated, the prop read after it is left uncalled, and a line ending in `… ') ||` stops looking like a continuation. The `total / 2` line pins the other side: a division must stay a division |
| `2605-trailing-binary-operator.svelte` | [#2605](https://github.com/baseballyama/rsvelte/pull/2605) | A statement whose line ends with a binary operator and whose right operand is on the next line — `let flag = … ||` (read by the `$.mutable_source` initializer scanner) and `$: kind = … ===` (read by the instance-script line accumulator). Both closed the statement early and emitted `$.mutable_source(… ||)` / `$.set(kind, … ===)`, which is not JavaScript. The `width` / `height` declarations pin the other side: a statement that does not end in an operator still ends |
| `2194-nested-prop-destructure-assignment.svelte` | [#2194](https://github.com/baseballyama/rsvelte/issues/2194) | A **nested** destructuring **assignment** (`({ a: { value } } = src)`) inside a runes, **props-only**, non-dev script — the `ast_state_transform` source-range path (used when the script has no other reactive declarations to force the text-based transform) previously had no case for nested-destructure prop assignments and left them untransformed |
| `2304-element-block-template-effect-deps.svelte` | [#2304](https://github.com/baseballyama/rsvelte/issues/2304) | An element whose children are wrapped in a `{ … }` block (because it contains a `{#snippet}` or a `{const}`) must pass the memoizer's `$0`/`$1` parameters **and** its deps array to the block's `$.template_effect` — the body already references them, so dropping either throws a `ReferenceError`; the `{const}` case additionally scopes a fresh memoizer to the block |
| `2592-destructure-assignment-line-break.svelte` | [#2592](https://github.com/baseballyama/rsvelte/pull/2592) | A destructuring **assignment** with no terminating semicolon — the RHS ends at the **line break**, or the scan runs on through the statements that follow and emits `(($$value) => {…})(rhs` unclosed, which is not JavaScript. The same line break makes it an expression *statement*, so the IIFE must not `return` its value; the `out = ([selected] = result)` declaration pins the other side, where the value **is** used and the `return` must stay. Kept deliberately unformatted: the formatted form (`[selected] = result;`) does not reproduce, so the fmt oracle's rewrite is the point, not a lapse |
| `2596-ts-required-after-optional.svelte` | [#2596](https://github.com/baseballyama/rsvelte/pull/2596) | A TypeScript rule OXC enforces while parsing a **complete** AST and the official parser does not — a required parameter after an optional one. Type stripping must not bail on it: unfixed, the client emits `(a: string, …)` and `$.prop($$props, 'n: number', …)`, and the **server drops the entire instance script** while still emitting parseable output — a silent-wrong-output failure no parse gate can see, which is why it is pinned here. The fmt oracle cannot format this file (oxfmt is built on the same parser), so `fmt.mjs` skips it as not-formattable rather than comparing it |
| `2598-escaped-backslash-statement-boundary.svelte` | [#2598](https://github.com/baseballyama/rsvelte/pull/2598) | A string literal whose last escape is `\\`, followed by an `export` declaration — the client instance-script scanner asked "is the byte before this quote a backslash" instead of "is this quote escaped", so the string never closed, the statement never completed, and the `export` was accumulated into it and emitted verbatim inside the component function, which is not JavaScript |
| `2598-escaped-backslash-reactive-statement.svelte` | [#2598](https://github.com/baseballyama/rsvelte/pull/2598) | The same scanner defect with a `$:` statement after the string instead of an `export`: the label survives into the component body as a labelled statement, which **parses**. No parse-level gate can see this half — only output equality can, which is why it is pinned here separately |
| `2599-reactive-else-next-line.svelte` | [#2599](https://github.com/baseballyama/rsvelte/pull/2599) | A `$:` whose `if` header and `else` clause are on **separate lines** — the client instance-script line accumulator decides where a statement ends by looking at what the next line starts with, and its continuation set (`.`, `?`, `:`, `&&`, `||`, `??`) had no entry for the `else` keyword, so the statement was closed after the `if` and the `else` fell outside the reactive body |
| `2607-escaped-backslash-constant-fold.svelte` | [#2607](https://github.com/baseballyama/rsvelte/issues/2607) | A known-const `'\\'` folded into an element's `textContent`. The fold read the initializer's **source text** and left every non-codepoint escape undecoded, so the emitter escaped it a second time and the component rendered two backslashes. Output is valid JavaScript computing the wrong string — the parse gate is blind to it, and it diverged on client, server **and** client-dev |
| `2637-trailing-binary-operator-matrix.svelte` | [#2637](https://github.com/baseballyama/rsvelte/issues/2637) | The rest of the operator matrix behind `2605-trailing-binary-operator.svelte`: 15 of the 23 binary operators still cut the statement after #2605, including `*`, `<` (a prefix of the already-handled `<=`), `<<`, the word operators `in` / `instanceof`, and `,`. `-` and `/` remain excluded on purpose — `a--` ends a statement and `/` also closes a block comment — so the file does not use them |
| `2705-block-comment-binary-rhs.svelte` | [#2705](https://github.com/baseballyama/rsvelte/issues/2705) | A block comment containing scanner delimiters between a binary operator and a next-line RHS, with a same-line control |
| `2652-string-line-continuation.svelte` | [#2652](https://github.com/baseballyama/rsvelte/issues/2652) | A `'…'` carried across a line break by a backslash. The carried line is string **content**, so the client re-indenter's tab landed inside the value — valid JavaScript computing `a\tb` instead of `ab`, which no parse gate can see. On the server the same literal never entered the constants map, because the joined logical line still held the raw newline and was re-split |
| `2661-concat-fold-source-text.svelte` | [#2661](https://github.com/baseballyama/rsvelte/issues/2661) | `'ab' + 'cd'` — the server's fold asked `starts_with('\'') && ends_with('\'')`, which a concatenation of two literals also answers yes to, and rendered the text between the outer quotes verbatim: `ab' + 'cd` |
| `2523-dynamic-element-a11y.svelte` | [#2523](https://github.com/baseballyama/rsvelte/issues/2523) | The a11y rules that upstream still reaches when the tag is **not** statically known — `a11y_no_static_element_interactions`, `a11y_accesskey`, `a11y_autofocus`, `a11y_positive_tabindex`, the `aria-*` spelling / type checks, the `role` checks and `a11y_mouse_events_have_key_events` on a `<svelte:element>`. `check_element` had no call site in `svelte_element.rs`, so the whole pass was absent |
| `2523-dynamic-element-a11y-skipped.svelte` | [#2523](https://github.com/baseballyama/rsvelte/issues/2523) | The other side of the same fix: the rules upstream guards on a statically known tag (`scope`, `aria-activedescendant`, click-without-key, non-interactive `tabindex`, required `role` props) must stay **silent** on a dynamic tag, a dynamic ancestor must suppress `a11y_autofocus` / `a11y_figcaption_parent`, and an **empty** `<svelte:element>` child must not count as content. Without this half, forwarding to the checker with `is_dynamic_element = false` scores green |
| `2573-ctor-private-derived-write.svelte.js` | [#2573](https://github.com/baseballyama/rsvelte/issues/2573) | A private `$derived` field compound-assigned at a **constructor root**. On the client the pre-pass built its qualified lists from `$state` only, so the field fell through to a text scanner that classified the operator by the byte after `this.#d` and emitted `$.get(this.#d) >>>= 5`; on the server the same question is asked of `this.#d()` and produced `this.#d() >>>= 5`. Neither is JavaScript. `??=` pins the third row of the table — the operand must be `$.get(this.#d)`, never `.v` off a call result, and a `$derived` field never carries the `, true` proxy flag |
| `2467-nonthis-private-state-write.svelte.js` | [#2467](https://github.com/baseballyama/rsvelte/issues/2467) | A private `$state` field written through a **non-`this` receiver** (`const inst = this`) in a constructor: the logical compound (`??=`, which was in neither allowlist and produced the unparseable `$.get(inst.#n) ??= s`), the `, true` proxy flag on a plain object assignment (silent — that output always parsed), and the constructor-root read form. The first `.svelte.js` entries in this directory; both compilers see a module, not a component |
| `2653-literal-raw-escape-spelling.svelte` | [#2653](https://github.com/baseballyama/rsvelte/issues/2653) | A single-quoted string literal in a template expression. esrap writes a literal's `raw`, so official's output carries the source spelling; rsvelte kept `raw` only when it started with `"` and re-printed everything else from the cooked value, turning `'a\tb'` into a real tab and `'\x41'` into `'A'`. The **value is right** and the output parses — a source-text divergence, invisible to the parse gate. Deliberately unformatted: the fmt oracle rewrites the quotes to `"`, which is the one shape that already worked |
| `2609-each-collection-parens.svelte` | [#2609](https://github.com/baseballyama/rsvelte/issues/2609) | A legacy `{#each}` whose collection binds looser than member access, with the item `bind:`-bound so it is **reassigned** and therefore read back as `collection[$$index]`. The collection was spliced into that member as opaque text, which carries no precedence, so `servers ?? []` printed as `$.get(servers) ?? [][$$index]` — a different expression, and on the left of `=` not JavaScript at all. `box?.list` pins the chain half (a member built on an optional chain must close it, or it joins the chain and stops being an assignment target); `ready` pins the other polarity, where no parentheses may appear |
| `2600-decl-tag-escaped-backslash-comma.svelte` | [#2600](https://github.com/baseballyama/rsvelte/issues/2600) | `{const a = "\\", b = 2}` — the declaration-tag comma splitter is one of 37 scanners that asked "is the byte before this quote a backslash". The string never closed, so the second declarator was swallowed into the first initializer and `b` was never declared; the parser lost it silently, with no error |
| `2600-let-tag-escaped-backslash-comma.svelte` | [#2600](https://github.com/baseballyama/rsvelte/issues/2600) | The same splitter reached through `{let …}` inside a block rather than a top-level `{const …}`, which is a different call path (`body_has_top_level_comma` in the client visitor, not only the parser's `split_top_level_commas`) |
| `2600-decl-tag-escaped-backslash-destructure.svelte` | [#2600](https://github.com/baseballyama/rsvelte/issues/2600) | `{const { a = "\\" } = obj}` — the top-level-`=` scan ran past the end, so rsvelte **rejected valid Svelte** with `declaration_tag_invalid_type`. The only entry in this batch whose symptom is an error rather than a text divergence, so the error ratchets are the gate that sees it |
| `2600-const-tag-escaped-backslash-destructure.svelte` | [#2600](https://github.com/baseballyama/rsvelte/issues/2600) | The `{@const}` arm of the same scan. It diverges on **server only** — the client arm recovers through a different fallback, which is why the two tags are pinned separately rather than assumed equivalent |
| `2600-destructure-assignment-escaped-backslash-rhs.svelte` | [#2600](https://github.com/baseballyama/rsvelte/issues/2600) | `[a, b] = ["\\", 2]` with `$state` targets — the destructure RHS-end scan swallowed the closing `]` and the `;`, so the lowered IIFE received an argument text that carried the statement terminator |
| `2600-dev-prop-mutation-escaped-backslash.svelte` | [#2600](https://github.com/baseballyama/rsvelte/issues/2600) | A prop member assignment whose value ends in `\\`, followed by another function. The dev ownership-validator wrap scans forward for the end of the assignment expression; stuck inside the string it spliced the **rest of the script** into the validator call. Client-dev only |
| `2600-legacy-import-mutation-escaped-backslash.svelte` | [#2600](https://github.com/baseballyama/rsvelte/issues/2600) | A mutated import in legacy mode. `find_matching_close_paren` never found the `)` of the first `$.mutate(obj, …)`, and because the rewrite loop `break`s rather than advancing, **every later mutation of the same import** was skipped too — the blast radius is larger than the statement that contains the string |
| `2600-dynamic-element-this-escaped-backslash.svelte` | [#2600](https://github.com/baseballyama/rsvelte/issues/2600) | `<svelte:element this={sep === "\\" ? …}>` — `this` is not in `attributes`, so the opening-tag scan runs over it. The compiler output is identical either way; only the **svelte2tsx** overlay diverges, dropping the child expression (`;;` instead of `n;`) and with it every diagnostic and definition lookup inside that element |
| `2525-svelte-ignore-comment-code-scope.svelte` | [#2525](https://github.com/baseballyama/rsvelte/issues/2525) | The warnings *about* `svelte-ignore` comments (`unknown_code`, `legacy_code`) are themselves ignorable: upstream raises them through the same `w()` that consults the ignore stack, so an enclosing `<!-- svelte-ignore unknown_code -->` silences the nested comment's own diagnostic, while rsvelte pushed them straight onto the warning list. The second `<div>` carries the same shape with **no** enclosing ignore and pins the other direction — exactly one `unknown_code` must survive, on all three targets. Only the warning ratchets can see this file; its generated JS is identical either way |
| `2608-destructured-param-binding.svelte` | [#2608](https://github.com/baseballyama/rsvelte/issues/2608) | A prop name occupying a **binding slot of a destructuring parameter** inside a legacy `$:` statement. The client prop-read rewriter asked only "is this a shorthand object-literal property?", so `({ id }) =>` became `({ id: id() }) =>` and `([id, n]) =>` became `([id(), n]) =>` — binding patterns no parser accepts. The `shifted` line pins the other side: the same name one bracket later, in the arrow's **body**, is a read and keeps its `id()`. The reads that sit *inside* the parameter list (a default value, a computed key) belong to the `param-pattern` matrix family instead — they trip an unrelated dependency-list divergence that this file must not import |
| `2535-explicit-nesting-non-ancestor.svelte` | [#2535](https://github.com/baseballyama/rsvelte/issues/2535) | `.a { & .b { … } }` where `.a` exists but is **not an ancestor** of `.b`. #2534 taught the implicit-`&` path to walk the real ancestor chain and deliberately bailed on an explicit `&`, which upstream resolves in place against `parent.prelude` instead of prepending |
| `2535-is-argument-child-combinator.svelte` | [#2535](https://github.com/baseballyama/rsvelte/issues/2535) | `:is(.a) > .b` with `.a` a sibling rather than the parent. The `:is()` argument has to constrain the compound the structural walker matches; without that the whole selector stayed alive and the warning landed on the inner branch instead of the rule |
| `2535-subject-nesting-under-deep-parent.svelte` | [#2535](https://github.com/baseballyama/rsvelte/issues/2535) | `a { span { a:hover & { … } } }` — a **subject** `&` under a two-compound parent. The `&` constrains the subject itself, so one `<a>` satisfies both the parent's ancestor link and `a:hover`; splicing the parent into the chain demands two nested `<a>` and prunes a live rule. Three real svelte.dev components have this shape |
| `2535-trailing-global-parent-nesting.svelte` | [#2535](https://github.com/baseballyama/rsvelte/issues/2535) | A nested rule whose **parent** prelude ends in `:global(...)`. The parent links to the child through `get_relative_selectors`, which truncates the trailing global first, so `.a :global(.g) { .b { … } }` requires `.b` under `.a` |
| `2535-bare-has-subject.svelte` | [#2535](https://github.com/baseballyama/rsvelte/issues/2535) | A subject-less `:has(.a)` is `*:has(.a)`: the argument must match inside **some element's subtree**, not merely exist in the component. The `:root` / `:global(...)` enclosing case is the opposite direction (upstream's `include_self`) and is covered by the `root` and `has` CSS fixtures |
| `2535-where-all-branches-unused.svelte` | [#2535](https://github.com/baseballyama/rsvelte/issues/2535) | `:where(.a, .miss)` with no branch matching. The all-branches-unused collapse was spelled for `:is` and `:has` but not `:where`, so rsvelte reported one warning per branch where official reports one for the rule |
| `2535-dynamic-element-attribute-selector.svelte` | [#2535](https://github.com/baseballyama/rsvelte/issues/2535) | `<svelte:element>` deopted **attribute** selectors component-wide. An unknown tag name does not add attributes — upstream matches a `SvelteElement` against its declared attribute list like any other element, and only the *type* selector is exempt |
| `2662-template-literal-fold.svelte` | [#2662](https://github.com/baseballyama/rsvelte/issues/2662) | A template literal whose interpolations are all constants. Upstream's `scope.evaluate` walks the quasis and folds; rsvelte accepted a backtick literal only when it contained no `${`, so the read stayed a live reference on client, server **and** client-dev. The value is right at runtime — a divergence only output equality can see |
| `2665-member-on-literal.svelte` | [#2665](https://github.com/baseballyama/rsvelte/issues/2665) | Both sides of upstream's `is_pure`, which decides a member read's reactivity by its **leftmost object**: `[1, 2].length` and `(…).name` are impure, so official emits the placeholder space a dynamic text node needs, while `"ab".length` is pure and stays a static `textContent`. rsvelte treated all three as static and emitted `<p></p>` for the first two — the text node the runtime expects to fill is not there |

## `matrix/` — the axes around those repros

A single repro pins one point; the matrices walk the axes it sits on, because
that is where the next report comes from. Each directory is one axis family.

### `ts-declarations/` — TS declaration forms (around #1980 / #1992)

`let` / `var` / multiple declarators / `export let` × runes vs legacy ×
`bind:this` / `bind:value` / unused, plus module script, class modifiers,
`satisfies` / `as const`, non-null member access, and the `generics` attribute.

| File | Point on the axis |
|---|---|
| `definite-assignment-bind-value-legacy.svelte` | `let x!: T` bound with `bind:value` in a legacy component |
| `definite-assignment-bind-this-runes.svelte` | same declaration in a **runes** component |
| `definite-assignment-multi-declarator.svelte` | `!` on some declarators of a multi-declarator `let` |
| `definite-assignment-unused.svelte` | `let` / `var` definite assertions never referenced |
| `definite-assignment-module-script.svelte` | `!` declaration in `<script module lang="ts">` |
| `type-only-declarations.svelte` | `interface` / `type` / annotated `const` / `as` |
| `satisfies-and-as-const.svelte` | `satisfies` and `as const` erasure |
| `class-modifiers.svelte` | `private` / `protected` / `readonly` class members |
| `non-null-member-access.svelte` | `x!.y()` in a handler (expression-level `!`) |
| `generics-attribute.svelte` | `<script lang="ts" generics="…">` with typed `$props()` |
| `export-let-typed.svelte` | legacy typed / defaulted / optional `export let` |

### `snippet-hoist/` — snippet hoistability (around #1982)

Position (root / `{#if}` / `<svelte:boundary>`) × body form (`{@attach}`, `use:`,
`transition:`, `animate:`, `class:`, `style:`, event handler, spread, `{@const}`)
× what the body closes over (module scope / component function / `$state` /
props / nothing).

| File | Point on the axis |
|---|---|
| `attach-module-scope.svelte` | `{@attach}` calling a **module-script** function — hoistable |
| `attach-component-scope-in-if.svelte` | `{@attach}` calling a component function, snippet declared inside `{#if}` |
| `attach-inline-state.svelte` | inline `{@attach}` arrow reading `$state` directly |
| `attach-in-boundary-snippet.svelte` | `{@attach}` inside a `<svelte:boundary>` `failed` snippet |
| `attach-from-const.svelte` | `{@attach}` whose value comes from a `{@const}` over a snippet parameter |
| `use-directive-component-scope.svelte` | `use:` action declared in the component |
| `use-directive-module-scope.svelte` | `use:` action declared in the module script — hoistable |
| `transition-component-scope.svelte` | `transition:` with a component-scope parameter |
| `animate-in-snippet.svelte` | `animate:` inside a keyed `{#each}` inside the snippet |
| `event-handler-component-scope.svelte` | plain event handler closing over the component |
| `class-directive-state.svelte` | `class:` shorthand reading `$state` |
| `style-directive-const.svelte` | `style:` fed by `{@const}`, closing over nothing — hoistable |
| `spread-props-snippet.svelte` | `{...rest}` spread from `$props()` |

### `member-component/` — member-expression components (around #1981)

`<X.Y>` / `<X.Y.Z>` / `<x.y>` × `bind:` shorthand / `bind:this` / several
bindings / `$bindable` prop / snippet child / spread.

| File | Point on the axis |
|---|---|
| `bind-shorthand.svelte` | `<X.Y bind:open />` over local `$state` |
| `bind-nested-namespace.svelte` | two-level namespace `<X.Y.Z bind:value />` |
| `bind-lowercase-namespace.svelte` | lowercase base `<x.y bind:pressed />` |
| `bind-this.svelte` | `bind:this` on a member-expression component |
| `bind-multiple.svelte` | two `bind:` directives on one member component |
| `bind-bindable-prop.svelte` | the bound value is the component's own `$bindable` prop |
| `bind-with-snippet-child.svelte` | `bind:` plus an explicit `children` snippet |
| `bind-with-spread.svelte` | `bind:` combined with a props spread |

### `legacy-memo/` — legacy-mode memoization (around #1974)

`{@render}` argument shapes in a non-runes component, plus one non-`{@render}`
consumer of the same memoizer.

| File | Point on the axis |
|---|---|
| `render-arg-identifier.svelte` | bare identifier argument |
| `render-arg-call.svelte` | call-expression argument (the #1974 shape) |
| `render-arg-member.svelte` | member-expression argument |
| `render-arg-object.svelte` | object-literal argument |
| `render-arg-multiple.svelte` | two arguments, one a template literal |
| `component-prop-memo.svelte` | memoized **component prop** in the same legacy mode |

### `destructure-default-thunk/` — destructuring-default thunks (around #2005)

The default's expression shape decides whether the lazy `$.fallback` thunk is
unthunked (`() => f()` → `f`), left as an arrow, or parenthesised. Two files walk
the destructuring forms that share the fallback builder; the rest walk the
expression shapes, which behave the same in every form.

| File | Point on the axis |
|---|---|
| `state-call-default.svelte` | call default in a destructured `$state(...)` |
| `array-call-default.svelte` | call default on an **array** pattern element of a `$derived` |
| `nested-call-default.svelte` | call default inside a **nested** object pattern of a `$derived` |
| `member-call-default.svelte` | `obj.m()` default — a member callee is **not** unthunked |
| `call-with-arguments-default.svelte` | `f(1)` — arguments block the unthunk |
| `object-literal-default.svelte` | object-literal default — the arrow body needs parens |
| `new-expression-default.svelte` | `new Thing()` — a `new` expression is not a call |

### `whitespace-comments/` — whitespace around removed comments (around #1975)

Two / three adjacent comments × nesting depth 0 / 1 / 2 × surrounding context
(element, `{#if}`, `<svelte:head>`, `{#snippet}`, inline text).

| File | Point on the axis |
|---|---|
| `two-adjacent-nested.svelte` | two comments, parent nested one level (the #1975 shape) |
| `three-adjacent-nested.svelte` | three adjacent comments |
| `two-adjacent-root.svelte` | same run at the fragment root |
| `adjacent-deeply-nested.svelte` | parent nested two levels |
| `comment-inside-if-block.svelte` | run inside an `{#if}` block |
| `comment-between-inline-text.svelte` | run between text nodes inside a `<p>` |
| `comment-in-head.svelte` | run inside `<svelte:head>` |
| `comment-in-snippet.svelte` | run inside a `{#snippet}` |

### `form-feed/` — form feed as text content (around #2006)

Position of the `&#12;` run (sole child / leading / trailing / between siblings)
× container (element, fragment root, `{#if}`, `{#each}`, SVG `<text>`) × neighbour
(element, expression tag). Written as the character reference so the file is a
formatter fixed point while the parsed `data` is still a bare `\f`.

| File | Point on the axis |
|---|---|
| `only-child.svelte` | the element's only child is a form-feed text node |
| `leading-in-element.svelte` | form feed opens the first text node (trim-start must keep it) |
| `trailing-in-element.svelte` | form feed closes the last text node (trim-end must keep it) |
| `root-siblings.svelte` | form-feed run between two root-level elements, newlines around it |
| `around-expression-tag.svelte` | form feed between two `{expression}` tags |
| `nested-deep.svelte` | form feed two elements deep |
| `in-if-block.svelte` | form-feed run inside an `{#if}` block |
| `in-each-block.svelte` | form-feed run inside an `{#each}` block |
| `svg-text.svelte` | form feed inside an SVG `<text>` element |

### `const-shadow/` — `{@const}` shadowing an outer binding (around #2060)

Declaring block (`{#if}` / `{:else}` / `{#each}` / `{#key}` / `{#await}` /
`{#snippet}` / `<svelte:boundary>`) × declaration form (identifier /
destructured) × shadowed binding kind (`$state` / prop). The shadowed name is
read as an element's only child, so the resolution decides between a static
`textContent` assignment and a `$.template_effect`.

| File | Point on the axis |
|---|---|
| `if-both-branches.svelte` | a `{@const}` in each of `{#if}` and `{:else}` |
| `each-body.svelte` | `{@const}` in an `{#each}` body, over the loop variable |
| `key-block.svelte` | `{@const}` inside `{#key}`, keyed on the shadowed binding |
| `await-then-body.svelte` | `{@const}` in an `{#await … then}` body |
| `snippet-body.svelte` | `{@const}` inside a `{#snippet}` |
| `boundary-children.svelte` | `{@const}` in `<svelte:boundary>` children |
| `destructured-const.svelte` | destructuring `{@const { value } = …}` |
| `shadows-prop.svelte` | the shadowed binding is a **prop** (the read must not become `$$props.x`) |

### `string-line-continuation/` — one continuation, five paths (around #2652)

A `\` before a line break inside `'…'` / `"…"` contributes nothing to the
string's value, so every file here renders what it would render without the
break. What differs is which re-indenter or scanner the carried line reaches:
the runes instance script, a pre-indented continuation (where the indent is
*also* content), the double-quoted form, a legacy `$:` **block body** — a third
re-indenter that only this shape reaches — and two continuations in one
statement, which needs the state to survive a line that closes one string and
opens the next.

`template-literal-newline.svelte` is the **negative control**: a backtick really
does carry its newline as content, and had to keep behaving as it already did.

Every file here contains a quote that really *is* a string, and that shared
property is a blind spot rather than an accident. Teaching the scanner to track
`'…'` frames made it push a carried-string frame for **any** quote it could not
close on the line, so the `isn't` in a doc comment opened a string that never
closed — which broke `svelte.dev`'s `repl/…/Viewer.svelte` and nothing here.

Six candidate repros for that class were written and **all six were dropped**,
because each one passed on the broken binary: two hand-written `.svelte` files,
two reductions of the failing component, and two shapes as a compiler-level
test. Removing the apostrophes from `Viewer.svelte` itself does flip the broken
binary back to matching, so the cause is certain; the trigger just needs more of
that component than a reduction kept. The coverage therefore lives in
`quote_frame_tests` in `3_transform/client/formatting.rs`, which asserts the
scanner's state directly and does fail on the broken scanner.

The quote character is deliberately **not** an axis here. The fmt oracle rewrites
every literal to double quotes, so a single-quoted file stops being one the
moment it is committed formatted — a `double-quoted.svelte` written alongside
`instance-declaration.svelte` came out byte-identical to it. That axis lives in
`crates/rsvelte_core/tests/string_line_continuation_2652.rs`, where no formatter
runs.

### `string-escape-spelling/` — the same escapes, one step later (around #2653)

`string-escape-fold/` covers escapes on the **fold** path, where the compiler
computes a *value* and re-escapes it once. This one covers the escapes that
never get folded: a literal that reaches the template-expression converter and
is printed back out. esrap writes a literal's `raw`, so official's output
carries the source's spelling; a printer that re-emits the cooked value agrees
about the string and disagrees about its text — output that parses and runs
correctly, which is why it sat under the parse gate.

`newline-escape.svelte` and `backslash-escape.svelte` are the **negative
controls**: `\n` and `\\` are in the printer's own escape set, so they matched
before the fix and must keep matching.

**Kept deliberately unformatted (single-quoted).** The fmt oracle rewrites every
literal to double quotes, and a double-quoted literal was the one shape that
*already* kept its `raw` — so the formatted form of every file here reproduces
nothing. This class cannot be pinned by a file that is a formatter fixed point;
the formatted shape is not a stricter version of the input, it is a different
input. The generated `literal-escape` matrix family is the primary gate for the
class (it constructs its own sources and never passes through the formatter);
these files are the committed repro beside it.

### `string-escape-fold/` — escape kind × fold site (around #2607)

Escape kind (`\\`, the control escapes, quote escapes, the codepoint escapes,
the backtick/`${` escapes of a template literal, and `\<anything else>`) ×
where the folded value lands (a `textContent` assignment, a template-literal
quasi, an attribute value, the server's pushed template) × which script
declares it. The fold produces a **value**, so every kind has to be cooked
here and re-escaped once by whoever emits it; leaving one undecoded escapes it
twice, and the result parses.

`\<codepoint>` was already decoded before #2607, so `codepoint-escapes.svelte`
discriminates only through its surrogate pair — the other three lines are the
negative control that the decoding did not regress.

| File | Point on the axis |
|---|---|
| `control-escapes.svelte` | `\n` / `\t` / `\r` / `\v` / `\b` / `\f` |
| `quote-escapes.svelte` | `\"` and `\'` — each string carries **both** quote characters, so the escape survives the formatter's quote normalization |
| `codepoint-escapes.svelte` | `\uXXXX`, `\u{X…}`, a surrogate **pair**, `\xHH` |
| `template-literal-const.svelte` | a backtick-quoted const escaping `\\`, `` ` `` and `${` |
| `unknown-escape-passthrough.svelte` | `\/`, `\@` and a **multi-byte** `\é` — the escape is dropped, the character kept |
| `attribute-and-mixed-text.svelte` | the same value folded into an attribute, into a quasi between text, and twice in one chunk |
| `module-script-const.svelte` | the const is declared in `<script module>` rather than the instance script |

## Adding a file

See [Adding a pattern file](../../scripts/compat-corpus/README.md#adding-a-pattern-file).
