---
"@rsvelte/compiler": patch
---

fix(compiler): print the real filename in `svelte_self_deprecated`, and only warn in runes mode

The warning interpolates two independent values — the component identifier and
the *file* basename — and rsvelte derived the second from the first, printing
`import Input from './Input.svelte'` where the file is `input.svelte`. The
message is a copy-pasteable suggestion, so on a case-sensitive filesystem the
compiler was telling users to write an import that does not resolve. The
basename now comes from the filename, split on `/` and `\` like upstream, and
falls back to `Self` / `Self.svelte` when there is no filename.

Upstream also gates the whole warning on `analysis.runes`; rsvelte emitted it in
legacy mode too, where `<svelte:self>` is the supported spelling and there is no
self-import to prefer. That over-warning was the larger half in practice: it
accounted for 19 of the 70 entries in each of the three corpus warning-code
ratchets, which shrink to 51 here.
