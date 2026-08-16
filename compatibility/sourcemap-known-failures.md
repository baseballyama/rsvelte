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
| `out-of-range` | `out-of-range\t<sample>\t<target>\t<count>` | budget: out-of-range segments not also emitted by the official map at the same generated and original position |

**Current baseline: `sourcemap-known-failures.json`, 3 entries.** The
before/after tables further down record what one specific change did at the time
it landed; they are history, not the current size. Reading the newest number in
those tables as today's count is the mistake this line exists to prevent — the
`73` under the anchoring fix was correct when written (#2264 took the list 75 →
73), #2312 later took it to 74, and the location-less comment cursor brought it
back to 73.

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

### Second catch: #1784

Same shape as the #1772 entry above. Fixing #1784 (a trailing
`<script>` comment now flushes at the next node upstream gives a location, not
at the end of the function body) made `sourcemap-offsets` client output
byte-identical to the official compiler for the first time, so it newly
qualifies for `map-parity` and reports its resolution loss: 8 official segments,
0 reproduced.

| | before #1784 | after |
|---|---|---|
| `sourcemap-offsets` client — byte-identical to official | no | **yes** |
| `sourcemap-offsets` client — official segments reproduced | not measured | 0 / 8 (8 missing, 0 wrong) |

`EXPECTED_IDENTICAL_OUTPUTS` rises 55 → 56 in the same commit. Nothing else
moved: no anchor changed, and no existing budget grew.

### Third catch: instance-script chunk anchor

The instance script chunk was anchored at `ScriptContent::start` — the byte
immediately after `<script>`, i.e. the newline ending that line. Every segment
derived from it therefore resolved to a column past the end of the `<script>`
line. Anchoring the chunk at the script's first non-whitespace byte instead
halved `out-of-range` and produced the first non-zero client `exact` count this
gate has ever recorded; generated code is unchanged (the offset only feeds the
map).

| | before | after |
|---|---|---|
| client `out-of-range` segments | 37 | **19** |
| samples with an `out-of-range` budget | 16 | **14** |
| client official segments reproduced | 0 / 488 | **9 / 488** |
| client `wrong` segments | 81 | **72** |
| ratchet entries | 75 | **73** |

### Fourth catch: location-less comment cursor

Marking synthesized client nodes as location-less removes the last
`sourcemap-offsets` client segment whose origin pointed past its source line.
Generated output and the sample's `map-parity` budget are unchanged.

| | before | after |
|---|---|---|
| `sourcemap-offsets` client — out-of-range | 1 | **0** |
| ratchet entries | 74 | **73** |

## Root cause

The client entries all shared one cause, tracked in issue #1781: the client AST
output path mapped an entire emitted *chunk* to the one source offset the chunk
started at (`js_ast/to_oxc.rs::take_chunk_region`), and the printer's column
arithmetic then accumulated on top of that single anchor. Individual nodes inside
a chunk lost their own provenance, which produced both symptoms at once —
segments that no longer existed (`missing`, the resolution loss) and segments
that addressed a column past the end of the anchor's line (`out-of-range`).

Two findings from the #1781 burndown sharpened this. First, the official map's
segments are overwhelmingly *identifier and literal* start/end pairs, emitted by
esrap's `Context.write(content, node)`; `rsvelte_esrap` only emitted anchors from
`Printer::write_source_keyword`, so it had none of them and reproduced 0 / 488
client segments. Second, adding those anchors did not help on its own: a
comment-free chunk is parsed in place (`to_oxc.rs::parse_chunk`), so its node
spans are *chunk-local* byte offsets that the printer then read as offsets into
the original `.svelte` file. Chunk-local offsets and real source offsets share
one number space with nothing to tell them apart, so per-node anchors resolved to
unrelated positions.

Both halves are now fixed. `Printer::write_node` ports esrap's
`Context.write(content, node)` — every source-backed identifier, literal, member
property and block brace is bracketed by anchors for its own span — and the
spans reaching it are real source offsets, carried through client and SSR
lowering rather than reconstructed from a chunk. That took the gate from 73
entries to 3, with the `anchor` and `out-of-range` classes eliminated entirely.

## Entries

No entry is accepted as correct behaviour; all are burndown targets.

- **`map-parity` (3)** — `attached-sourcemap` on `client` and `server`, and
  `effects` on `server`; one segment each. All three are the same shape: rsvelte
  emits *two* segments at one generated column, and the one the official map
  agrees with is the second. The gate compares the first segment at a generated
  column (upstream's own resolution rule), so the extra leading segment scores as
  `wrong`. The surplus segment comes from the merge in
  `3_transform/mod.rs::merge_preferred_mappings`, which interleaves two
  independently produced mapping lists and can leave both at one position.

  Collapsing duplicates at the encoder was tried and rejected: keeping the *last*
  segment fixes these three and breaks eight server entries that need the first,
  and keeping the first does the reverse. Neither order is correct, because the
  merged list combines producers whose emission order does not encode precedence
  — the fix is to stop emitting the surplus segment at its source, not to pick a
  winner afterwards. Deliberately *not* worked around by relaxing the comparison
  to "any segment at this column matches": that would also stop the gate seeing a
  genuinely mis-anchored token.
