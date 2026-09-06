---
'@rsvelte/language-server': patch
---

feat(lsp): offer the four language-attribute tag completions

`getLangCompletions` (`HTMLPlugin.ts:281-317`) offers a `lang=`-carrying copy
beside the plain `script`, `style` and `template` tag items —
`script (lang="ts")`, `style (lang="less")`, `style (lang="scss")` and
`template (lang="pug")`. rsvelte had no counterpart, so it answered 128 items
where the official server answers 132 on the same document and offset.
