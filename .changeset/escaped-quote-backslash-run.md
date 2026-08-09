---
'@rsvelte/compiler': patch
'@rsvelte/svelte2tsx': patch
'@rsvelte/svelte-check': patch
---

Decide whether a quote is escaped by counting the run of backslashes before it, at every scanner in the compiler and in svelte2tsx. 37 sites asked `bytes[i - 1] != b'\\'` instead, which is a different question: in `'\\'` the closing quote follows a *complete* `\\` escape and is not escaped at all, so the scanner never closed the string and consumed whatever followed. Reachable effects that are now fixed include a `{const a = '\\', b = 2}` losing its second declarator with no error, `{const { a = '\\' } = obj}` being rejected as an invalid declaration tag, a destructuring assignment emitting an IIFE argument that carried the statement's `;`, a dev-mode prop-mutation validator swallowing the rest of the instance script, a legacy mutated import skipping every later `$.mutate` in the same script, and a `<svelte:element this={… '\\' …}>` overlay dropping its children's diagnostics in svelte2tsx.
