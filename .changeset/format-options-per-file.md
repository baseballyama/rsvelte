---
'@rsvelte/cli': patch
---

`rsvelte format` resolves the formatter options of each file as Prettier and oxfmt do: from the nearest configuration and `.editorconfig`. It ignores an unknown option with a warning, and an option that `rsvelte.config` gives a plugin replaces the project's.
