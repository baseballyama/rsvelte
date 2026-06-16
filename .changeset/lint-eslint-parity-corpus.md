---
---

Internal: add a real-world lint-parity corpus that runs the real
`eslint-plugin-svelte` (oracle) against the native `rsvelte-lint` over every
`.svelte` source in `eslint-plugin-svelte` + `svelte-eslint-parser`, ratcheted
by `compat/lint-corpus/known-failures.json` (the new `lint-parity` job in
`corpus-compat.yml`). Fixes the false positives it surfaced: `prefer-const` no
longer flags legacy `export let` props; `no-spaces-around-equal-signs-in-attribute`
only fires when the eq region contains `=` (shorthand `{ id }`); and
`consistent-selector-style` derives class/id affixes from the expression itself
(not surrounding text), so a dynamic `class="… {x}"` correctly suppresses the
report. No published package is affected (`rsvelte_lint` is not released), so
this changeset bumps nothing.
