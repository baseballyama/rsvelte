---
'@rsvelte/compiler': patch
'@rsvelte/svelte2tsx': patch
'@rsvelte/svelte-check': patch
'@rsvelte/language-server': patch
---

Follow language-tools `f0eda319c400`:
- **svelte2tsx:** instance-script imports are hoisted as whole lines, one chunk per run of adjacent top-level imports; nested imports stay in place and no `;` is appended to the last import.
- **svelte2tsx:** a `$$ComponentProps` alias after an import is inserted on the next line, so it is not hoisted with the import.
- **svelte2tsx:** the `$$ComponentProps` alias emitted before `$$render` follows hoisted imports after a blank line, as upstream's does.
- **svelte2tsx:** prop widening is emitted as `x = __sveltets_2_any();x;`.
- **svelte2tsx:** `// @ts-check` and `// @ts-nocheck` among the script's leading comments are prepended to the output.
- **Language server:** the initialize result carries `customServerStatus` (`contentMapperModeEnabled: false`).
