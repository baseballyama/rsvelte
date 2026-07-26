---
"@rsvelte/lint": patch
---

feat(lint): make `svelte/no-target-blank` fixable

`--fix` now adds the missing `rel` tokens instead of only reporting. When the
element has no `rel`, one is inserted right after `target`; an existing static
`rel` is extended with only the tokens it lacks, preserving its value and
quoting style. `allowReferrer` narrows the required set to `noopener`, and a
dynamic `rel={...}` is still reported without a fix.

Svelte 5 has no `security-anchor-rel-noreferrer` compiler warning, so this rule
is the only place the repair can live. Upstream eslint-plugin-svelte does not
offer the fix; diagnostics are unchanged, so output parity is unaffected.
