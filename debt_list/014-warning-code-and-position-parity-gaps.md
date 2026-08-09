# P2 — warning presence and locations still diverge from official Svelte

Category: diagnostics / compatibility

Evidence: each target retains 28 warning-code divergences and four position divergences (`compatibility/warning-known-failures.md:35-55,96-112`). Six code entries are deliberate rsvelte false positives; 22 are missing warnings. The four positions are absent spans for `options_deprecated_immutable` and `attribute_avoid_is`.

Impact: projects using warning codes as CI policy get different exit behavior, while editors cannot place four otherwise-correct warnings.

Remediation: decide/document any intentional warning extension separately; port the 22 missing upstream conditions and attach the triggering node spans at their emission sites.

Acceptance: position ratchets reach zero and code ratchets contain only explicitly versioned product-policy deviations, ideally zero for drop-in mode.
