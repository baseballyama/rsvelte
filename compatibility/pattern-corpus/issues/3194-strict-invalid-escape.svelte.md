# `3194-strict-invalid-escape.svelte`

**Issue:** [#3194](https://github.com/baseballyama/rsvelte/issues/3194)

`'\8'` — a different message from the octal escape above (`Invalid escape sequence`) and reported at the DIGIT rather than at the backslash. The template-literal member of this family has no corpus file: the formatter oracle cannot lex `` `\251` `` at all
