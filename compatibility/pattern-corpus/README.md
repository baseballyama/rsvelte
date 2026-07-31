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
| `2007-derived-default-comma.svelte` | [#2007](https://github.com/baseballyama/rsvelte/issues/2007) | A comma **inside a string default** must not split the destructuring property |
| `2012-state-destructure-rest.svelte` | [#2012](https://github.com/baseballyama/rsvelte/issues/2012) | Object rest in a destructured `$state(...)` becomes `$.exclude_from_object` |
| `2013-state-destructure-quoted-key.svelte` | [#2013](https://github.com/baseballyama/rsvelte/issues/2013) | Quoted key in a destructured `$state(...)` needs bracket member access |
| `2014-derived-array-rest-arity.svelte` | [#2014](https://github.com/baseballyama/rsvelte/issues/2014) | An array pattern ending in a rest element passes **no length** to `$.to_array` |

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

## Adding a file

See [Adding a pattern file](../../scripts/compat-corpus/README.md#adding-a-pattern-file).
