# SCSS backend parity — known failures

`rsvelte_preprocess` compiles Sass/SCSS with [`grass`](https://docs.rs/grass), standing in for
dart-sass. Nothing compared the two until `scripts/compat-corpus/scss-verify.mjs`
(`pnpm run corpus:scss`) existed: the crate's tests port the upstream packages' **own** unit tests
— language filtering, indented-syntax selection, a small nesting sample — which exercise the
wrapper's dispatch, not the CSS compiler. The substitution was therefore an assumption, not a
measurement.

The gate compiles every `<style lang="scss"|"sass">` block and every standalone `.scss` / `.sass`
file in the corpus source repositories with both backends and compares the CSS byte-for-byte after
trailing-whitespace normalisation. `scss-known-failures.json` holds **315 entries** and may only
shrink; it is two-sided, so an entry that starts agreeing fails the run until it is
re-baselined in the same PR.

## What the population is, and what it is not

The first run measured 118 units: **64 match**, **30 diverge**, and **24 are compared only as
"both backends reject"**. Read the denominator as 94, not 118 — a both-reject pair is parity, but
it is parity on a comparison that never reached the CSS.

**After the wave-2 enrolment (#3130) the population is 3,033 units**: 1,762 match, 216 diverge on
the CSS, 99 are inputs `grass` rejects and dart-sass accepts, and 956 are both-reject. The
denominator is therefore 2,077, and `grass` agrees with dart-sass on **84.8%** of it. Treat that
as the current size of the "near-substitute, not drop-in" claim — it was measured on 94 units
before, and the 25× larger population did not change the verdict, only its precision.

Two consequences worth stating rather than discovering later:

- **A both-reject pair does not compare the two error messages.** Two backends rejecting one input
  for unrelated reasons score identically to two backends agreeing. This is the same shape the
  shape-matrix gate had before #2583 taught it to compare error codes; SCSS error text is not
  comparable across implementations, so the gate does not try.
- **The corpus is Tailwind-era Svelte, so SCSS is rare.** 101 of the original 118 units came from
  two repositories (`attractions`, `powertable`), and the prediction recorded here was that
  adding one SCSS-heavy repository would grow the gate where more Tailwind libraries would not.
  The enrolment paid that out: 15 repositories now contribute entries, led by
  `svelte-material-ui` (67), `mathesar` (46), `carbon-components-svelte` (41), `huly` (34) and
  `musicat` (33) — all of them SCSS-era codebases, none of them Tailwind-era.

`scripts/compat-corpus/scss-verify.mjs` builds a `node_modules` symlink shim from every
`package.json` in the corpus and hands it to **both** backends as an extra load path. Without it,
`attractions`'s self-referencing `@use 'node_modules/attractions/_variables'` fails to resolve and
65 of its stylesheets fall into the both-reject bucket — the gate would have looked green while
comparing almost nothing.

Partition of `scss-known-failures.json` by verdict: `216 + 99`

- **216 — the CSS differs** (`css-mismatch`).
- **99 — `grass` rejects an input dart-sass compiles** (`grass-rejects-accepted`). This is the
  half a text diff cannot describe, and it is a third of the list.

The clusters below are a **diagnostic ordering of the `css-mismatch` half, not a partition**: the
gate prints one differing line per unit and 192 of the 216 produced one, so the counts sum to 192.
The original five clusters were written when the whole ratchet was 30 entries; each is still the
same mechanism, at the size the enrolment found.

| n | cluster | changes the cascade? |
|---|---|---|
| 71 | declarations after nested rules (cluster 2 below) | **yes** |
| 44 | indentation of a nested rule | no |
| 32 | colour serialisation (cluster 1) | no |
| 26 | a trailing `/* … */` dropped (cluster 4) | no |
| 11 | attribute-selector quote style — dart-sass keeps `'`, `grass` prints `"` | no |
| 8 | a comment `grass` emits before the block dart-sass emits it after | no |

## Six `date-picker-svelte` entries moved when the abort stopped happening

`grass` asserts that an indented-Sass document's top-level indentation is zero and **aborts** on a
`<style lang="sass">` block, whose body carries the surrounding file's indentation. Dart Sass reads
that shared prefix as the document's base indentation instead. `remove_indented_base` existed for
this, but it was reached only from a `catch_unwind` — and every shipped binary except the three
with an explicit `panic = "unwind"` override is built under `panic = "abort"`, so the fallback
never ran where it mattered and the process died. Removing the base *before* `grass` sees the
document made six units compile that previously aborted: three now agree with dart Sass and left
the ratchet, three compile to different CSS and moved from `grass-rejects-accepted` to
`css-mismatch` (one each into the three clusters above). The leading blank line is part of the
condition, not incidental — dart Sass rejects a document whose very first line is indented, so
dedenting that shape would make rsvelte accept what dart Sass refuses.

The one cluster that changes rendering is also the largest, which was not true at 30 entries.

Each cluster section below closes with the files that carried it **when the ratchet was 30
entries**. Those lists are kept as the worked examples that named the mechanism; they are no
longer the cluster's membership, which is now the counts in the table above.

## What the 315 entries are, measured

The clusters below were written by reading the first differing line of each unit, which is what
`--list` prints. That answers "what does the text differ in", not "can it change rendering" — and
the two come apart: a colour printed as `rgba(86, 86, 92, 0.1019607843)` on one side and
`#56565c1a` on the other is the same colour, while a declaration that merely *moved* is a cascade
change with no textual smell at all. The split below is computed instead of read:

`scripts/compat-corpus/scss-classify.mjs` parses both CSS outputs and flattens each to a list of
`(selector chain, property, value)` in document order; values are normalised for whitespace,
quoting and **colour** (every `#hex` of 3/4/6/8 digits, `rgb()/rgba()`, `hsl()/hsla()` with or
without `deg`, and the named colours are folded to one `rgba(r,g,b,a)` spelling, RGB channels
rounded to 8 bits and alpha to four decimals — that rounding is the tolerance, and it is what
makes dart-sass's `rgb(100%, 41.3333333333%, 20%)` equal to `grass`'s `#ff6933`). Then

- **equal lists** → the divergence cannot change rendering;
- **equal multisets, different order** → the cascade changes;
- **different content** → a value differs.

| class | n | meaning |
|---|---|---|
| render-neutral | **155** | comments, whitespace, quote style, colour spelling |
| order-differs | **59** | the `mixed-decls` class — a declaration written after a nested rule |
| content-differs | **2** | a genuinely different value |
| `grass` rejects an accepted input | **99** | five causes, each with an `upstream_issues/` report |

**The last row is a different severity, and this ratchet folds it in with the other three.**
The first three classes are units where both compilers produce CSS and the CSS differs; the
fourth is units where **`grass` does not compile the input at all**, so a consumer's build
fails rather than renders differently. `scss-known-failures.json` carries one entry shape for
both, which makes the count read as one severity:

| n | severity | what a consumer sees |
|---|---|---|
| 155 | render-neutral | nothing — comments, whitespace, quote style, colour spelling |
| 59 | wrong cascade | the `mixed-decls` class: a declaration written after a nested rule is hoisted |
| 2 | wrong value | `grid-row: 0.4`, which a browser drops |
| **99** | **does not compile** | `sass:color` API 35, `*.import.scss` 32, explicit `.scss` extension 28, relative colour 3, `@apply` `!` 1 |

155 + 59 + 2 + 99 = 315. Splitting the ratchet is a separate decision; recording the split is
not, because a single number reads as a single severity.

**How the population last grew is worth one line, because it did not grow from the corpus.**
`pattern-corpus/issues/indented-sass-error-position.svelte#style0` is a `grass-rejects-accepted`
unit that #3967 added as a repro and did not list here, so it entered as a NEW divergence rather
than a ratcheted one. It went in because this gate was red for an unrelated reason on that PR —
`Build the grass side of the gate` failed to compile (`error[E0609]` on an oxc field rename), so
the comparison never ran, and the PR merged with nine jobs red. A gate that is red for a reason
unrelated to what it measures stops being read, and a real NEW arrives under cover of that noise;
this is the failure mode one step earlier than #2405's "a skipped gate reads as a passing one",
because nothing was skipped. It needs no entry here: the indented-Sass base removal that landed
after #3967 makes the unit compile, so the gate reports it as a match rather than a divergence —
which is why the count above is unchanged by it.

**There is no upstream fix to take for any of them.** crates.io's newest `grass` is 0.13.4
(2024-08-04), which is what this repository locks; `master` has two commits since, one of them
packaging-only, and its single functional change (a `string.split` overflow) appears in none of
the justifications here. The seven `upstream_issues/grass-*.md` reports are all written against
0.13.4 and none is fixed upstream — whether they were *filed* is `unrecorded`, which per
[`upstream_issues/README.md`](../upstream_issues/README.md) means unrecorded rather than unfiled.

Run the same classification with colour folding **off** (drop `CANON_COLORS=1`) and it reads
111 / 51 / 54: the 44 units that move are all colour spelling, with identical computed colours.
Both numbers are reported because "cosmetic" is a line someone drew, and this is where it sits.

The flattener is hand-rolled rather than postcss, so the script needs no dependency this
repository does not already declare. It was written against a postcss implementation and agrees
with it on **216 of 216** rows under both colour settings; that agreement is the control, since a
flattener that silently dropped nodes would report everything as render-neutral.

## The two `content-differs` units are real, and one ships broken CSS

```
musicat/src/App.svelte#style0
  dart-sass:  grid-row: 2/5   grid-row: 2/5   grid-column: 1/5
  grass:      grid-row: 0.4   grid-row: 0.4   grid-column: 0.2
```

`grid-row: 0.4` is not a valid value, so the browser drops the declaration — this is the only
entry in the ratchet that produces output a browser rejects. **Three** declarations in that file
are corrupted, not the one the ratchet's first differing line shows.

**The obvious reduction is wrong, and it fails in the direction that reads as a fix.** "`grass`
evaluates `2/5` as division" describes nothing: the two agree on `a { grid-row: 2/5 }`, on the
same rule inside `@media`, on `$n/5` (both divide, dart-sass with a `slash-div` warning) and on
`calc(2/5)` (both fold to `0.4`). The trigger is the Sass **`not` keyword followed by `(`**, in a
rule **nested inside another rule** — `:nots(`, `:xnot(`, `:is(`, `:and(`, a bare `:not` with no
paren, and `:not(` at the top level all keep the list. And the corrupted declaration need not be
the one under `:not` at all: **once triggered, every later slash list in the file divides** —
a sibling rule, the parent rule, a deeper rule, and a rule after the whole nested block. That is
why the ratchet's count understates it and why the pin asserts four positions rather than one.
See
[`upstream_issues/grass-slash-list-divided-inside-a-nested-rule.md`](../upstream_issues/grass-slash-list-divided-inside-a-nested-rule.md).

The second `content-differs` unit is
`carbon-components-svelte/.../tabs/_tabs.scss`, where the universal-selector reset rule
(`.bx--tabs *, .bx--tabs *::before, .bx--tabs *::after { box-sizing: inherit }`) lands in a
different place.

## Cluster 1 — colour serialisation (part of the 155)

dart-sass ≥ 1.79 serialises a computed colour in the space its channels were computed in, so
`color.adjust` / `lighten` / `darken` results print as `rgb(92.6666666667%, …)` and
`rgba(255, 64, 0, 0.6117647059)`. `grass` prints the legacy shortest form — `#ececec`,
`#ff40009c`, `darkgray`.

**Same colour, different spelling**, confirmed by folding both to `rgba()` above: no rendered
pixel changes. They are still listed rather than normalised away in the gate, because a normaliser
that folds every colour form would also fold a genuine colour-arithmetic divergence, which is
precisely the class this gate exists to catch.

## Cluster 2 — declarations after nested rules (the 59)

```scss
.btn {
  @include appearances.button;   // emits nested rules
  background: none;              // …then a declaration
}
```

dart-sass ≥ 1.77 (the `mixed-decls` change) emits that declaration **where it was written** — a
second `.btn { background: none; … }` block after the nested rules. `grass` still hoists it into
the first block.

**This one changes the cascade**, so it is not cosmetic: a hoisted declaration loses to a
nested-rule declaration it was written to win against. It is the highest-value cluster in this
ratchet and the reason the gate was worth building. Reported in
[`upstream_issues/grass-hoists-a-declaration-written-after-a-nested-rule.md`](../upstream_issues/grass-hoists-a-declaration-written-after-a-nested-rule.md).

The `.md` used to list seven files here. After the wave-2 enrolment the class is **59** units and
its centre of mass moved: `carbon-components-svelte` 38, `attractions` 7, `mathesar` 5, `musicat`
3, `networking-toolbox` 2, and one each from `appwrite-console`, `date-picker-svelte`, `huly` and
`powertable`. Sizing a cluster from the file list a pre-enrolment run happened to print
understates it by an order of magnitude.

## Cluster 3 — `grass` panics on the indented syntax

Every `lang="sass"` block in `date-picker-svelte` aborts `grass` with an assertion failure in
`grass_compiler-0.13.4/src/parse/sass.rs:200`. dart-sass compiles all six.

**A panic, not an error, and `catch_unwind` cannot contain it** — the release profile aborts
rather than unwinds, so the helper announces each unit's index on stderr and the gate resumes past
whichever one it died on. The shipped `preprocess_sass` has no such recovery, so an indented-syntax
block of this shape takes the whole compiler process down.

## Cluster 4 — comment preservation (part of the 155)

`grass` drops a trailing `/* … */` that follows a declaration on the same line, and rewrites the
leading tab of a continuation line inside a preserved multi-line comment to a single space.
Comments survive into shipped CSS, so this is an output difference a consumer can see, but it
changes no rule — the flattening above ignores comment nodes, and these units land in
`render-neutral` for that reason.

## Cluster 5 — multi-line selector indentation inside `@media` (part of the 155)

A selector list that wraps across lines inside an `@media` block keeps the block's indentation on
every line under dart-sass; `grass` indents only the first.

## The 99 `grass` rejections are five causes, each minimally isolated

| n | cause | report |
|---|---|---|
| 35 | the CSS Color 4 `sass:color` API (`color.channel`, `color.space`, `color.to-space`, `color.is-in-gamut`, `color.same`) is missing | [`grass-missing-css-color-4-api.md`](../upstream_issues/grass-missing-css-color-4-api.md) |
| 32 | a `*.import.scss` file is resolved from `@use` / `@forward`, so the `@import` shim walks back into the module being loaded | [`grass-import-only-file-loaded-by-use.md`](../upstream_issues/grass-import-only-file-loaded-by-use.md) |
| 28 | a specifier carrying an explicit `.scss` extension does not resolve | [`grass-explicit-extension-specifier.md`](../upstream_issues/grass-explicit-extension-specifier.md) |
| 3 | CSS Color 4 relative colour syntax is parsed as a Sass `rgb()` call | [`grass-css-color-4-relative-syntax.md`](../upstream_issues/grass-css-color-4-relative-syntax.md) |
| 1 | Tailwind's `!`-prefixed utility inside `@apply` | [`grass-tailwind-important-apply.md`](../upstream_issues/grass-tailwind-important-apply.md) |

Every one was reduced to a file pair small enough to paste into a report, rather than attributed
from the error string. That mattered twice. The 28 look like a load-path problem in **our** shim
until the probe shows `@use "./vars"` succeeding and `@use "./vars.scss"` failing on the same
directory — the extension is the whole trigger. And the 32 are not a loop in the corpus's
stylesheets at all: deleting the sibling `_functions.import.scss` turns five otherwise-identical
cases green and restoring it turns all five red, which is the ablation that names the cause.

## Running it

```bash
cargo build --release -p rsvelte_preprocess --bin scss_parity
pnpm run corpus:scss                                  # gate
node scripts/compat-corpus/scss-verify.mjs --list     # every divergence, with the first differing line
node scripts/compat-corpus/scss-verify.mjs --update-baseline
```

Both backends are version-pinned so the ratchet is reproducible: `sass` 1.102.0 in the root
`devDependencies`, `grass` 0.13.4 in `crates/rsvelte_preprocess/Cargo.toml`. Bumping either is
expected to move entries; re-baseline in the same PR and update the cluster counts above.

## Attribution

Attribution of `scss-known-failures.json`:

| n | target | cluster |
|---|---|---|
| 155 | `deliberate-divergences` | render-neutral serialisation — colour spelling, comment placement, wrapped-selector indentation, quote style. Pinned by `crates/rsvelte_preprocess/tests/grass_serialisation.rs`. |
| 59 | `upstream_issues/grass-hoists-a-declaration-written-after-a-nested-rule.md` | a declaration written after a nested rule is hoisted above it — the `mixed-decls` class, and the only css-mismatch cluster that changes the cascade |
| 35 | `upstream_issues/grass-missing-css-color-4-api.md` | the CSS Color 4 `sass:color` API is missing, so the input does not compile |
| 32 | `upstream_issues/grass-import-only-file-loaded-by-use.md` | a `*.import.scss` file is resolved from `@use` / `@forward` |
| 28 | `upstream_issues/grass-explicit-extension-specifier.md` | a specifier carrying an explicit `.scss` extension does not resolve |
| 3 | `upstream_issues/grass-css-color-4-relative-syntax.md` | relative colour syntax is parsed as a Sass `rgb()` call |
| 2 | `upstream_issues/grass-slash-list-divided-inside-a-nested-rule.md` | a slash list divides after a `not(`-shaped pseudo-class in a nested rule; `grid-row: 0.4` is CSS a browser drops |
| 1 | `upstream_issues/grass-tailwind-important-apply.md` | Tailwind's `!`-prefixed utility inside `@apply` |

The split is the computed classification of § *What the 315 entries are, measured* (155 / 59 / 2)
plus the five `grass-rejects-accepted` causes (99), not a second reading of the same units.
