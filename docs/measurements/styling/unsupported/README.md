# Styling coverage: JavaScript prerequisites

This change adds source-backed regex nodes, object accessors, and contextual
lookahead for nested template substitutions and regex delimiters. Regex patterns
and flags borrow source spans. Parsing, tree copying, printing, and formatting
use the same node. Svelte treats regex literals as literals when checking purity,
simple expressions, and state proxies.

## Correctness

Oracle: Svelte 5.57.1. Source identities and hashes are in [metadata.json](metadata.json).
The archive records the measured dirty tree; a commit name alone does not identify it.

| CSS corpus | Before | After |
|---|---:|---:|
| Population | 2,161 | 2,161 |
| Exact CSS matches | 1,637 | 1,708 |
| Unparsed | 524 | 453 |
| Parsed CSS differences | 0 | 0 |

The 71 newly parsed units all match. [before.tsv](before.tsv) and
[after.tsv](after.tsv) record every failure and the population.
The common 18 components also match both targets: 36 JavaScript ASTs and CSS
outputs. See [common-compile-ast.json](common-compile-ast.json).
Eight new components match official JavaScript as an AST and CSS as text for
both client and server: 16 outputs each. See [compile-ast.json](compile-ast.json).
The comparator detects a changed regex flag; [positive-control.json](positive-control.json)
records clean, changed, and restored results. Eight crate cases keep 32 snapshots.

The largest remaining first errors are `try` (159), module scripts (112), and
`for` (87). Error counts can rise when parsing reaches a later unsupported construct.
This change checks regex boundaries and flags. Full regex pattern validation is
still unsupported.

Workspace check, strict Clippy, tests, formatting, and structure checks pass.
The workspace fixture runner counts official output differences without failing;
its success does not establish full JavaScript compiler parity. The explicit
AST comparisons above cover the measured 26 components.

## CPU cycles

`proc_pid_rusage(RUSAGE_INFO_V4)` reads hardware cycles and instructions between
stdin gates. Inputs are loaded before 20 warm rounds. Each arm has four trials of
1,000 rounds, ordered official/old/rewrite/rewrite/old/official twice. Zero-round
controls must advance counters; measured rounds must exceed them. Setup and file
writing are outside the gates. See `cycles-common.json` and `cycles-new.json`.

| Median cycles per input | Official JS | Old Rust | Rewrite |
|---|---:|---:|---:|
| Common 18 components | 1,130,237 | 539,312 | 54,514 |
| New 8 components | 833,379 | 183,524 | 38,688 |

The common population is the previous report's population. Its previous rewrite
median was 54,551 cycles. The difference is below the trial spread and does not
show a speed change. Source trees also contain shared work beyond this patch.
CPU frequency and affinity are not fixed. Other processes were running.
Official compilation includes its source maps; native printing omits them.
These numbers do not prove that the implementation is the fastest possible.

## Memory

[layout.tsv](layout.tsv) records actual Rust sizes and alignment. A regex uses the
existing columns: tag 1 byte, flags 1 byte, data 8 bytes, position 8 bytes. It adds
no copied pattern or flag strings. The decoded `Kind` view is 40 bytes; `Lexer`
is 32 bytes. These are views and parser state, not extra bytes per tree node.

A separate binary installs `CountingAllocator`; it does not supply CPU samples.
It warms 20 rounds, then counts one serial round without phase timers.

| Population | Allocations | Requested bytes | Peak live heap growth |
|---|---:|---:|---:|
| Common 18 | 3,863 | 330,127 | 47,183 |
| New 8 | 1,383 | 73,413 | 12,746 |

The warm new-population process had a 1,744 KiB physical footprint in one `vmmap`
sample. [vmmap.txt](vmmap.txt) contains the address map;
[vmmap-summary.txt](vmmap-summary.txt) contains its summary. Virtual reservations,
allocator free pages, and live heap growth describe different quantities.
This sample is not a memory improvement comparison.
