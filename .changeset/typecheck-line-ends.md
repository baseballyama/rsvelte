---
'@rsvelte/cli': patch
---

`typecheck` places a finding in a file with `\r\n`, `\r`, U+2028 or U+2029 line ends at svelte-check's line and column, instead of `check_unmapped` at 1:1 or a wrong line.
