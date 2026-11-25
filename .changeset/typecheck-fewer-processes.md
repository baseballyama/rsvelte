---
'@rsvelte/cli': patch
---

`typecheck` starts fewer type checker processes and opens the project fewer times. It no longer runs `--version` first, and the process that lists the files goes on to check them. It adds a process only where that process would check for as long as it takes to open the project.
