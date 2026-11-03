---
"@rsvelte/lint": patch
"@rsvelte/language-server": patch
---

fix(preprocess): an indented-syntax (`lang="sass"`) style block whose first non-blank line is indented is now rejected with `Indenting at the beginning of the document is illegal.`, as dart-sass 1.107 does, instead of having its shared indentation removed. Whitespace-only leading lines are still accepted.
