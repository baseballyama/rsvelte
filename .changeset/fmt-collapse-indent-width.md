---
"@rsvelte/fmt": patch
---

Fix the collapse/markup layout path hardcoding 2-space indentation: the Doc-IR
print unit and the space-count→indent-level conversion now honor the configured
`indentWidth`/`indentStyle` (4-space, tabs, etc.) instead of assuming 2 spaces.
Previously, fill-wrapped prose and hugged inline elements were re-indented at the
wrong column for any non-default indent setting. Byte-identical for the default
2-space config (0 corpus regressions); adds 4-space and tab regression tests.
