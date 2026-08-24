---
"@rsvelte/svelte2tsx": patch
---

Stop blanking the whitespace around a module-only component's template. Upstream has no such step — it leaves the template text alone — so a component whose only script is `<script module>` and whose template is whitespace lost the newline inside the generated arrow, and lost one of the two runs entirely when whitespace sat on both sides of the script.
