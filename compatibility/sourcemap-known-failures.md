# sourcemap-known-failures.json — why each entry is accepted

The source-map gate (`crates/rsvelte_core/tests/sourcemaps_gate.rs`) runs the 29
official `packages/svelte/tests/sourcemaps` samples through rsvelte and checks
the resulting `js.map` / `css.map`. Ground truth is the official compiler: the
`client.js` / `client.js.map` / `server.js` / `server.js.map` fixtures under
`fixtures/<sha>/sourcemaps/` come from `scripts/fixtures/generate-fixtures.mjs`
calling `submodules/svelte`'s own `compile()` on the same input with the same
options (`{ dev: false, generate, filename: 'input.svelte' }` — the gate asserts
each sample's recorded `metadata.json` still says exactly that).

| kind | id shape | meaning |
|---|---|---|
| `anchor` | `anchor\t<sample>\t<target>\t<index>\t<str>` | an official `_config.js` `client:` / `server:` / `css:` expectation that rsvelte's map does not satisfy |
| `map-parity` | `map-parity\t<sample>\t<target>\t<count>` | budget: official map segments that rsvelte does not reproduce, where the generated code is byte-identical (missing + wrong) |
| `out-of-range` | `out-of-range\t<sample>\t<target>\t<count>` | budget: segments whose original position lies past the end of that source line, or past the last line |

Ratchet semantics, matching `fmt-verify.mjs` / `verify.mjs`:

- an `anchor` id **not** in this list fails CI;
- a `map-parity` / `out-of-range` count **above** its recorded budget fails CI;
- an entry that starts passing (or a count below its budget) only prints a
  reminder to shrink the list — the list may shrink, never grow.

Two things deliberately **cannot** be expressed as a known failure, because
"measured less" must never look like "passed":

- a budgeted `<sample>/<target>` that disappears from the measurement is a
  regression, not a win;
- an `anchor` id in this list whose entry no longer exists in the test's
  `ANCHORS` table is a regression, so anchors cannot be deleted to go green.

On top of that the gate holds hard floors — sample count, anchor count, and the
number of byte-identical outputs `map-parity` can observe — and panics rather
than skipping when a sample's `input.svelte` or `metadata.json` is unreadable.

Regenerate the whole list from a measurement (never hand-edit the counts):

```bash
UPDATE_SOURCEMAP_RATCHET=1 cargo test -p rsvelte_core --test sourcemaps_gate -- \
  --ignored --nocapture sourcemap_gate_measure
```

## After a Svelte bump

The four constants at the top of `sourcemaps_gate.rs` are the only things a bump
can touch beyond the ratchet itself. Raise a floor only *after* a measurement
justifies it — never to make a red run go green.

- **Upstream adds samples.** Nothing to do. The floors are `>=` lower bounds, so
  they stay satisfied, and a new sample has no ratchet entry — any failure it
  brings is correctly reported as a regression. Once it is triaged, regenerate
  the ratchet and raise `EXPECTED_SAMPLES` / `EXPECTED_ANCHOR_COUNT` /
  `EXPECTED_IDENTICAL_OUTPUTS` to the new measured values in the same commit.
- **Upstream removes or renames samples.** A floor trips, or `load_input`
  panics. That is the intended outcome — confirm against the upstream diff that
  the sample really is gone, then lower the floor and drop its ratchet entries.
  Never lower a floor without that confirmation: an unreadable sample and a
  deleted one look identical from here, and the first is a broken checkout.
- **Upstream adds a sourcemaps `_config.js` that the fixture generator can
  import.** `check_fixture_options` fails with "the comparison would be
  meaningless". This is a benign cause with a loud symptom: the generator now
  compiles that sample with options this test does not use, so the oracle and
  rsvelte are no longer comparable. Either teach `compile_sample` the same
  options, or exclude the sample — do not relax
  `EXPECTED_FIXTURE_COMPILE_OPTIONS` to paper over the divergence.
- **Anchors.** `_config.js` expectations are copied by hand into `ANCHORS`;
  re-read the changed ones on a bump, since nothing detects an upstream
  expectation that silently changed value.

## Baseline at the time this gate was added

Measured on Svelte `b29d7002ecf9`, 29 samples × {client, server} (55 of the 58
pairs are byte-identical to the official output, so 55 take part in
`map-parity`):

| measure | client | server | total |
|---|---|---|---|
| official segments reproduced | 0 / 480 | 164 / 284 | **164 / 764 (21.5%)** |
| — of which missing / wrong | 393 / 87 | 113 / 7 | 506 / 94 |
| out-of-range segments | 37 | 0 | **37 / 545 (6.8%)** |
| ported `_config.js` anchors passing | 0 / 12 | 9 / 10 | **10 / 23** (incl. 1 CSS) |

The split is nearly, but not entirely, along the client/server line:

- **Client maps reproduce nothing.** Every client sample scores `0 exact` — not
  one segment of the official client map is reproduced at the same generated
  position with the same origin — all 12 client anchors fail, and all 37
  out-of-range segments are client.
- **Server maps are directionally correct but coarser than official.** 164 of
  284 official server segments are reproduced exactly and no server map has an
  out-of-range segment, but 113 are *missing* (the official compiler emits
  segments rsvelte's printer does not) and 7 are *wrong* (in
  `preprocessed-styles` and `source-map-generator`). One server anchor fails:
  `sourcemap-empty-source` has no segment at the start of `let doubled`. So
  "the server side is fine" would be an overstatement — server is where the
  burndown is tractable, not where it is finished.
- The single CSS anchor passes: CSS maps come from a separate
  `string_wizard`-based path that the client JS refactor does not touch.

### First catch: #1772

The baseline above was re-measured when this branch was rebased onto a main that
had gained #1772 ("keep `<script>` comments on the direct-AST codegen path"),
and the gate moved. The delta is confined to the two sourcemaps samples that
have a `//` comment inside `<script>` — exactly the files #1772 switches from
the text generator to the direct-AST path:

| | before #1772 | after |
|---|---|---|
| `typescript` client — byte-identical to official | no | **yes** |
| `typescript` client — official segments reproduced | not measured | 0 / 52 (40 missing, 12 wrong) |
| `typescript` client — out-of-range | 0 | **4** |
| `sourcemap-offsets` client — out-of-range | 0 | **1** |

Both directions in one change: generated-code parity *improved* (54 → 55
byte-identical, which is why `typescript` newly qualifies for `map-parity` at
all), while map quality *regressed* (0 → 5 new out-of-range segments). Server
totals are byte-for-byte unchanged, confirming the change is client-only.

This is the degradation issue #1781 describes, and it is the reason this gate
exists: the same change passed every other suite. No other sample's counts
moved, so nothing else on main has touched source maps.

## Root cause

The client entries all share one cause, tracked in issue #1781: the client AST
output path maps an entire emitted *chunk* to the one source offset the chunk
started at (`js_ast/to_oxc.rs::take_chunk_region`), and the printer's column
arithmetic then accumulates on top of that single anchor. Individual nodes inside
a chunk lose their own provenance, which produces both symptoms at once —
segments that no longer exist (`missing`, the resolution loss) and segments that
address a column past the end of the anchor's line (`out-of-range`).

Resolution is expected to fall out of the Wave-4 script AST-visitor migration:
once `Raw` / `RawMapped` chunks are gone and every oxc node carries a real span,
the client path gets per-node provenance. The server residue (the 113 missing
segments, the 7 wrong ones, and the `sourcemap-empty-source` anchor) is a
separate, smaller gap in the server printer's segment emission, not explained by
`take_chunk_region`.

`RSVELTE_CLIENT_NO_OXC=1` still routes client output through the legacy text
generator, whose maps are per-fragment and land inside the source. It is a
reference point for how much resolution the text path had, not a target: this
gate never asserts against it, because that path is being deleted and the
official compiler is the real oracle.

## Entries

No entry is accepted as correct behaviour; all are burndown targets.

- **`anchor` (13)** — `basic`, `binding`, `each-block` (×3), `effects` (×2),
  `script`, `script-after-comment`, `two-scripts` (×2) and
  `sourcemap-empty-source` on `client`; `sourcemap-empty-source` on `server`.
  Eleven report "no segment at `<line>:<col>`": the chunk-level anchor means no
  segment starts where the identifier starts. Two report a *wrong* origin —
  `two-scripts`/`first` maps to `0:11` instead of `1:12` (the module script's
  chunk is anchored at the file start, so the whole block is off by the
  `<script module>` line) and `sourcemap-empty-source`/client maps to `0:8`
  instead of `2:1`.
- **`map-parity` (45)** — one per byte-identical pair that loses official
  segments. Client counts (4–52) are dominated by `missing`; server counts (4–13)
  are mostly `missing`-only, except `preprocessed-styles` and
  `source-map-generator`, which contribute the 7 server `wrong` segments.
- **`out-of-range` (16)** — 1–4 segments per client map. These are the segments
  that break downstream consumers outright (a devtools frame resolving past the
  end of a line), so this is the budget to burn down first.
