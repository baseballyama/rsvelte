---
'@rsvelte/compiler': patch
'@rsvelte/vite-plugin-svelte-native': patch
'@rsvelte/svelte-check': patch
'@rsvelte/language-server': patch
'@rsvelte/lint': patch
---

Detect `lang="ts"` on a `<script>` tag whose earlier attribute value contains `>`, such as `generics="T extends Record<string, unknown>"`. TypeScript in template expressions used to fail with `js_parse_error` when `lang` came after such an attribute. Detection now follows upstream's rule exactly, including that only the first `<script>` carrying a `lang` attribute decides.
