---
'@rsvelte/cli': patch
---

`typecheck` reads fewer paths and files from the disk. It takes a file's real path only where a replaced file may be behind it. It no longer reads every file twice to check a project with no component.
