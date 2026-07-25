---
"@rsvelte/compiler": patch
---

fix(client): keep `<script>` comments on the direct-AST codegen path

Client codegen bailed to the legacy string codegen for any generated chunk
carrying a comment, because esrap places comments positionally and a program
reassembled from independently-parsed chunks had no shared coordinate space to
place them in. Each comment-bearing chunk is now re-parsed at its own region of
one unified buffer, with generated nodes reading as "no location" the way
`svelte/compiler` distinguishes user-derived nodes from synthesized ones. The
fallback rate over the Svelte test corpus drops from 122/3834 (3.18%) to 1/3834,
and 62 components whose output the string codegen got wrong now match
`svelte/compiler` byte-for-byte. Source-map positions inside a rewritten chunk
now resolve to the chunk's start rather than per-statement.
