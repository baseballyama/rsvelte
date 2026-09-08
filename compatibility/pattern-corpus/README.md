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

Ids are `pattern/issues/<file>`, `pattern/matrix/<axis>/<file>` and
`pattern/adversarial/<theme>/<file>`; run just this source with
`node scripts/compat-corpus/compile.mjs --filter pattern/`.

## Conventions

1. **Self-contained.** Imports need not resolve — nothing is bundled or run —
   but the file must be a complete component on its own.
2. **The official compiler must accept it** — unless the file exists to compare a
   *rejection*. The error ratchets (`error-{message,position,end,frame}-*`) compare
   both compilers on inputs both reject, so a repro whose subject is the reported
   message or position belongs here too; say so in its row.
3. **One behaviour per file, minimal.** Delete everything the shape does not
   need.
4. **Never write provenance in a comment — HTML or JavaScript.** Removed
   comments are themselves a whitespace-sensitive compiler input (see #1975), and
   a comment inside `<script>` is the same input one level down: #4279's first
   repro carried a `//` line explaining each cell and was green on *both* arms,
   because a real leading comment ahead of an `export let` changes the very
   attachment the file exists to pin. Provenance belongs in the table below and
   nowhere else. (The comments in `matrix/whitespace-comments/` are the
   *payload*, not provenance.)
5. **Commit formatted files.** They flow through the fmt gate, so keep them in
   the shape prettier-plugin-svelte would produce; an unformatted file is a
   needless new formatter case, not a compiler case.
6. **Measure a repro on both arms.** A file that matches on the fixed tree is
   only a repro if it *diverges* on the tree without the fix; a cell that is green
   either way pins nothing and cannot regress.
7. **A repro lands with its fix, not before.** Adding a file for a still-open
   divergence would mean seeding a `known-failures` entry, and the seed then has
   to be tracked and burned down separately from the fix. Add the repro in the
   fix PR (or immediately after it merges) so it lands green.

## `issues/` — one minimal repro per fixed divergence

One minimal repro per fixed divergence, and **the prose lives beside the repro**:
`issues/<file>` is documented by `issues/<file>.md`, one sibling doc per repro.

It used to be a single append-only table here, and that made every repro PR conflict
with every other one — two PRs adding a row both append immediately above
`## `matrix/``, git reports an add/add, and one of them re-runs 48 checks for a table
row. Measured on 2026-09-08: #4444 merged and #4425 went `CONFLICTING` within three
minutes, on this file alone. A sibling doc per repro has no shared insertion point, so
two PRs adding two repros touch two files that did not exist before.

The table shape also let two defects be spelled that a per-file layout cannot:
`pattern-default-declares-and-references.svelte` occupied **two** rows with different
prose (the checker compares sets, so a repeated id was invisible to it), and one row was
missing its trailing pipe. Both are unrepresentable now rather than merely detected.

To read them all in one place:

```sh
node scripts/ci/check-pattern-corpus-docs.mjs --index
```

which prints the old table to stdout, generated from the sibling docs.

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
| `sibling-snippets.svelte` | a `{@const}` in one snippet is unreachable from its sibling |
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

| File | Point on the axis |
|---|---|
| `instance-declaration.svelte` | one continuation in a `const` initializer in the runes instance script |
| `indented-continuation.svelte` | the carried line is indented, so the indent is itself part of the string's value |
| `consecutive-continuations.svelte` | two continuations in one statement — the state has to survive a line that closes one string and opens the next |
| `legacy-reactive-block.svelte` | the continuation sits in a legacy `$:` **block** body, the third re-indenter |
| `template-literal-newline.svelte` | **negative control** — a backtick carries its newline as content and had to keep doing so |

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

| File | Point on the axis |
|---|---|
| `instance-declaration.svelte` | `\t` in a `const` in the instance script — the baseline slot |
| `attribute-value.svelte` | the same literal as an attribute value expression |
| `const-tag.svelte` | inside a `{@const}` in an `{#if}` |
| `each-and-key.svelte` | inside an `{#each}` collection, read back through `{#key}` |
| `event-handler.svelte` | inside an event handler arrow's body |
| `control-escapes.svelte` | `\t` / `\v` / `\b` / `\f` in one expression |
| `codepoint-escapes.svelte` | `\xHH`, `\uXXXX` and `\u{X…}` |
| `quote-escapes.svelte` | `\'` and `\"` — each string carries **both** quote characters, so the escape survives the formatter's quote normalization |
| `newline-escape.svelte` | **negative control** — `\n` / `\r` are in the printer's own escape set |
| `backslash-escape.svelte` | **negative control** — `\\` likewise |

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
## `adversarial/` — proactive adversarial sweep

Unlike `issues/` (one repro per **fixed** divergence) and `matrix/` (axes around
those repros), everything under `adversarial/<theme>/` was written **before** any
divergence was reported: a deliberate sweep of hostile-but-valid component shapes
— exotic syntax, scanner-bait strings, shadowed globals, spec-corner CSS — each
confirmed byte-equal on all four targets when it landed, so it pins behaviour the
pinned repositories never exercise. The sweep that produced these files also
surfaced ~20 real divergences; those files land in `issues/` with their fixes,
not here. A file here is named for its shape, not for an issue number, because
there is none.

Themes (one directory per theme, one behaviour cluster per file):

| Theme | Files | What the theme covers |
|---|---|---|
| `text-and-entities/` | entity forms in raw and escapable-raw text, `<pre>` whitespace, tab/space runs, RTL and ZWJ emoji, a leading document comment plus `svelte-ignore` pairs and comments inside blocks and CSS, unicode identifiers, emoji/ZWJ text, `&#123;` braces, named/decimal/hex character references, expression/text adjacency, comment forms, explicit whitespace expressions, inline blocks splitting words, an escaped `</p>` and `<script>` as text and as an expression value, `<textarea>` / `<title>` / `<pre>` / `<code>` raw-text content next to `{@html}` and attribute entities, U+2028/U+2029 separators and NBSP/U+3000 in text and attributes (non-HTML whitespace the formatter must keep — #3046), a ZWJ family emoji, a skin-tone modifier, combining marks, RTL text with an explicit bidi override, a lone astral character, zero-width space and joiner references, and fullwidth / Roman-numeral / ligature codepoints in text and in an attribute and every character JS counts as whitespace but Unicode's `White_Space` does not — U+FEFF, `\v`, `\f` — used as the separator inside a `<script>` next to NBSP and U+3000 and three more: every character-reference spelling (named, decimal, hex, astral, and two that are not references), `<svelte:options preserveWhitespace />` over spaced text, inline siblings and `<pre>`, and non-ASCII identifiers (Japanese, Cyrillic) beside a ZWJ emoji, RTL text, a combining mark and fullwidth/ligature codepoints and comment forms in every markup slot — a leading and trailing document comment, before and inside an element, after an expression, inside an `{#if}` and an `{#each}`, a multi-line comment and an empty one and `<pre>` and `<code>` content beside collapsed text, tabs and interpolations and three more: the unicode text zoo (combining marks, ZWJ emoji, RTL runs, surrogate pairs, NBSP and zero-width characters in text and in attribute values), an HTML comment in every markup slot beside JS and CSS comments and comments inside an expression tag, and `<!-- @component -->` documentation beside `svelte-ignore` in three placements and two more: the character-reference forms (named, decimal, hexadecimal, astral, and the unterminated spellings `&amp`, `&#;`, `&#x;`, a bare `&`) in text and in attribute values, and the whitespace product between and inside elements and two degenerate components: one that is a single line of text, and one that is a single HTML comment and two more: `<style>` before the markup with `<script>` after it, and a `<script module>` placed after both the markup and the instance script | Text, character references and whitespace at markup level |
| `control-flow/` | six block levels nested (`{#if}` → `{#each}` → `{#key}` → `{#each}` → `{#if}` → `{#each}` → `{#await}` → `{#if}`), `{@const}` shadowing an outer `const` and then itself in a nested block and an `{#await … then}` parameter, `{@const}` in every block that allows one plus `{@debug}` and `{@html}`, `{#each}` over a `Map`/`Set`/`{ length }`/a filtered-and-mapped chain with nested destructuring defaults, `{#await}` with destructured `then`/`catch` clauses and `Promise.all`, each over `{ length }`/`Array(n)`/ternary collections, itemless `{#each}`, deep else-if chains, all `{#await}` clause forms, nested await-in-each-in-if with shadowed names, `{#key}` over sequences, empty blocks, `{@const}` forms, comments between block clauses, `{#await}` nested inside `<svelte:boundary>` with a `failed` snippet next to `$effect.pre`/`$effect`, and each-block destructuring patterns (object, array with default and rest) crossed with keys and `{:else}`, a `<svelte:boundary>` pair whose `failed` snippets share a name and differ in what they close over, every `{#await}` clause shape including destructured `then`/`catch` and nested awaits, `{@const}` in all seven legal parents, and `{#each}` over a Map, a Set, a generated array and a nested-destructuring pattern with an array default, `{#await}` destructuring its `then` value inside a keyed `{#each}` that awaits again and branches, all three `{@debug}` arities next to `{@const}` inside an `{#if}` and a destructuring `{@const}` inside an `{#each}`, every `{#each}` key shape (the item itself, a call, the index, a template literal closing over outer state, a destructured key, a mapped collection, a string), and an `{@const}` declared after an `{#await}` in the same each body, and the `{#await}` clause forms a non-promise reaches — `{#await}` over a plain value, `then`-only, `catch`-only, a pending-only block, and a ternary expression whose `catch` destructures, and each over a `Map`/`Set`/generator/`{length}`/`Array.from` chain, `{#await}` interleaved with `{#key}` over a re-created promise, and `{@const}` declared at every nesting level of an if/else-if/else chain that shadows itself and the block matrices: every `{#each}` key and index spelling, every `{#await}` clause combination including a destructured `Promise.all`, `{@const}` in all seven legal parents, seven object/array destructuring patterns as each-block items, an HTML comment between every pair of block clauses, `<svelte:boundary>` wrapping a `{#key}` over a keyed `{#each}`, and eight block levels nested with a `{@const}` at the floor and four more: `{@html}` in every parent that allows one including `<svelte:boundary>`, `{#each}` over a `Map`, a `Set`, a spread generator, an array-like, a filtered-and-mapped chain and `map.keys()`, and every `{#key}` expression shape (identifier, member, template, index, ternary, array literal, `undefined`) and five more: `{#await}` nested inside every block that allows one and inside itself, `{#each}` with no `as` clause in all four spellings, an eight-arm `{:else if}` chain beside five `{#if}`s nested with no whitespace, empty bodies for every block form including an empty snippet, and each-item names that collide with the client's own generated identifiers (`text`, `node`, `anchor`, `root`, `fragment`) and five more: `{@const}` in every host that admits one (both `{:else}` arms, `{#each}` with a destructuring form, `{:then}`, `{:catch}`, `{#snippet}`, `<svelte:boundary>`, a keyed `{#if}`), `{@html}` in every host and beside sibling text, `{#await}` with each branch omitted in turn including the value-less `{:then}` and `{:catch}`, `{#each}` with and without index, key and destructuring in eight combinations, and `{#each}` over a string and over `Map`/array iterator methods and eight block levels nested inside one another — `{#if}` / `{#each}` / `{#key}` / `{#await}` / `{#snippet}` and back down through `{#each}` and two more: `{@render}` in every markup slot that admits one, and three `{#each}` levels each keyed with a `bind:value` into the innermost item and into the full index path and three more: `{#await}` over a non-promise in eight expression shapes, `{#key}` over eight expression shapes including an object, an array and a sequence, and a chain of seven `{@const}`s in one block where each reads the last and three more: 26 levels of `{#if}`, `{#each}` destructuring with defaults, a rest, an elision and a nested pattern default, and the same defaults re-expressed through `{@const}` and a `{#snippet}` parameter where the formatter can print them and three `{#each}` levels over a `$state` array, a `$derived` of it and a `$derived` of that, keyed on each and `{@const}` bound to every function-ish value — an arrow, a block arrow, a named function expression, a generator, an object with a getter and a class expression and 40 sibling `{#if}` blocks and two more: `{@const}` as a direct child of a component and inside its `{#snippet children}`, and a promise built by `$derived` awaited in four hosts | Every block form, empty and nested, with shadowing |
| `snippets/` | a parameterless snippet, defaults plus an array-typed tail parameter, a snippet nested inside another that closes over its parameter, `{@render}` through `??` and a ternary, self-recursive snippet, `{@render}` callee forms (`?.()`, ternary, `??`, a table lookup, an IIFE returning a snippet), module-exported snippet, snippets as expression props, snippet declared inside `{#each}` closing over the item, a nested snippet whose parameter shadows both an outer snippet's parameter and a module const, a comment in every slot of a snippet's parameter list, a snippet whose parameter list mixes a default, an object pattern default and an array pattern default, a self-recursive snippet, one shadowing its own each-item name, and `{@render}` of a `??`/`||` chain, and `<slot>` beside `{@render}` in one component as the `slot_snippet_conflict` rejection, and a snippet whose body nests `{@const}` inside `{#key}` inside a second snippet, rendered from a keyed `{#each}` and from a bare `{#key}`, and a snippet whose parameter shadows an outer `let`, an each item and an inner snippet's own parameter of the same name and the snippet reference surface: `{@render}` through `??`, a ternary, a table lookup and an optional call, snippets passed as component props next to a `children` block, and the hoisting axis — a snippet reading nothing, one reading a module const, one reading `$state`, one taking a parameter and one calling two others and three snippets nested three deep, the innermost closing over both outer parameters, rendered from a keyed `{#each}` and two more: a snippet whose `{@const}`s destructure its own parameters and feed a nested `{#each}`'s `{@const}`, and snippet and parameter names that collide with generated identifiers and a snippet passed as a prop to a recursive child beside a self-recursive `{@render}` tree and snippet parameters in every legal shape (none, one, defaults that read an earlier parameter, a destructured object, an array default, and a parameter shadowing an outer binding) and a snippet declared inside an `{#each}` closing over the item, a nested one closing over both, and `{@render}` through an optional chain and a `??` fallback and a self-recursive `{#snippet}` that renders itself twice per level to depth 4 and a snippet handed down two levels as a prop and rendered at the bottom and two more: the same snippet name declared in five sibling scopes (`{#if}`, `{:else}`, `{#each}`, `{#key}`, top level) and `{@render}` reached through a ternary, an index, a member, a computed member and a `??` | Snippet declaration/reference topology |
| `bindings/` | `bind:group` over checkbox/radio/an indexed array, `<select>` single and `multiple`, `bind:files`, function bindings (`bind:value={get, set}`), `bind:this` into members/arrays, `bind:group` in nested each and with object values, media/dimension bindings, computed-member binding targets (a variable index, an index expression, a quoted key, a nested member), per-type `bind:value` inputs, `bind:files`/`bind:innerHTML`/`bind:open`/`multiple` select, component bind combinations, `bind:group` against a store member, a rune array, radios and a per-row nested array, next to `bind:value={$store.field}`, `contenteditable` with `bind:innerHTML` / `bind:textContent` / `bind:innerText`, and a `<video>` carrying every media binding at once (`currentTime`, `paused`, `duration`, `volume`, `playbackRate`, `ended`, `readyState`, `seeking`, `played`, `buffered`, `seekable`) beside `bind:clientWidth`/`Height` and `<details bind:open>`, and `bind:` targets that are member chains (nested, computed by variable, indexed, bracket-quoted) beside `bind:this`, and both function-binding spellings — a `get, set` pair of named functions and a pair of inline arrows and every dimension and media binding on one element pair (`clientWidth`/`clientHeight`/`offsetWidth`/`offsetHeight`/`contentRect`, and the nine `<video>` bindings) and three more: every dimension and resize-observer binding beside the three `contenteditable` bindings, the complete media-element binding set on `<video>` and `<audio>`, and a component `bind:` given a getter/setter pair in both the inline and the block spelling and the `<select>`/`<textarea>` surface beside `bind:group` on radios and checkboxes outside any block and a component `bind:` whose target is a member path — a nested property, an array index, a computed key and an index that is itself reactive and an `<input>`/`<textarea>` binding nested inside `{#if}` inside a keyed `{#each}` inside `{#key}`, bound both through the item and through the full index path and the component `bind:` shorthand with and without a value on the same pair of props and a component `bind:` inside a keyed `{#each}`, bound through the item and through the index path and `bind:this` inside a keyed `{#each}` collected into an array slot, an object slot and a single shared variable and a `$bindable` chain threaded through four levels of self-recursion | Every binding form against every target shape |
| `events-actions-transitions/` | `animate:flip` with an easing, `in:`/`out:` with `|global`/`|local`, a custom transition returning both `css` and `tick`, and `class:`/`style:`/`use:` stacks including a dynamic action and a custom property, legacy modifier stacks, action zoo, crossfade/flip/custom transitions, `onclickcapture`/intro-outro events, item-dependent transition params, `{@attach}` forms, `use:` with no value / an object / a member callee, `|global`/`|local` transition modifiers, `animate:` under a keyed each inside an if, and every handler value shape (member, computed member, named function expression, async arrow, ternary-to-`undefined`, spread-supplied), the full legacy modifier matrix (`trusted`, `self`, `stopImmediatePropagation`, `passive`/`nonpassive`, five stacked) plus the two rejections next to it — mixing `on:click` with `onclick`, and `bind:value` on `<svelte:element>`, `animate:flip` with easing beside `transition:` / `in:` / `out:` and their `|global` / `|local` modifiers, and `animate:` under an `{#if}` inside the each as a rejection, and the `use:` return-shape zoo — a full `{ update, destroy }`, destroy-only, a bare void action, a curried factory, a member callee and two actions stacked with a `class:`, and `{@attach}` in every position — on `<svelte:element>` with a dynamic tag, twice on one element, from an array element and from an inline arrow inside an `{#each}`, and handler values as a named function, an object member, a call that returns a handler, an inline arrow, a block-bodied arrow, a ternary to `undefined` and `null`; and `use:` beside `{@attach}` on the same element, with an object-literal parameter, a valueless action and a dynamic `<svelte:element>` host and the transition parameter surface — `fade`/`fly`/`slide`/`scale`/`blur`/`draw` with and without options, an easing, `|global` and `|local`, `crossfade`'s `send`/`receive` pair and `animate:flip` inside a keyed `{#each}`, and the built-in transition surface (`fade`, `blur`, `fly`, `slide`, `scale`, `draw` on an SVG path and a `crossfade` pair) against five easings, `animate:flip` bare and parameterised beside a transition on the same keyed `{#each}`, and an action in every return shape (update + destroy, bare, destroy-only, stored in a variable, applied twice to one element) and two more: `{@attach}` on a component, from a factory call and through a spread carrying `Symbol.for('svelte.attachment')`, and handler values that return something — a boolean, an async function, an inline `await`, a `void` generator call and `event.preventDefault()` | Directives whose value is a function |
| `runes/` | `$effect` / `$effect.pre` / `$effect.root` each returning a cleanup, a `$props()` destructure crossing defaults that reference an earlier prop with `$bindable()` with and without a default and a rest, an instance-script class with a static block, a private static, a private method, a private `$state` field and an arrow-bound method, `$state.raw`/`$state.snapshot`/`$derived.by`/`$props.id()`/`$effect.pre`/`$effect.root`/`$effect.tracking`/`$inspect(...).with` in one component, `$state.raw`/`$state.snapshot`/`$derived.by`/`$effect.pre`/`$props.id()`, `$bindable` defaults, `$inspect(...).with`/`$inspect.trace`, class rune fields (raw/derived/`derived.by`/private/quoted-key/static, plus one declared only in the constructor), multiline and comment-bearing field initializers, object-member getters/setters in `$state`, every compound assignment operator including destructuring swaps, runes read from nested function/class/object/loop/`catch` scopes, semicolon-free and line-broken rune declarations, `svelte/reactivity` builtins, reserved-word prop names, context/lifecycle imports, a comment in every slot of a `$props()` destructure, a class mixing a private `$state` field with a hand-written accessor pair, a public field, a `$derived` over the private one, a static counter, `$derived.by` + `$state.snapshot`, `$state.raw`, `$props.id()` and `$effect.pre`, plus `static x = $state()` as a rejection, nested `$effect`s with a conditional cleanup, `$effect.pre` inside an `$effect`, `$effect.root` with a teardown, and `$effect.tracking()`, a `$state` class hierarchy whose subclass adds a getter/setter pair over an inherited field, a symbol-keyed and deeply nested `$state` object, a frozen literal, `$state.raw` of a `Map`, and `$state.snapshot` in a `$derived`, and a class crossing a private `$state` field, a public one, `$derived`, `$derived.by`, `$state.raw`, a hand-written accessor pair over the private field, an arrow-bound method, a static block and an `$effect.root` in the constructor, with a `$derived` in an object literal outside it, and writes through every assignment and update operator against plain (non-state) locals, a `$state` written from every host — a function, a nested arrow, a loop body, a `catch`, an event handler and a class method — and the rune-declarator separator spellings that survive the formatter (a one-space `=`, and a value beginning on the next line) and a second pass over the rune surface: the `$props()` declaration forms official accepts (default, a default reading an earlier prop, a rename, a quoted key, `$bindable()` with and without a default, a rest, beside `$props.id()`), `$effect` cleanup shapes and every legal host for an `$effect` (a function, a constructor, inside another `$effect`, a `try`/`finally`), `$state` over a symbol key, a getter/setter pair, a `Map` and a `Set`, every assignment and update operator writing one, a `$state` read from a function, an arrow, an object getter, a class method, a loop and a `catch`, `$derived` dependency shapes (chained, `.by`, conditional, in an object and an array, through a helper), `$inspect` in all three arities beside `{@debug}`, `$host()` under a full `customElement` option object, and locals named `state`/`derived`/`effect`/`props`/`bindable`/`inspect`/`host` and a third pass: `svelte/reactivity`'s `SvelteMap`/`SvelteSet`/`SvelteDate`/`SvelteURL`/`SvelteURLSearchParams`/`MediaQuery` mutated together, `untrack` beside `tick`/`flushSync`/`setContext`/`hasContext`/`getContext` and `$state.snapshot`, a `$props()` rest forwarded to a child as a spread, and a `$derived` over each of the sixteen expression kinds (binary, unary, logical, nullish, conditional, template, member, computed, call, object, array, spread, sequence, optional, `new`, tagged) and five more: `$bindable` prop writes through every operator and member depth from a child back to its parent, nested `$effect.root`s whose teardowns call each other, `$inspect.trace` inside an `$effect` beside `$effect.tracking()`, `$props.id()` under a `<svelte:boundary>` with a `failed` snippet, and `$state` / `$state.raw` mutated in parallel with `$state.snapshot` of each and four more: the `svelte` lifecycle and context surface (`onMount` sync and async, `onDestroy`, `tick`, `untrack`, `setContext` under both a symbol and a string key, `hasContext`/`getContext`/`getAllContexts`), a `$derived` diamond over `$state.raw` with `$derived.by` and `$state.snapshot` on top, `{@debug}` in all four arities and inside a block, and a `$props()` destructure crossing renames, defaults that read an earlier default, a quoted key, a function default and a rest and two more: `$effect.pre` and `$effect.tracking` inside an `$effect.root` beside a teardown, and `$bindable()` with no default, a literal default and an expression default beside `$props.id()` on both sides of the parent/child boundary and two more: deep mutation of a `$state` tree through nested members, array index writes, `push`/`splice`/`sort`/`reverse`/`length` and `delete`, and a `$state` read and written from inside a template expression including a comma expression and `$inspect` in all four arities with `.with()` given an arrow and a bare reference, beside `$state.snapshot` nested inside another snapshot and a `$derived` array consumed by four `{#each}` blocks — sorted, filtered, `$derived.by`-mapped and sliced — keyed and unkeyed and `$props()` captured whole with no destructure and read through `$derived` and `$state` carrying methods and a getter, as a class instance and as a plain object, read through a `$derived` and `<svelte:boundary>` with `pending`, with `failed` taking a retry, and nested and `$effect`, `$effect.pre` and `$effect.root` called from inside a plain function and from a function nested in one and three more: `$state` initializers carrying closing delimiters in a string, a template hole, a regex, an object key and an array, `$derived.by` with four multi-line body shapes including two IIFEs, and assignments long enough that the formatter breaks them — member targets, a compound assignment and an array-pattern swap | Rune member forms and mutation shapes |
| `legacy/` | a `context="module"` script beside `$$props`/`$$restProps`/`$$slots` with `beforeUpdate`/`afterUpdate`, `<svelte:fragment slot=…>` in self-closing, empty and populated forms next to a `let:`-consuming default slot, `$:` destructuring with nested array/object rests and a labelled block body, `writable`/`derived`/`readable` with `$store` reads, writes and a destructuring `$:`, legacy `<slot>` forwarding with `let:` and an `{:else}` slot next to a modifier-stacked `on:click`, store exotica (`$store` writes, module-script stores), slot forwarding with `svelte:fragment`/`let:`, renamed exports (`export { a as b }`), `createEventDispatcher`/`beforeUpdate`, `$: $store =` writes, component bind chains, `svelte:self`, stores in handlers, semicolon-free `$:` bodies (an arrow whose body starts on the next line, an `else` on its own line, a labelled `for`, a call split across lines), and escape-hostile `$:` right-hand sides (`'\\\\'`, a regex with `/` in a character class, nested template literals, a default parameter carrying `';'`), the full store contract — `writable`/`readable`/`derived` single and array forms, a hand-written `subscribe`, `$store` member access, a `$:` that writes the store it reads, and `get()`, the `<slot>` surface with named slots, fallback content, slot props and `$$slots` lookups both ways, next to the duplicate-attribute rejection a `name` shorthand next to `name="…"` produces, `<svelte:options accessors>` with `export let` / `export const`, two `$:` forms and `$$restProps` / `$$props` together, `let:` values that destructure with defaults, nested patterns and rests across `<svelte:fragment slot>` and a slotted element, `$:` statements written in reverse dependency order beside a destructuring one and an if/else body, and the store/context surface (`readonly`, an array `derived` with a setter callback and cleanup, `setContext`/`hasContext`/`getContext`, `$store` writes from a `$:` and from `onMount`), and `$$restProps` forwarded through a `<svelte:element>` and a `<slot>` at once, beside `$$props` and a `$$slots` lookup, and the `$:` statement forms in one component — assignment, if/else, an object-pattern destructure, an array-pattern destructure, a block with a local, and a bare call — and the store surface with `writable`/`derived`/`readable`, a `$store` self-write and a nested `$store` member update and four more legacy files: the full `on:` modifier matrix including a five-modifier stack and a forwarded `on:click`, `<slot>` forwarding with named slots, slot props, fallback content and a `$$slots` guard, `createEventDispatcher` with all four lifecycle hooks under `accessors`, `export { a as b }` beside `$$props`/`$$restProps`, and a store read, written, destructured, bound and toggled through `class:` in one component and two more: a component that dispatches, forwards and re-dispatches its own custom event through `<svelte:self>`, and `<svelte:options immutable accessors>` over an `export let` array replaced by identity and five more: the `svelte/legacy` shim surface (`run`, `createBubbler`, `handlers`, `passive`/`nonpassive`, and the six modifier wrappers), `<script context="module">` exporting a function the instance script calls, `$:` statements written in reverse dependency order with a self-appending array, `let:` values destructured as objects, arrays and renames across four slots, and a keyed `{#each}` over a store's array that updates it immutably and four more: a store read and written through `$name` in every position under an explicit `runes={false}`, `<svelte:options accessors immutable />` beside a `$:`, the `$$props`/`$$restProps`/`$$slots` surface, and `<slot>` fallback content supplied and unsupplied across a default, a named and a never-filled slot and three more: `beforeUpdate`/`afterUpdate` with an async one beside them, `$:` statements written in reverse dependency order with destructuring and array-pattern heads, and `$:` writing back to its own props including a clamp that reassigns the prop it reads and a store read through `$name` inside `{#each}`, `{#if}`, `{#key}` and `{#await}` in one component and `$:` statements whose values carry `}` in a string, a template, a regex, an object key and a block body | Legacy-mode surface the runes corpus cannot reach |
| `modules/` | a `<script module>` exporting mutable state and an async function the instance script awaits, `.svelte.(js\|ts)` classes (expressions, nested, parenthesised, default-export with a tail statement), static blocks with private statics and a quoted rune key, multiline rune fields, getters/setters over module state, `$effect.root` factories, generators/`for await`/labelled `break` over module state, TS-stripped runes, rune-name tokens inside strings/regexes, a `<script module>` with `import.meta`, a dynamic `import()` and an exported `Symbol`, beside namespace / default / renamed imports and a second module sweep, weighted to `compileModule` because it is the entry point with the least population: `$derived` chains and `$derived.by`, labelled loops with `continue`/`break` and a `do`/`while`, `try`/`catch` with a destructured binding plus `finally`, regex and string literals carrying rune and `class` tokens, three levels of nested template literal plus a tagged one, generators and `for await`, optional/nullish chains through a nullable holder, an object literal of getters/setters/generators/async methods/a computed key, `export { a as b }` with `export { x as default }`, class accessor pairs, a class declared inside a function, `$state` over a `Map`/`Set`/array, static and private-static members, arrow bodies in five layouts (next-line, parenthesised object, curried, async), comment placement in every module slot, a three-level inheritance chain reading `super`, and destructuring declaration forms and a third module pass: import forms (default, named, renamed, namespace, dynamic, `import.meta`), well-known symbols (`Symbol.iterator`, `Symbol.toStringTag`) over `$state`, every numeric literal spelling including two bigints, top-level `await` feeding a rune, a static block with a private static beside an instance `$state`, shadowing across block/loop/`for…of` scopes, an `Error` subclass with a `$state` field and an optional `catch` binding, getter/setter exports over module state, and `switch`/`continue`/`entries()` over it and four more: an IIFE-initialised export beside a call to a hoisted declaration and a `export default` of it, a hand-written store contract (`subscribe`/`set`/`update` over module `$state` with a getter view), nested closures returning an object of methods and a variadic `compose`, and a class whose `$derived` fields read a private `$state`, an outer module `$state` and each other and nine more: async generators with `for await` and `Promise.race`, class expressions in four forms (anonymous, named self-referential, extending, parenthesised-and-newed), private methods and a private accessor pair over a private `$state` with a static private counter, every string and template escape form, top-level `if`/`for`/`try`/`switch`/labelled-block control flow mutating module state, labelled `continue`/`break` across nested loops with a `switch` inside, `Object.freeze` and `Object.defineProperties` getters over module state, multi-declarator `let`/`const` statements mixing runes with plain bindings, and `export const`/`export let` beside a getter view and four more: the `svelte/reactivity` classes (`SvelteMap`, `SvelteSet`, `SvelteDate`, `SvelteURL`, `SvelteURLSearchParams`) read through a `$derived`, the `svelte/store` surface (`writable`, `readable`, `derived` over one store and over a list, `readonly`, `get`, `toStore`, `fromStore`), `Tween`/`Spring` with their `of` constructors beside `on` from `svelte/events`, and a class whose fields cross `$state`, `#private $state`, `$state.raw`, `$derived`, a private `$derived`, a private method and a static private counter and two more: the export forms (`export * from`, `export * as ns from`, a re-export rename, `export { x as default }`) and a top-level `await` beside a dynamic `import()`, `import.meta.url` and a top-level `for await` and two more: the module/instance interplay (a `<script module>` `$state` mutated from the instance beside a module-local object and an exported constant) and an object literal carrying every member form — a getter, a setter, a computed getter, a symbol key, `[Symbol.iterator]`, an async generator, a method, an async method and a generator — behind a `Proxy` and a `.svelte.js` that is nothing but runes — `$state`, `$state.raw`, `$derived` and `$derived.by` with two exported functions and a module with top-level side effects — an `if`, a `for…of`, a `Map` mutated before and after the exports, a named export and a default export of the same function and three more: a rune in every syntactic position a module admits (class field, `#private` field, `$derived` field, a `static {}` block, a default parameter, a computed method, a nested function, an arrow, an object literal's value / method / getter), rune arguments carrying `}`/`)`/`]` inside strings, templates, a regex and an object key, and a class crossing `static #private`, a `static {}` block, a private `$state`, a `$derived` over it and an accessor pair | The `compileModule` pipeline |
| `css/` | `:global()` in leading, trailing and combinator positions next to `:has`/`:is`/`:not`/`:nth-child(… of …)`, a local and a `-global-` keyframe named in one `animation` shorthand, `}`/`{` inside a `content` string and a `url()`, nested at-rules (`@layer`/`@container`/`@supports`), `-global-` keyframes, `:global()` placements, Tailwind-style escaped selectors, selector zoo (`:not(a,b)`, `::marker`, `:dir`, `:is`/`:where`/`:has`, `:nth-child(… of …)`, `::first-line`), `@supports selector(…)`, compound media queries, `&`-nested rules, `@font-face`/`@property`/mid-sheet `@charset`, `@layer` in both statement and block form, nested `@media`, strings and `url()`s containing `}`/`{`, custom-property values, scoped class merging, `--custom-prop` component passing, and a prune grid crossing kept/unused/`:global`-reached/spread-only/`class:`-toggled selectors with `@keyframes`, `@layer`/`@supports`/`@media` nested three deep, `@property`, `@font-face`, `&`-nesting with `:has()`, `:is()`/`:where()`, an attribute selector and `:global` on both sides of a compound, a prune-hostile stylesheet — child, sibling, `:is()`, `:not()`, universal-adjacent, `:has()` and a never-matching rule over `{#if}` / `<svelte:element>` / ternary-class / `class:` subjects — plus `:global()` mid-selector as a rejection, local and `-global-` `@keyframes` beside a `@-webkit-keyframes` with a grouped `0%,100%` selector and a two-animation `animation` shorthand, plus `:global(@keyframes …)` as a rejection, and escaped class selectors — Tailwind arbitrary values (`w-1\/2`, `md\:w-1\/3`, `\[\&\>\*\]\:mt-2 > *`) crossed with `class:` directives, and comment placement across a stylesheet — after a selector, before and after a declaration value, between declarations, before and after a comma, in an at-rule prelude and before a nested rule, which are every position upstream tolerates (a comment between two compounds is the one it rejects, pinned in `issues/`) — `:has()` led by `>`, `+` and `~`, a forgiving argument list, `:not(:has())` and two chained `:has()`, and the modern at-rule set: `@scope … to`, `@starting-style`, `@container`, `@supports` over `color-mix`, a range media query and `@layer` in both statement and block form, and a stylesheet whose selectors and declarations carry `}`/`{`/`;`/`:global(` inside attribute-selector strings and a `content` value, `&`-nesting with a nested `@media` and a bare `>` child rule, and custom properties set by `style:--hue`, read through `var()` with and without fallbacks and three more stylesheets: `@layer` in both forms with local and `-global-` keyframes, `@font-face`, `@property` and `@container`; every legal `:global()` placement including a bare `:global {}` block and both ends of one selector; and the modern selector set (`:has` with a child combinator and a forgiving list, `:is`/`:where`, `:nth-child(… of …)`, `:not(:has())`, an attribute selector and `@scope … to`) and comment placement in every position a stylesheet tolerates — before a rule, after a selector, before and after a declaration, before a value, between two selectors, in an at-rule prelude, before a nested rule and at the end and four more: `@media`/`@supports`/`@container`/`@layer` nested four deep with range and `not`/`,` preludes, the declaration-value zoo (a `data:` `url()`, a gradient, `grid-template-areas`, a `font` shorthand, `cubic-bezier`, `translate3d`, `clamp`, `color-mix`, an escaped quote in `content`, `calc` over a custom property), escaped and non-ASCII class selectors (`.日本語`, `.ünïcode`, `.w-1\/2`, `.md\:w-1\/3`, `.\31 23`, `.\@container`), and a prune grid whose subjects are a literal class, a ternary, a `class:` toggle, a spread, a conditional block and a never-matching rule and five more: `:global` in every position (leading, trailing, compound, a bare block) beside `&` nesting and `:is()`/`:where()`, `@keyframes` scoped and `-global-` prefixed against the `animation` longhands, the pseudo-class and pseudo-element surface (`:nth-child` with an `An+B`, `:not()` with a list, `:has()`, the form-state set, `::before`/`::after`/`::first-line`/`::placeholder`/`::marker`/`::backdrop`/`::selection`), `@font-face`/`@property`/`@page` beside `:root` custom properties and nested `var()` fallbacks, and `--custom-prop` passed to a component in its static, interpolated and template-literal spellings and two more: `@layer` in its statement, named, anonymous and dotted forms nested inside `@media`/`@supports`, with `@supports selector()`, `not` and an `and`/`or` prelude; and the combinator and selector-list product including a selector split across lines and class names that are numeric, escaped (`\\:`, `\\/`, `\\.`, a leading digit, `\\@`) and non-ASCII and the media-query surface: range syntax in both the one-sided and interval forms, `not all and`, a comma list, feature queries, `min-resolution`, a nested `@media` and a `@media` nested inside a rule and `:has()`/`:not()`/`:is()` nested in one another beside `@starting-style` at top level and inside a rule and two more: the vendor-prefixed surface (`-webkit-`/`-moz-`/`-ms-` properties, `::-webkit-scrollbar`, `::-moz-selection`, `:-moz-focusring`, `@-webkit-keyframes`, a `@supports` on a prefixed property) and the uncommon at-rules (`@charset`, `unicode-range`, `@counter-style`, `@font-feature-values`, `@namespace`) | The CSS pruning/transform surface |
| `elements/` | `xlink:`/`xmlns:` namespaced attributes across svg → `foreignObject` → html → MathML, void elements in both spellings, a custom element with children, `<svelte:element>` over a static and a ternary tag, `<svelte:element>` directive stacks, `svelte:window`/`document`/`body`/`head` combos, `<svelte:boundary>`, `svelte:options` (runes/namespace/css-injected/preserveWhitespace), MathML incl. `annotation-xml`, `foreignObject` namespace switching (svg → html → svg), `<template>`/`<noscript>`, dialog/popover/search, iframe/object security attrs, table structure, void elements in both spellings, `<pre>`/`<textarea>`/`<title>` raw-text whitespace, custom elements in markup, srcset, a `<foreignObject>` holding html and a nested `<svg>`, MathML, an inert `<template>` and a `{#each}` inside `<tbody>`, and raw-text content forms — `<textarea>` with an expression child, `bind:value`, a `value` attribute, whitespace-only content and `{'<'}`-spliced text, next to an interpolated `<title>` and a multi-line `<pre>`, and the content-model-sensitive containers (`<table>` with caption/colgroup/thead/tbody/tfoot, `<dl>`, `<details open>`, `<figure>` with `<picture>`), and raw-text/escapable-raw-text content beside named, decimal and hex character references and an expression whose value is itself an entity string and six more: every void element in both spellings beside self-closed non-void ones, custom elements with attributes, slots and handlers, the whole native form-control set under `bind:`, SVG with `<defs>`/gradient/`<foreignObject>` and MathML in one file, raw-text content forms for `<textarea>`/`<title>`/`<pre>`/`<code>`, and attribute names hostile to a name scanner (non-ASCII, double dash, trailing dash, a dot, a custom `xmlns:` prefix, `xlink:href`, camelCase SVG) and the a11y-warning shapes each preceded by its `svelte-ignore` (a click handler on a `<div>`, a bare `<a>`, a redundant `alt`, an uncontrolled `<label>`, a caption-less `<video>`, a positive `tabindex`) and five more: every `<input type>` under the binding each one allows, the media and embedded-content set (`<audio>`/`<video>` with `<source>` and `<track>`, `<iframe>`, `<object>`/`<param>`, `<canvas>`, `<map>`/`<area>`, `srcset`/`sizes`), a `<table>`/`<ol>`/`<dl>` built from `{#each}`, the ARIA and `role` attribute surface, and the mixed-case SVG tag names (`clipPath`, `linearGradient`, `feGaussianBlur`, `animateTransform`, `textPath`) and three more: the non-void tags written self-closing beside every void tag and a self-closing SVG subtree, 24 levels of element nesting, and a 64-element sibling run and two more: custom-element tag names (hyphenated, digit-bearing, long, with named children) beside the `is=` attribute, and the `xml:`/`xlink:` attribute names on an SVG subtree and `<pre>` and `<textarea>` with a leading newline, with an interpolation, and with the value passed as an attribute and the unquoted attribute-value forms official accepts (dotted, dashed, colon-bearing, `_`, `+`, `*`, `%`, a fragment href, a bare boolean, and an unquoted value with an interpolation appended) and three more: a 120-word text run beside 40 interleaved expressions and 40 sibling spans, a 12-declaration inline `style` with ten custom properties, and an over-width `title` and `<option>` values as an object, a number and implicit text beside `<optgroup>` with `disabled` and the uncommon element set (`<template>`, `<noscript>`, `<output>`, `<progress>`, `<meter>`, `<data>`, `<time>`, `<ruby>`/`<rt>`, `<bdi>`/`<bdo>`, `<ins>`/`<del>`, `<figure>`, `<hgroup>`, `<search>`) and the SVG attribute surface — `preserveAspectRatio`, `gradientUnits`, `clipPathUnits`, `stdDeviation`, `stop-color`/`stop-opacity`, `clip-path`/`filter` `url()` references, `text-anchor`/`dominant-baseline` and a `<tspan>` and `contenteditable` in its `true`, `plaintext-only`, `false` and expression forms beside `innerHTML`/`textContent` bindings | Element-specific parser and codegen paths |
| `attributes/` | quote-hostile values (a `"` inside a single-quoted value and back), spread before and after a same-named attribute, bare/empty/interpolated values, spread clobbering, unusual attribute names (`xml:lang`, camelCase SVG), directive-named plain attributes (`bind={x}` as a prop), boolean attribute values (`disabled={0}`, `checked={NaN}`), `class` array/object forms, global attributes (`itemscope`, `popover`, `is`), `style:` with a custom property and `|important`, empty/single-quoted/interpolated attribute values, `srcset`/`sizes`, `class` and `style` as arrays, objects, directives, interpolated strings, empty strings and nullish, all against the same stylesheet, every attribute value spelling in one file — expression, shorthand, quoted expression, interpolated, single-quoted, unquoted, valueless, spread on both sides, and `false`/`undefined`/`null`, and one element carrying twenty-odd attributes at once — quoted, interpolated, template, ternary, join, member-of-literal, nullish/or/and, unary, ARIA, spread, two handlers, `style:` with a custom property, `class:` and `use:`, and attribute names hostile to a name scanner — non-ASCII (`data-ünïcode`, `data-日本語`), a double dash, a trailing dash, a dot, and `xmlns:`-declared custom prefixes next to `xlink:href` and camelCase SVG, and the `style` merge surface — a static `style` beside three `style:` directives including a custom property, a directive whose value goes nullish over a static declaration, an interpolated value, an `|important` one, a spread carrying `style`, an empty `style` and a template-literal one, and attribute values whose expressions end at hostile boundaries — a template literal, a regex, a nested object, a ternary and a comment-bearing expression and the merge/precedence surface: a spread before and after a same-named attribute and twice over, `class` as a string, an array, an object, a mixed array, an interpolation, `undefined` and a directive, `style` against `style:` directives in both orders with a custom property and a spread, and every boolean-attribute value spelling (`0`, `""`, `null`, `undefined`, `NaN`, a ternary to `undefined`) and two more: one anchor carrying twenty-three attributes at once (plain, interpolated, template, ternary, nullish, unary, member, ARIA, spread, `style:`, `class:` and two handlers), and every expression kind a spread's value can be (a call, a member, an index, an inline object, a ternary, a nullish chain, `Object.assign`) and five more: every DOM event attribute name form including `capture`, pointer, drag, clipboard and animation events; attribute values interpolated in ten part layouts; `class:` directive stacks against a static class, an array, an object and an interpolation; plain attributes whose names are directive keywords (`bind`, `use`, `on`, `transition`, `animate`, `let`); and URL values across nine protocols and shapes and four more: every boolean-attribute spelling (bare, empty, name-valued, `true`/`false`, `undefined`, `null`), every quoting form for a value (unquoted, single, double, braced, interpolated inside each) crossed with a spread before and after, event-handler values in twelve shapes (arrow, block arrow, reference, member, index, ternary, `null`, `undefined`, shorthand, async), and `class`/`style` in their object, array and mixed forms beside the `class:` and `style:` directives and the directive-ordering product: `bind:`, `use:`, `class:` and `style:` on one element in four orders, two actions on one element, three `class:` names that differ only in case and hyphenation, and `bind:this` beside a `class:` and two more: the ARIA and `data-*` attribute-name surface (including `data-camelCase`, `data-UPPER`, `data-0` and a bare `data-`) and attribute names that are Svelte keywords (`slot`, `this`, `key`, `bind`, `use`, `on`, `transition`) used as plain attributes and as prop names and two more: `class:` directives stacked against a static class, an interpolation and an array/object value with a prune grid behind them, and `style:` in its shorthand, valued, custom-property and mixed-with-`style` forms including an interpolated `repeat()` and component callback props in five spellings (`onclick`, `onSelect`, `on_snake`, a defaulted `onchange`, one reached through an object prop) and the class-source product: `class`, `class:`, an array value and a spread that also carries `class`, in five orders and template-literal attribute values — nested, brace-bearing, quote-bearing, with an escaped backtick, a computed member key and a `style:` value and two more: a four-level nested ternary as a `class` value beside its parenthesised and attribute forms, and attribute values that are arrows with brace-bearing parameter defaults, object bodies and block bodies and two more: character references and interpolations mixed in one attribute value across eight spellings, and `style` values carrying `!important`, semicolons inside quotes, a `data:` `url()` and `grid-template-areas` | Attribute normalization and merging |
| `expressions/` | `await` in a template expression, an `{#if}` test and an `{#each}` collection under `<svelte:boundary>` — which both compilers reject without `experimental.async`, kept for that parity — numeric-literal spellings (separators, hex/octal/binary, BigInt, leading and trailing dots, exponents), statement forms (labelled loops with `continue`/`break`, optional catch binding, `switch` fallthrough, `do`/`while`, a labelled block), object keys (quoted, numeric, computed, template-computed, getter/setter pairs, method/async/generator shorthand), import forms (namespace, default plus rename, dynamic `import()`, `import.meta`), `{@html}` over a variable/join/template/nullish in every parent, `}`/`{` inside strings, template literals, regexes, comments and an IIFE in expression tags, plus two shapes official rejects (a `<tr>` directly under `<table>`, a snippet rest parameter) kept for error parity, optional-chain zoo, nested template literals, arrow/generator edge shapes, top-level `try`/`switch`/`do-while`/labels, hoisting order (use before declaration), module/instance interplay, rune-keyword-alike identifier names, shadowed `window`/`document`/`console`, markup syntax inside strings, `{@html}` over a concatenation and a template literal, `{@const}` with array/object destructuring and a default that reads an earlier `{@const}`, TS erasure incl. `generics` attribute, a `<script module lang="ts">` with top-level `await` feeding a typed instance script, comments in every element and block slot, the full operator-precedence and template-literal zoo, and an HTML comment in an attribute list as a rejection, reserved and non-ASCII identifiers (`class`/`for`/`default` as prop names, `_`, `$`, a Unicode letter, Japanese), `{@html}` over quotes, entities, a spliced `</script>` and a template literal, and a `$$`-prefixed local as a rejection, and a statement zoo — labelled `continue`/`break` across nested loops, a generator and an async generator, a class with a private static plus a static block and a static getter, an optional `catch` binding with `finally`, a block-scoped `switch` case, `do`/`while`, and array/object destructuring with elisions, defaults and rests, and an object literal carrying every key and member form at once (shorthand, quoted, numeric, computed, template-computed, getter/setter, method, generator, async, spread) beside an array with an elision and two spreads, and a statement-boundary zoo and four more: every regex-literal shape a `/`-scanner can trip on (a `/` in a character class, an escaped `/`, all flags, named groups, lookaround, `\p{…}`, braces) beside two divisions that are not regexes, `console`/`window`/`document`/`Math` shadowed by locals next to reserved words as class members, the destructuring declaration zoo (nested, elided, defaulted, rest, a swap, a parenthesised assignment), and template expressions in every block position and three more: the optional-chain zoo (member, computed, call, chained call, index, mixed, short-circuit, negated, in a template), every statement form inside an event handler (a labelled nested loop with `continue label`, a block-scoped `switch`, `do`/`while`, `try`/optional-`catch`/`finally`), and nested and tagged template literals including a tagged call nested inside another and six more: every arrow and function form (implicit body, block, object body, curried, async, defaults with a rest, named and anonymous function expressions, generator, async generator), every assignment-target shape (member, computed, quoted, indexed, nested, a swap, two destructuring assignments, elisions with defaults, `length`), every numeric literal spelling including two bigints and `-0`, namespace/default/dynamic imports with `import.meta` across both scripts, and the generated-name collision axis — a component binding a local named `root`, `text`, `fragment`, `node`, `anchor`, `div`, `span` or `event`, and one repeating the same tag deeply enough to exercise the suffix path and two more: optional chaining through every link shape (`?.`, `?.[]`, `?.()`, a chained `?.at?.()`) beside `??=`/`||=`/`&&=` on a member target, and identifiers written with `\uXXXX` and `\u{…}` escapes and the operator surface (`in`, `instanceof`, `void`, `delete`, `typeof`, `new.target`, a sequence expression in a statement and in a template hole, spread in a call, an array and an object, the full bitwise and shift set, `**` and `%`) and three more: destructuring in every statement position (a `for…of` head, a `for…in`, a `catch` parameter, an arrow parameter with defaults, a parenthesised assignment pattern, a swap, an elision with a default), the control-statement forms (labelled `continue`/`break` across two loops, `do…while`, a `switch` with fall-through and a braced case, `try`/`catch`-without-binding/`finally`, a labelled block with `break`), and expressions written long enough that the formatter must break them inside a `$derived`, inside a text run and inside a handler and an object literal in a template hole in nine positions, including one whose string value is a bare `}` and the comparison operators in markup — `<`, `>`, `<=`, `>=` in an expression tag, in a ternary yielding `"<"`, inside an arrow in a `{#each}` head, in an attribute value and in a block header, beside their entity spellings | The JS expression surface inside and around the template |
| `opaque-tokens/` | strings/comments/regexes carrying `console.`, `$.set(`/`$.prop(`, `$$async_hole`, `<script>`, `svelte-ignore`, `await`/`=>` — the tokens the phase-3 scanners search for, and directive-shaped strings that are data — `on:click` / `bind:value` / `use:action` as spread object keys, as an attribute value and as text, with `{#if}` / `{/each}` / `{@html}` as string literals beside them and the same keyword bait in every region of one file — a `//` comment, a `/* */` comment, a string, a template literal, a regex literal and an HTML comment — crossed with both entry points (a component instance script and a `.svelte.js` module) and two more bait files: every rune token spelled inside a `//` comment, a `/* */` comment, a string, a template literal and a regex beside the real runes, and markup-level bait — `{#if}`/`{/each}`/`{@html}`/`$.set(`/`$$async_hole`/`svelte-ignore` as string values and attribute values and two more: nested templates, a regex inside a template, comment-lookalike strings and an escaped backtick beside a real rune, and rune names appearing as text in markup, an expression string, an attribute, a markup comment and a CSS comment and string | Scanner-bait: every token a raw byte-scan looks for, in a position where it is data |
| `components/` | spread interleaved with `bind:this` and a `--css-prop` in both orders, a wrapping class list and a multi-line attribute value, `<svelte:self>` recursion passing a snippet as a prop and receiving `children` through a `{#snippet}` block, member/namespace/derived component instantiation, component-or-value dual use, spread events onto components, children whitespace forms, spread interleaved with `bind:value`/`bind:this` in both orders, `<svelte:component this=…>` against a `$derived`/table/ternary callee, reserved words as prop names, every children form (text, expression, snippet, `children` as a prop, empty, self-closing), `<svelte:self>` recursion carrying a snippet, `<select>` in five shapes (keyed each, `multiple`, `<optgroup>` with a conditional option, uncontrolled with a bare `<option>`), a component that imports itself and also uses `<svelte:component>` with a nullable `this`, and `<svelte:self>` at the root as a rejection, and a self-importing component carrying `bind:this` on both an element and the recursive instance while an each-indexed `bind:value` writes into a `$state` array of class instances with a getter, and a three-level namespaced component (`<UI.Card.Header>`) beside `<svelte:component>` over a table lookup and a ternary, inside a keyed `{#each}` and a self-importing component that passes a `depth` prop down and receives `children` through a `{#snippet}` block, terminating on a leaf branch and four more: the callee forms (self-import, a table member, a three-level namespace, `<svelte:self>`), a snippet passed as a prop beside a `children` block, an event handler interleaved with a spread in both orders and a spread twice, and prop names that are reserved words, hyphenated or quoted and three more: `bind:value`/`bind:this` chains through `<svelte:self>` with a `$bindable` object prop, `<svelte:component this=…>` over a direct reference, a table member, a `$derived`, a `$state` and a ternary, and a self-import carrying `bind:this`, `bind:value`, a spread, a `--css-prop` and a class in one attribute list and three more: children in six forms (text, expression, a `{#snippet children}` block, empty, self-closing, mixed elements and blocks), a spread interleaved with a same-named prop and a handler in four orders, and component and prop names that collide with generated identifiers and a component instantiated inside `{#key}` and inside a keyed `{#each}` while `bind:this` holds the instance and `<svelte:component this={…}>` given a static reference, a table lookup, a ternary and an `{#each}` item and two more: a dotted component name at one and two levels beside the `<svelte:component>` spelling of the same reference, and a spread interleaved with an explicit `{#snippet children}`, with element children, and with a second spread and 20 props in every value shape on one element beside a 20-attribute element and the component-name spellings a tag accepts — a single capital, a digit suffix, a trailing `$`, a non-ASCII capital and a mixed `A_b$1` and a context chain set and read through four levels of self-recursion under both a symbol and a string key and a spread threaded through four levels of self-recursion, each level adding a property | Component reference and instantiation forms |
| `special-elements/` | `<svelte:options preserveWhitespace />` over text, inline siblings and `<pre>`, `customElement` in its full object form (tag, shadow, reflected typed props, `extend`), `<svelte:head>` carrying an interpolated `<title>`, a conditional `<link>` and a `<style>`, `svelte:options`/`head`/`window`/`document`/`body` in one component with bound and handler attributes, and `<svelte:boundary>` with an `onerror` reset around a `{#key}` whose body throws, next to its `failed` snippet, the whole `<svelte:window>` / `<svelte:document>` / `<svelte:body>` binding and handler surface in one component, a `<svelte:head>` carrying `{#each}` / `{#if}` / `{#key}` and a nested `<style>`, `<svelte:element this={…}>` across a literal, a ternary, an array index, a concatenation and an SVG child, and `<svelte:options namespace="svg" css="injected">` over a `<foreignObject>`, `<svelte:options runes={false} immutable>` over three `$:` forms including a destructuring one, and a root `<svelte:fragment slot=…>` as a rejection, and a `<svelte:head>` mixing an interpolated `<title>`, a keyed `{#each}` of `<meta>`, an if/else `<link>`, `{@html}` and a scoped `<style>`, and `<svelte:element>` carrying `bind:this`, `class:`, `style:`, `use:` and an event handler in one attribute list, over a static and a ternary tag, and `<svelte:head>` with an interpolated `<title>`, a conditional `<link>` and a `<meta>`, next to `<svelte:window>` carrying a renamed binding, two shorthand bindings, and `<svelte:document>`/`<svelte:body>` handlers and three more: `<svelte:head>` carrying an interpolated title, a keyed `{#each}` of `<link>`, an if/else `<meta>`, a `{#key}`, `{@html}` and a nested `<style>`; `<svelte:element>` over a literal, a variable, a member, an index, a ternary, a concatenation and `null` with a full directive stack; and `<svelte:options namespace css>` around a `<svelte:boundary>` with `pending` and `failed` snippets and `<svelte:window>` carrying all eight window bindings with two handlers, beside `<svelte:document>`'s `visibilityState`/`activeElement` and `<svelte:body>` handlers and two more: nested `<svelte:boundary>` with `pending` and `failed` snippets and a bare one, and the full `customElement` option object (tag, shadow, per-prop `attribute`/`reflect`/`type`, `extend`) and three more: the full `<svelte:window>`-adjacent binding surface on `<svelte:document>` and `<svelte:body>`, `<svelte:head>` carrying a title, meta, links, a block, an `{#if}` and a nested `<style>`, and `<svelte:options>` with `namespace`, `preserveWhitespace` and `css` set together and `<svelte:boundary>` with `onerror` as a reference and as an inline arrow, with `failed` and `pending` snippets, and nested inside another boundary and two more: `<svelte:head>` carrying `{@html}` with an escaped `</script>` and an expression-built `<meta>`, and an explicit `<svelte:options runes={true} />` and `<svelte:head>` with a `{#if}`-selected `<title>`, duplicate `<meta>`/`<link>` and a `<title>` outside the head and `<svelte:window>`/`<svelte:document>`/`<svelte:body>` under legacy `on:` syntax with a modifier and a binding on the same tag and `<svelte:options preserveWhitespace />` over runs of spaces, newlines, a `<pre>` and an interpolation | The `svelte:*` special elements as a group |
| `typescript/` | `satisfies` / angle-bracket and `as` casts / `as const`, a `generics=` component with a constrained type parameter, every class member modifier the compiler must erase (`readonly`, `public`/`protected`, `declare`, `static`, a `this` parameter, a parameter default) plus the `accessor` field official rejects, type-only imports and `export type`, non-null `!` chained with `?.` and `?.[]`, and a `.svelte.ts` whose `enum` `compileModule` rejects because it parses plain JS, non-null/optional/`as`/`satisfies`/angle-bracket assertion chains, a `generics=` component whose parameter is used in a `keyof` position, and mapped/conditional/template-literal types around an abstract class (an abstract *method*, because official leaves `abstract` on a *property* and emits text acorn rejects — `upstream_issues/3082`), a `generics=` parameter list whose constraint carries a comma, a local generic alias with a default, and a constrained generic function used from the template, and a two-parameter `generics=` component whose snippet parameter carries a defaulted generic, beside `satisfies`, `as const` and a `keyof`-constrained helper, and a `.svelte.ts` module whose runes are exported through an object getter, an instance script with annotated locals and props, and a class whose rune fields carry type annotations and three more: the erasure surface in one component (`interface`, `type`, a non-null assertion, `as`, `satisfies`, `as const`, an angle-bracket cast, a constrained generic function, and the class modifiers `declare`/`readonly`/`protected`/`static`), a `generics=` component with two parameters and an object-typed `$props()` annotation, and a `lang="ts" module` script exporting a type and mutable state that the instance script reads and the assertion-chain surface (`satisfies` on an array literal and on a member, a non-null assertion, a double `as unknown as`, an angle-bracket cast, `as const`, an optional-call chain and a type predicate) and a `generics` attribute declaring two parameters, one constrained by `keyof` the other, used in a `Props` interface, a default value and a local generic function and two more: type-only imports and exports in every spelling (`import type`, an inline `{ type X }`, `export type { … }`, an `export type` alias, a `typeof import(…)` self-reference) and the declaration forms that survive erasure (`declare const`, an abstract class, a `readonly` field, a definite-assignment field, an overload set) and the generic-and-assertion surface (`as const`, `satisfies`, a chained `satisfies … as`, a constrained two-parameter generic function, a mapped type, a variadic tuple, a type predicate, and `satisfies` inside a template expression) and a `<script lang="ts" module>` exporting a type, an interface and a `$state<number>` that the instance script reads and template-side narrowing — a discriminated union narrowed by `{#if}`, by a type predicate, an optional chain and an inline `as` | TypeScript erasure and the two shapes official refuses |

Files held back from this sweep (screened but **not** landed): one
formatter-parity hold (`nested-script-style-elements`), blocked on an oxfmt
oracle crash (the other four landed once their formatter fixes shipped:
`unicode-line-separators` / `nbsp-ideographic-space` in `text-and-entities/`
after #3046, `textarea-value-forms` in `elements/` after #3060, and
`regex-zoo` in `expressions/` after #3047 — whose mechanism was the collapse
re-parse silently skipping any file where the JS printer's paren-stripping
produced a `{/regex…}` tag); `comment-hostile-slots`, whose rune-lowering
comment placements #3059 fixed on every target but which is still held on a
formatter-parity divergence (rsvelte keeps the `{#each … as [,]}` elision
where the oxfmt oracle prints `[]`); and the BigInt/number-mix shape,
which crashes the OFFICIAL compiler with an uncoded TypeError (#3054,
`upstream_issues/`). An object **rest** inside a `let:` value (`let:v={{ a, ...r }}`) is
held for the same reason one level out: the compiler accepts it on every target, but
`svelte2tsx` throws `Cannot read properties of undefined (reading 'type')` out of
`handle_prop`, which reads `.value` off a `RestElement` (#3132, `upstream_issues/`) — the
array rest beside it converts fine, so only the object spelling is held. A `let:` directive whose value is a top-level default
(`let:total={t = 0}`) is held for the same reason: official's client visitor is a
two-way choice between an object and an array literal and reads `.elements` off
the assignment, so esrap throws — while its own server target compiles the same
component (#3123, `upstream_issues/`). The compiler divergences the sweeps found (#3030–#3045,
#3055–#3058) are all fixed and landed — each as a distilled repro in `issues/`
plus, where the original zoo file carries more surface than the repro, the zoo
file itself in a theme directory above. #3057 (a comment between an `{#each}`
pattern and `}` compiled where official rejects) has no corpus repro by nature —
its inputs are programs official rejects — and is pinned by
`crates/rsvelte_core/tests/each_header_comments.rs` instead.

The 2026-08 module-and-layout sweep held back three more, each an rsvelte-side
divergence with an issue rather than a formatter or upstream problem:
`snippets/snippet-parameter-patterns` (#3556 — a nested array pattern in a
snippet parameter emits its `$$array` derived after the leaf bindings, where
official emits it before) and `expressions/new-and-call-shapes`, which carries
two at once (#3555 — a spread argument does not stop a `globals` call from
reading as known-defined, so `Math.max(...xs)` loses its `?? ''`; and #3557 — a
pure-global call over a never-written `$state` folds to the right value but
keeps a text node where official assigns `textContent`). All three are client
and client-dev only; the server target is byte-identical on both files, which is
what named the client's own port of `scope.evaluate` as the site for two of
them.

Its second half held back five more, and three of those were caught by a gate
other than the compiler comparison — which is why every candidate here is run
against the formatter and svelte2tsx as well:
`expressions/operator-precedence-zoo` (#3570, a declaration whose initializer
contains an equality operator is never folded in dev and gets a spurious
`template_effect`, plus #3249); `bindings/bind-group-shapes` (#3576, every
`bind:group` inside one `{#each}` collapses onto that block's single group name,
so two different targets share a group at runtime);
`modules/module-rune-declarator-layouts` (#3577, a top-level
`const x = /* c */ $derived(…)` is lowered but its reads are not called on the
server); `attributes/attribute-quote-hostility`, where a single-quoted value
carrying `"` has no fmt fixed point because the oracle normalizes the quotes; and
the `style:x|important` shorthand, #3578 — an upstream svelte2tsx defect recorded
in `upstream_issues/`, where rsvelte's output is the *correct* TSX and official's
references a free `important`. The fmt oracle rewrites `style:x|important={x}`
into that shorthand. The correct rsvelte output is pinned as a deliberate
divergence, while both spellings remain outside the equality corpus until
upstream fixes the semantic defect.

Its third half held back two more, and one of them is the sweep's largest find.
`elements/nested-namespace-switching` is #3582: an element whose tag name is a JS
reserved word makes the client name its variable after the tag, so `<var>x</var>`
— a standard HTML element, no runes, no expression — emits `var var = root();`.
**42 of 46 reserved words** produce output no JS parser accepts, `<var>` and SVG
`<switch>` among them; the four that pass (`async`, `of`, `get`, `set`) are
exactly the four that are not reserved. `<svelte:element this="var">` and the
server target are clean, so the site is the client's own name allocator
(`Memoizer::generate_id`), which has three of upstream's four membership tests
and not `is_reserved`. The other hold was `css/css-comment-placements`: #3580
reproduced the fmt oracle's source-indent passthrough for a comment-bearing
selector list, so its selector-list block now carries the discriminating tabs.

The fourth pass held back four, two of them found by a gate other than the
compiler comparison: `special-elements/custom-element-option-forms` in its
original shape is #3587 — under `<svelte:options customElement>`, an accessor
setter serializes the **ESTree node** as its default, so `let { p = {} } =
$props()` emits `$$value = { "type": "ObjectExpression", "start": 118, … }`,
which parses and is wrong; the clean set is exactly the `Literal` defaults, 12
of 21 leak. `css/css-prune-subjects` lost its `<svelte:element>` row to #3564,
which the sweep also showed is not about `use:` at all — a plain `class`
attribute on `<svelte:element>` reproduces the same one-character svelte2tsx
deficit. `expressions/comment-in-every-expression-slot` is #3112 (a comment on a
constant-folded template expression is dropped rather than flushed onto the next
node), and a duplicate `<svelte:head>` is `svelte_meta_duplicate` on both sides,
so it is an error-parity case rather than an output one.

The fifth pass held back nothing on the compiler gates, and its one find is a
position rather than an output. `expressions/unicode-escape-identifiers` was
written for the `\uXXXX` spelling of an identifier and diverged on a
`state_referenced_locally` column instead — the unicode was a red herring, and
plain ASCII reproduces it: a `$state` read used as a **computed property key**
is reported at the `[` rather than at the identifier inside it (#3590). The
computed **member** rows beside it (`window[s]`, `o[s] = 1`) are correct, so the
axis is the `key` slot of a `Property` / `PropertyDefinition` /
`MethodDefinition`; a computed key in an `ObjectPattern` is a second arm that
emits no warning at all. `js.code` is byte-identical on client and server for
every cell, so no output gate can see it — the file landed with that one line
removed.

The sixth pass is the one that paid for the whole exercise: three rsvelte-side
divergences and an upstream crash, from fourteen candidates.
`opaque-tokens/keyword-in-every-opaque-region` is #3592 — `skip_opaque` handles a
backtick in the same arm as `'` and `"`, scanning to the next copy of the same
byte, so a **nested** template literal leaves the scan in "code" and a rune name
inside it is lowered. That predicts a parity signature and the measurement has
it: depth 2 and depth 4 are rewritten, depths 1, 3 and 5 are correct, which no
story other than a boolean toggle produces. It is `compileModule`-only and the
output parses, so it is the third member of the #2987 / #2988 family and the
first where the opaque region is nested rather than misidentified.
`opaque-tokens/tag-lookalikes-in-strings` is #3593, the opposite direction: a
`</style>` inside a CSS string or comment ends the block, so rsvelte **rejects**
a component official compiles and scopes verbatim.
`css/attribute-selector-operators` is #3595, and its 6x5 grid separates two
causes running in opposite directions — a valueless attribute is `""` to rsvelte
and `true` to official (an under-prune, dead CSS ships), while `[a~=""]` is
pruned where official keeps it (an over-prune, a live rule is deleted). And
`typescript/declaration-forms` was landed only after its index signature came
out: `class S { [k: string]: unknown }` crashes the **official** compiler with an
uncoded `TypeError` out of esrap's `TSIndexSignature` printer, which visits a
`typeAnnotation` the line above it already guards as optional
(`upstream_issues/svelte-class-index-signature-crash.md`). rsvelte compiles all
three hosts, so the shape cannot be in the corpus at all.

The seventh pass held back two, and both are grids rather than single files.
`components/spread-with-snippet-children` was written for spread ordering and
tripped over its own `const props = { … }`: a local binding named after a rune
makes that rune a **store subscription** upstream, and rsvelte gets it wrong for
6 of 10 runes in four different ways at once (#3597) — the legacy-flag import
missing for `$state`, `$props` and server `$bindable` not recognised at all,
`$derived` / `$state.raw` / client `$bindable` recognised and then lowered as
runes anyway, and `$props.id()` recognised where official does **not**. The
three that are right — `$effect`, `$effect.pre`, `$inspect` — are exactly the
ones already gated by `get_rune` returning null, which is the #3128 mechanism.
`special-elements/svelte-self-and-fragment` is #3598, the `directive-element`
shape one rule over: the `slot` attribute rule is missing `<svelte:self>` from
its component-like parents (an over-rejection) while the `<svelte:fragment>`
rule has `<svelte:element>` in its list where official does not (an
over-acceptance). Each rule has the other host right, so neither is a missing
element kind.

The eighth pass held back two, and rsvelte is the more correct side of both.
`expressions/deep-member-and-call-chains` is #3600: an over-width object or
array literal with **exactly one member** is never broken across lines, at any
width, on either target. One-member literals normalize back to equality on their
own, so the case that reaches the gate is a nested one — oxfmt preserves a
per-object newline-after-`{`, so once official's break puts one after an *inner*
`{`, the flat form no longer normalizes to it. And
`snippets/snippet-names-shadowing-components` cannot be in the corpus at all:
a snippet whose name collides with an **import** or with a `<script module>`
declaration makes the official compiler emit output no JS parser accepts
(`Identifier 'Thing' has already been declared`), while the same collision with
an instance-script binding, a prop or another snippet is correctly
`declaration_duplicate`. rsvelte rejects all eight
(`upstream_issues/svelte-snippet-name-colliding-with-an-import.md`).

The ninth pass held back one file that carries two defects, and the shape of the
authoring loop is the lesson: `control-flow/block-header-comments-and-spacing`
took six rounds to write, because the **fmt oracle** rejects three comment
positions the compiler accepts (`{#each rows as /* c */ row}`, a comment in an
`{:else if}` header, and a comment between `then` and its value), so each round
moved the reported error to the next construct. Once it parsed, it reported two
rsvelte defects at once. #3602: a `//` comment as the last token before a
template expression's closing `}` is **rejected** — `{#if flag // c⏎}`,
`{#key}`, a bare expression tag, an attribute value and `{@html}` all give
`js_parse_error` and `{@render}` gives `render_tag_invalid_expression`, while
the leading position, `{#await … // c⏎then v}` and `{@const}` are all fine.
#3603: a **block** comment inside a template expression is dropped in 17 of 24
host/target cells — and three of those rows diverge on exactly one target, so
the client and server visitors lose comments in different places rather than
sharing one site.

The tenth pass held nothing back for an rsvelte defect — every one of its
thirteen files landed — and its find is in the oracle instead. `oxfmt` 0.63.0
with `svelte: true` cannot print a destructuring default inside an `{#each}`
head: `` `d${id}` `` aborts with `unknown node type: TemplateLiteral`, `id + 1`
with `BinaryExpression`, `f()` with `CallExpression`, while literals, arrays and
objects are fine — so the printer has a missing-case list, not a parse failure.
The same printer **silently drops the property key** when a property has both a
non-shorthand target and a default: `{ id, nested: renamed = 0 }` formats to
`{ id, renamed = 0 }`, which still compiles and reads the wrong property. Both
compilers agree on every one of those rows, so this is a formatter gap alone —
recorded in `upstream_issues/oxfmt-each-pattern-default-unknown-node-type.md`,
and the reason `control-flow/each-destructuring-defaults` carries its
non-literal defaults in a `{@const}` and a `{#snippet}` parameter rather than in
the `{#each}` head.

The eleventh pass held back two, one of them a defect with an unusually small
target that now lands as `legacy/legacy-export-renames-and-const`. #3607 made an
exported **class declaration** need *two* references to clear `export_let_unused`, where one is
enough for `function`, `let`, `const`, `var`, an `async function`, a generator
and a class **expression** assigned to a `const`. Zero references warn on both
sides and two clear on both sides, so the threshold is off by exactly one and
only for a `ClassDeclaration` binding. The remaining hold,
`legacy/legacy-mixed-event-syntaxes`, is
not a defect: `mixed_event_handler_syntaxes` is raised per **component**, not
per element, so splitting the `on:` and `on…` spellings across sibling elements
does not help — both compilers reject it with the identical code on every
target.

The twelfth pass held back one file, for a defect with a clean negative control.
`text-and-entities/script-with-only-a-comment` is #3608: on the **server**
target the *last* comment in the instance script is dropped. A comment before a
statement survives and one after the last statement does not, so the axis is
trailing position rather than "the script has no statements"; `<script module>`
is correct, which places it in the instance program's own printer rather than in
comment handling generally. With no markup at all the shape is at its cleanest —
official emits a function whose body is the comment, rsvelte emits
`function X($$renderer) {}`.

The thirteenth pass held back one file and found a second oracle bug.
`control-flow/shadowing-across-scopes` is #3609: a `{@const}` that shadows an
**enclosing** `{#each}` item is still read reactively, so official assigns
`textContent` once where rsvelte emits a text node, a `$.reset` and a
`$.template_effect`. Two rows pin it — renaming the const so it shadows nothing
makes both eager, and moving the shadowed item inward so the same block declares
it makes both non-eager — and no `$state` is involved anywhere in the grid. The
oracle bug is the second of its kind: `oxfmt` normalises a single-quoted
attribute to double quotes **without escaping**, so
`<div title='he said "hi"'>` becomes `<div title="he said "hi"">`, which the
Svelte parser rejects
(`upstream_issues/oxfmt-single-quoted-attribute-containing-a-double-quote.md`).
That is why `attributes/style-attribute-important-and-quotes` carries its
semicolon-in-a-string row single-quoted only in the CSS value, never in the
attribute delimiter.

The fourteenth pass aimed at the scan-based paths that produced #3592 and #3602,
and held back one file. `modules/comments-around-runes` is #3610: a **trailing**
comment on a line whose `$derived` read gets rewritten lands *inside* the
synthesized `$.get(…)` in official's output — `return $.get(d // trailing⏎);` —
and after the statement in rsvelte's. Its negative controls are the useful half:
no comment, the comment on its own line, or no rewritten read on the line all
agree, so the divergence needs a rewrite **and** a same-line comment. The other
eight comment positions in that file match, as do all nine delimiter-bearing
rune arguments and every rune position a module admits.

The fifteenth pass held back one file from the dev-only console transform.
`issues/3619-console-wrap-scope` is #3619: a function parameter that shadows a
same-named component binding must be evaluated in the function's lexical scope,
not as the outer `$state` binding. Upstream therefore wraps `console.log(a)` for
`function f(a)`, while rsvelte skipped it. The regex declaration in the same
file is the opposite-direction control: a regex literal is a known value, so
`console.log(r)` must stay unwrapped even though its source text contains a rune
spelling. Together the two rows pin both answers of the console-wrap predicate;
the corpus file itself is a provenance repro because the normal corpus targets
do not enable `dev`.

`adversarial/legacy/store-sub-shadowed-local-binding.svelte` pins the lexical
boundary between template store subscriptions and instance-script locals. The
template's `$translator` creates a component store-sub binding, while the same
spelling is deliberately declared inside a function. A name-only script pass
used to rewrite both the local declaration and its call, producing JavaScript
with a missing `const` initializer in the AdventureLog corpus.

## Adding a file

See [Adding a pattern file](../../scripts/compat-corpus/README.md#adding-a-pattern-file).
