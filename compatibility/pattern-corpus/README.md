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
| `2194-nested-prop-destructure-assignment.svelte` | [#2194](https://github.com/baseballyama/rsvelte/issues/2194) | A **nested** destructuring **assignment** (`({ a: { value } } = src)`) inside a runes, **props-only**, non-dev script — the `ast_state_transform` source-range path (used when the script has no other reactive declarations to force the text-based transform) previously had no case for nested-destructure prop assignments and left them untransformed |
| `2304-element-block-template-effect-deps.svelte` | [#2304](https://github.com/baseballyama/rsvelte/issues/2304) | An element whose children are wrapped in a `{ … }` block (because it contains a `{#snippet}` or a `{const}`) must pass the memoizer's `$0`/`$1` parameters **and** its deps array to the block's `$.template_effect` — the body already references them, so dropping either throws a `ReferenceError`; the `{const}` case additionally scopes a fresh memoizer to the block |
| `2592-destructure-assignment-line-break.svelte` | [#2592](https://github.com/baseballyama/rsvelte/pull/2592) | A destructuring **assignment** with no terminating semicolon — the RHS ends at the **line break**, or the scan runs on through the statements that follow and emits `(($$value) => {…})(rhs` unclosed, which is not JavaScript. The same line break makes it an expression *statement*, so the IIFE must not `return` its value; the `out = ([selected] = result)` declaration pins the other side, where the value **is** used and the `return` must stay. Kept deliberately unformatted: the formatted form (`[selected] = result;`) does not reproduce, so the fmt oracle's rewrite is the point, not a lapse |
| `2596-ts-required-after-optional.svelte` | [#2596](https://github.com/baseballyama/rsvelte/pull/2596) | A TypeScript rule OXC enforces while parsing a **complete** AST and the official parser does not — a required parameter after an optional one. Type stripping must not bail on it: unfixed, the client emits `(a: string, …)` and `$.prop($$props, 'n: number', …)`, and the **server drops the entire instance script** while still emitting parseable output — a silent-wrong-output failure no parse gate can see, which is why it is pinned here. The fmt oracle cannot format this file (oxfmt is built on the same parser), so `fmt.mjs` skips it as not-formattable rather than comparing it |
| `2598-escaped-backslash-statement-boundary.svelte` | [#2598](https://github.com/baseballyama/rsvelte/pull/2598) | A string literal whose last escape is `\\`, followed by an `export` declaration — the client instance-script scanner asked "is the byte before this quote a backslash" instead of "is this quote escaped", so the string never closed, the statement never completed, and the `export` was accumulated into it and emitted verbatim inside the component function, which is not JavaScript |
| `2598-escaped-backslash-reactive-statement.svelte` | [#2598](https://github.com/baseballyama/rsvelte/pull/2598) | The same scanner defect with a `$:` statement after the string instead of an `export`: the label survives into the component body as a labelled statement, which **parses**. No parse-level gate can see this half — only output equality can, which is why it is pinned here separately |
| `2599-reactive-else-next-line.svelte` | [#2599](https://github.com/baseballyama/rsvelte/pull/2599) | A `$:` whose `if` header and `else` clause are on **separate lines** — the client instance-script line accumulator decides where a statement ends by looking at what the next line starts with, and its continuation set (`.`, `?`, `:`, `&&`, `||`, `??`) had no entry for the `else` keyword, so the statement was closed after the `if` and the `else` fell outside the reactive body |

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

## Adding a file

See [Adding a pattern file](../../scripts/compat-corpus/README.md#adding-a-pattern-file).
