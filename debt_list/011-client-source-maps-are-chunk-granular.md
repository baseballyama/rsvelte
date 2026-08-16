# P1 — client source maps cannot identify token-level origins

Category: debugging / ecosystem compatibility

Evidence: `compatibility/sourcemap-known-failures.json` contains 3 failures, down
from 73. The original root cause is fixed: client-generated chunks no longer
receive a single source start. `Printer::write_node` ports esrap's
`Context.write(content, node)`, so every source-backed identifier, literal,
member property and block brace is bracketed by anchors for its own span, and
the spans reaching the printer are real source offsets carried through client
and SSR lowering rather than reconstructed from a chunk region.

Both structural budgets are now zero — 0 out-of-range segments (of 1595) and all
23 official `_config.js` anchors pass — and 815 of 818 official segments are
reproduced exactly, without weakening any gate invariant.

Impact: substantially reduced. Browser stack traces, breakpoints and coverage now
resolve to the token the user wrote. The residue is three generated positions
that carry a surplus segment.

Remaining: the 3 `map-parity` entries (`attached-sourcemap` client and server,
`effects` server) are one shape — rsvelte emits *two* segments at one generated
column and the official map agrees with the second, so the first scores as
`wrong`. The surplus comes from `3_transform/mod.rs::merge_preferred_mappings`
interleaving two independently produced mapping lists.

Remediation: stop emitting the surplus segment where it is produced. Collapsing
duplicates at the encoder is not a fix and was measured: keeping the last segment
repairs these three and breaks eight server entries that need the first, and
keeping the first does the reverse — the merged list combines producers whose
emission order does not encode precedence.

Acceptance: all official sourcemap anchors pass (**met**), both structural
budgets reach zero (**met**) without loosening invariants (**met**), and
`sourcemap-known-failures.json` reaches 0 entries (**3 remaining**).
