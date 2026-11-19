---
'@rsvelte/cli': minor
---

`rsvelte lint` and `rsvelte format` skip the files that `.gitignore`, `.git/info/exclude` and `.ignore` exclude. `rsvelte format` also skips what `.prettierignore` lists. A `.gitignore` counts only inside a Git repository, and a file named on the command line is still read.
