# SCSS backend parity — known failures

`rsvelte_preprocess` compiles Sass/SCSS with [`grass`](https://docs.rs/grass), standing in for
dart-sass. Nothing compared the two until `scripts/compat-corpus/scss-verify.mjs`
(`pnpm run corpus:scss`) existed: the crate's tests port the upstream packages' **own** unit tests
— language filtering, indented-syntax selection, a small nesting sample — which exercise the
wrapper's dispatch, not the CSS compiler. The substitution was therefore an assumption, not a
measurement.

The gate compiles every `<style lang="scss"|"sass">` block and every standalone `.scss` / `.sass`
file in the corpus source repositories with both backends and compares the CSS byte-for-byte after
trailing-whitespace normalisation. `scss-known-failures.json` holds **318 entries** and may only
shrink; it is two-sided, so an entry that starts agreeing fails the run until it is
re-baselined in the same PR.

## What the population is, and what it is not

The first run measured 118 units: **64 match**, **30 diverge**, and **24 are compared only as
"both backends reject"**. Read the denominator as 94, not 118 — a both-reject pair is parity, but
it is parity on a comparison that never reached the CSS.

**After the wave-2 enrolment (#3130) the population is 3,027 units**: 1,755 match, 213 diverge on
the CSS, 105 are inputs `grass` rejects and dart-sass accepts, and 954 are both-reject. The
denominator is therefore 2,073, and `grass` agrees with dart-sass on **84.7%** of it. Treat that
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

Partition of `scss-known-failures.json` by verdict: `213 + 105`

- **213 — the CSS differs** (`css-mismatch`).
- **105 — `grass` rejects an input dart-sass compiles** (`grass-rejects-accepted`). This is the
  half a text diff cannot describe, and it is a third of the list.

The clusters below are a **diagnostic ordering of the `css-mismatch` half, not a partition**: the
gate prints one differing line per unit and 189 of the 213 produced one, so the counts sum to 189.
The original five clusters were written when the whole ratchet was 30 entries; each is still the
same mechanism, at the size the enrolment found.

| n | cluster | changes the cascade? |
|---|---|---|
| 70 | declarations after nested rules (cluster 2 below) | **yes** |
| 44 | indentation of a nested rule | no |
| 31 | colour serialisation (cluster 1) | no |
| 26 | a trailing `/* … */` dropped (cluster 4) | no |
| 10 | attribute-selector quote style — dart-sass keeps `'`, `grass` prints `"` | no |
| 8 | a comment `grass` emits before the block dart-sass emits it after | no |

The one cluster that changes rendering is also the largest, which was not true at 30 entries.

Each cluster section below closes with the files that carried it **when the ratchet was 30
entries**. Those lists are kept as the worked examples that named the mechanism; they are no
longer the cluster's membership, which is now the counts in the table above.

## Cluster 1 — colour serialisation

dart-sass ≥ 1.79 serialises a computed colour in the space its channels were computed in, so
`color.adjust` / `lighten` / `darken` results print as `rgb(92.6666666667%, …)` and
`rgba(255, 64, 0, 0.6117647059)`. `grass` prints the legacy shortest form — `#ececec`,
`#ff40009c`, `darkgray`.

**Same colour, different spelling.** These are cosmetic: no rendered pixel changes. They are still
listed rather than normalised away, because a normaliser that folds every colour form would also
fold a genuine colour-arithmetic divergence, which is precisely the class this gate exists to
catch.

`attractions/{checkbox/checkbox,chip/checkbox-chip,chip/radio-chip,date-picker/calendar,
date-picker/date-picker,popover/popover-button,radio-button/radio-button,slider/slider,
snackbar/snackbar,star-rating/star-rating,tab/tab,time-picker/time-picker}.scss`,
`svelte-formly/src/lib/components/fields/AutoComplete.svelte#style0`

## Cluster 2 — declarations after nested rules

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
nested-rule declaration it was written to win against. It is the highest-value entry in this
ratchet and the reason the gate was worth building.

`attractions/{autocomplete/autocomplete-field,autocomplete/autocomplete,button/button,
file-input/file-input,text-field/text-field}.scss`,
`powertable/app/src/lib/styles/power-table.scss`,
`svelte-splitpanes/src/lib/Splitpanes.svelte#style0`

## Cluster 3 — `grass` panics on the indented syntax

Every `lang="sass"` block in `date-picker-svelte` aborts `grass` with an assertion failure in
`grass_compiler-0.13.4/src/parse/sass.rs:200`. dart-sass compiles all six.

**A panic, not an error, and `catch_unwind` cannot contain it** — the release profile aborts
rather than unwinds, so the helper announces each unit's index on stderr and the gate resumes past
whichever one it died on. The shipped `preprocess_sass` has no such recovery, so an indented-syntax
block of this shape takes the whole compiler process down. Fixing this belongs upstream in `grass`
or in a guard on our side; either way it is the entry to burn down first.

`date-picker-svelte/src/lib/{DateInput,DatePicker,TimePicker}.svelte#style0`,
`date-picker-svelte/src/routes/{+layout,prop,split}.svelte#style0`

## Cluster 4 — comment preservation

`grass` drops a trailing `/* … */` that follows a declaration on the same line, and rewrites the
leading tab of a continuation line inside a preserved multi-line comment to a single space.
Comments survive into shipped CSS, so this is an output difference a consumer can see, but it
changes no rule.

`svelte-splitpanes/src/routes/examples/styling/{app-layout,splitters}/code.svelte#style0`,
`svelte-formly/src/routes/__layout.svelte#style0`

## Cluster 5 — multi-line selector indentation inside `@media`

A selector list that wraps across lines inside an `@media` block keeps the block's indentation on
every line under dart-sass; `grass` indents only the first.

`attractions/attractions/pagination/pagination.scss`

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
