# P2 — native lint output has 32 false positives and 72 false negatives

Category: lint compatibility / scope analysis

Evidence: the real-world lint corpus ratchets 104 differing findings (`compatibility/lint-known-failures.md:1-24`), including 23 missing `prefer-svelte-reactivity` findings on `.svelte.js/.svelte.ts` and 36 `sort-attributes` divergences. Exact fixtures remain green, so production shapes expose coverage gaps not represented there.

Impact: a drop-in migration changes CI failures and autofix opportunities; false positives erode trust and false negatives miss defects official eslint-plugin-svelte would report.

Remediation: prioritize rule families by corpus count, port module-script support and official scope semantics, and add each minimized real-world shape to exact oracle fixtures.

Acceptance: the corpus ratchet reaches zero without manual exclusions for implementable Svelte-only rules.
