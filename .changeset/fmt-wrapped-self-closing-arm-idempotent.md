---
'@rsvelte/fmt': patch
'@rsvelte/language-server': patch
---

Format a self-closing element glued between block tags (`{:else if c}<Second viewer={v} {c} />{:else}`) the same way on every run. It used to alternate between a wrapped open tag and a single line wider than `printWidth`, because the trailing `{:else}` / `{/if}` stopped counting toward its width once the open tag had been wrapped (#4765). A void element split across lines without `/>` (`<input …>{/if}`) now counts those closers on the first run too, as it prints as `<input … />`.
