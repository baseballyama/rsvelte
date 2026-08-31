# P2 — warning presence and locations still diverge from official Svelte

Category: diagnostics / compatibility

Evidence: each target retains 14 warning-code divergences and one position divergence (`compatibility/KNOWN-FAILURES.md#warning-known-failures`). Ten code entries are rsvelte false positives (`component_name_lowercase`, `export_let_unused`, `state_referenced_locally`); four are missing warnings. The remaining position is an absent span for `options_deprecated_immutable`.

Impact: projects using warning codes as CI policy get different exit behavior, while editors cannot place the one otherwise-correct warning.

Remediation: decide/document any intentional warning extension separately; port the four missing upstream conditions and attach the triggering node span at the `<svelte:options>` emission site.

Acceptance: position ratchets reach zero and code ratchets contain only explicitly versioned product-policy deviations, ideally zero for drop-in mode.

Note: the counts above are read off the ratchet files, and the direction split off
`warning-known-failures.md`. An earlier revision of this file had them inverted
(6 false positives / 22 missing) — check both against the JSON before quoting them.
