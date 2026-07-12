---
"@rsvelte/vite-plugin-svelte-native": patch
"@rsvelte/svelte-check": patch
---

fix: add NAPI envelope bounds checks and propagate signal death as non-zero exit

`parse-envelope.js` now applies the same window bounds checks as `envelope.js`
(M-012), so a malformed or version-skewed envelope throws instead of silently
decoding a truncated AST. The svelte-check launcher now maps a signal-killed
native binary to a non-zero exit code (128 + signal) instead of reporting 0,
matching the fmt launcher.
