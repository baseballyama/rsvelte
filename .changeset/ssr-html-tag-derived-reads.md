---
"@rsvelte/compiler": patch
"@rsvelte/vite-plugin-svelte-native": patch
---

fix(ssr): apply derived-read wrapping to `{@html expr}`

On the server, `{@html expr}` skipped the dynamic-expression transforms that the
regular `{expr}` tag runs — most importantly `wrap_derived_reads`. Since a
`$derived` binding compiles to a getter function on the server, `{@html post.html}`
where `post = $derived(...)` emitted `$.html(post.html)` (reading `.html` off a
function, i.e. `undefined`) and rendered nothing. It now emits
`$.html(post().html)`, matching the official compiler. Non-derived expressions
and string literals are unaffected. This surfaced as empty article bodies when
prerendering a SvelteKit site that does `{@html ...}` over a `$derived` value.
