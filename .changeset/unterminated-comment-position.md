---
'@rsvelte/compiler': patch
---

Report an unterminated `<!--` at the last non-whitespace byte. Upstream parses a right-trimmed template, so it runs out of input there rather than at the end of the file; the tag paths already did this and the comment reader reported the untrimmed end
