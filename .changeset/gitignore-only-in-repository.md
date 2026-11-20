---
'@rsvelte/cli': patch
---

Inside a Git repository, `rsvelte lint` and `rsvelte format` read `.gitignore` files only up to the repository root, so an enclosing repository's no longer skip a nested project's files. Outside Git, `.gitignore` files still apply.
