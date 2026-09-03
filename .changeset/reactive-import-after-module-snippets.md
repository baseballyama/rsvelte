---
"@rsvelte/compiler": patch
---

Legacy `$.reactive_import` declarations follow the hoisted module snippets

`transform-client.js:201` unshifts them onto the module program's body and `:513` assembles
`[...imports, ...module_level_snippets, ...body]`, so a hoisted `{#snippet}` comes first.
