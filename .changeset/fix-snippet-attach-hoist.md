---
"@rsvelte/compiler": patch
---

Stop hoisting a `{#snippet}` to module scope when it closes over component scope through an `{@attach}` tag, a `use:`/`transition:`/`animate:` directive, or a `class:`/`style:` shorthand
