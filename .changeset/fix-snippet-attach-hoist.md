---
"@rsvelte/compiler": patch
---

Fix `{#snippet}` hoisting analysis: stop hoisting a snippet that closes over component scope through an `{@attach}` tag, a `use:`/`transition:`/`animate:` directive, or a `class:`/`style:` shorthand, and start hoisting one whose only references are its own `{let}`/`{const}` declarations
