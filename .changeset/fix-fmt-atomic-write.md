---
"@rsvelte/fmt": patch
---

fix(fmt): write formatted files atomically

`rsvelte-fmt --write` (and the native JS/JSON/CSS/svelte write paths) replaced
each file with a plain `fs::write`, which truncates the target before writing.
An interrupted run — a crash, a kill, a full disk — or a tool reading the file
mid-write could leave a truncated or empty source file. Every output write now
stages the content in a uniquely-named temp file in the same directory and
`rename`s it into place (an atomic, same-filesystem swap), matching the approach
already used by the `<style>` cache.
