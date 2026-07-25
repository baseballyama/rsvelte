# sourcemap-known-failures.json — why each entry is accepted

The source-map gate (`crates/rsvelte_core/tests/sourcemaps_gate.rs`) runs the 29
official `packages/svelte/tests/sourcemaps` samples through rsvelte and checks
the resulting `js.map` / `css.map`. Ground truth is the official compiler: the
`client.js` / `client.js.map` / `server.js` / `server.js.map` fixtures under
`fixtures/<sha>/sourcemaps/` come from `scripts/fixtures/generate-fixtures.mjs`
calling `submodules/svelte`'s own `compile()` on the same input with the same
options (`{ dev: false, generate, filename: 'input.svelte' }`).

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

Regenerate the whole list from a measurement (never hand-edit the counts):

```bash
UPDATE_SOURCEMAP_RATCHET=1 cargo test -p rsvelte_core --test sourcemaps_gate -- \
  --ignored --nocapture sourcemap_gate_measure
```

## Baseline at the time this gate was added

Measured on Svelte `b29d7002ecf9`, 29 samples × {client, server} (54 of the 58
pairs are byte-identical to the official output, so 54 take part in
`map-parity`):

| measure | value |
|---|---|
| official segments reproduced | 164 / 712 (23.0%) — 466 missing, 82 wrong |
| out-of-range segments | 32 / 559 (5.7%) |
| ported `_config.js` anchors passing | 10 / 21 |

The split is entirely along the client/server line:

- **Server maps are accurate.** All 9 ported server anchors pass, no server map
  has an out-of-range segment, and every reproduced segment in the table above is
  a server segment. The server transform is pure-AST, so nodes carry real spans.
- **Client maps are not.** All 11 failing anchors are client. Every client
  sample scores `0 exact` — not one segment of the official client map is
  reproduced at the same generated position with the same origin — and all 32
  out-of-range segments are client.
- The single CSS anchor (`css` sample) passes: CSS maps come from a separate
  `string_wizard`-based path that the client JS refactor does not touch.

## Root cause

Every entry below has the same cause, tracked in issue #1781: the client AST
output path maps an entire emitted *chunk* to the one source offset the chunk
started at (`js_ast/to_oxc.rs::take_chunk_region`), and the printer's column
arithmetic then accumulates on top of that single anchor. Individual nodes inside
a chunk lose their own provenance, which produces both symptoms at once —
segments that no longer exist (`missing`, the resolution loss) and segments that
address a column past the end of the anchor's line (`out-of-range`).

Resolution is expected to fall out of the Wave-4 script AST-visitor migration:
once `Raw` / `RawMapped` chunks are gone and every oxc node carries a real span,
the client path gets the same per-node provenance the server path already has.
Until then the numbers above are a budget, not an acceptance of the behaviour.

`RSVELTE_CLIENT_NO_OXC=1` still routes client output through the legacy text
generator, whose maps are per-fragment and land inside the source. It is a
reference point for how much resolution the text path had, not a target: this
gate never asserts against it, because that path is being deleted and the
official compiler is the real oracle.

## Entries

All entries are the client-side manifestation of the single root cause above; no
entry is accepted as correct behaviour.

- **`anchor` (11)** — `basic`, `binding`, `each-block` (×3), `effects` (×2),
  `script`, `script-after-comment`, `two-scripts` (×2), all `client`. Ten report
  “no segment at `<line>:<col>`”: the chunk-level anchor means no segment starts
  where the identifier starts. `two-scripts` `first` instead reports a *wrong*
  origin (`0:11` instead of `1:12`) — the module script's chunk is anchored at
  the file start, so the whole block is off by the `<script module>` line.
- **`map-parity` (44)** — one per byte-identical pair that loses official
  segments. Client counts (4–36) are dominated by `missing`; server counts (4–13)
  are `missing`-only and come from the official compiler emitting a few extra
  end-of-token segments that rsvelte's printer does not.
- **`out-of-range` (14)** — 1–4 segments per client map. These are the segments
  that break downstream consumers outright (a devtools frame resolving past the
  end of a line), so this is the budget to burn down first.
