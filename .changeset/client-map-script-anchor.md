---
"@rsvelte/compiler": patch
"@rsvelte/lint": patch
"@rsvelte/svelte-check": patch
---

Client source maps no longer anchor the instance script at the byte immediately
after `<script>`. That byte is the newline ending the `<script>` line, so every
segment derived from the script chunk resolved to a column past the end of that
line and broke downstream consumers resolving a frame. The chunk is now anchored
at the script's first non-whitespace byte, which cuts out-of-range client
segments by 46% across the official sourcemap samples. Generated code is
unchanged — the offset only feeds the map.
