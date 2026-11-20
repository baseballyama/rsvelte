---
'@rsvelte/cli': patch
---

`rsvelte format` now loads each option value as its formatter loads it, from a configuration or from `.editorconfig`. It leaves the files of a value the formatter refuses, such as `endOfLine: "auto"` under oxfmt. It refuses a `printWidth` or `tabWidth` out of range before writing any file.
