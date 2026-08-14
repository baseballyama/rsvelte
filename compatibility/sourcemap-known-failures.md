# sourcemap-known-failures.json — why each entry is accepted

The source-map gate (`crates/rsvelte_core/tests/sourcemaps_gate.rs`) compiles the
29 official `packages/svelte/tests/sourcemaps` samples with rsvelte and checks
the resulting JavaScript and CSS maps. It ports the upstream `_config.js`
anchors and independently rejects mappings whose original position lies
outside `input.svelte`.

| kind | id shape | meaning |
|---|---|---|
| `anchor` | `anchor\t<sample>\t<target>\t<index>\t<str>` | an upstream `client:` / `server:` / `css:` expectation that rsvelte's map does not satisfy |
| `out-of-range` | `out-of-range\t<sample>\t<target>\t<count>` | mappings whose original line or column lies outside the source |

The current `sourcemap-known-failures.json` baseline contains 13 entries, all
of them `anchor` entries, and no `out-of-range` entries. Every mapping produced
through `oxc_codegen` stays inside the source.
The remaining client anchors reflect the chunk-granular provenance supplied to
the printer; the server `sourcemap-empty-source` anchor is the only server
failure.

The list is shrink-only: a new failure, a larger count, a missing measurement,
or a stale entry fails CI. Sample and anchor count floors also prevent a broken
fixture checkout or deleted assertion from appearing as an improvement.

Regenerate the list only after reviewing a measurement:

```bash
UPDATE_SOURCEMAP_RATCHET=1 cargo test -p rsvelte_core --test sourcemaps_gate -- \
  --ignored --nocapture sourcemap_gate_measure
```

## After a Svelte bump

- Raise `EXPECTED_SAMPLES` or `EXPECTED_ANCHOR_COUNT` only when upstream added
  corresponding coverage. Confirm upstream removals before lowering either
  floor.
- Keep `EXPECTED_FIXTURE_COMPILE_OPTIONS` aligned with the fixture generator.
  If a sample gains custom compile options, reproduce them in the Rust gate or
  explicitly exclude that sample.
- Re-read changed upstream `_config.js` files and update `ANCHORS`; those
  expectations are ported by hand.

## Root cause and target

Client source maps remain chunk-granular (issue #1781). A transformed chunk is
mapped from one source offset, so identifiers inside it do not retain the
per-node provenance required by the upstream anchors. Resolving those entries
requires real source spans throughout the client AST pipeline.

Generated-position segment parity with the official compiler is intentionally
not a gate. Svelte prints with esrap while rsvelte prints with `oxc_codegen`, so
the printers can place equivalent code at different generated lines and
columns. The upstream anchors still test observable source lookups, and the
range check provides a printer-independent structural invariant.

No entry is accepted as correct behavior; all 13 anchors are burndown targets:
`basic`, `binding`, `each-block` (three), `effects` (two), `script`,
`script-after-comment`, `two-scripts` (two), and `sourcemap-empty-source` on the
client, plus `sourcemap-empty-source` on the server.
