---
"@rsvelte/vite-plugin-svelte-native": patch
---

- `resolve_id` now preserves `?query` / `#hash` suffixes and handles bare `<script module>` HMR.
- Rebuild against the bundled `@rsvelte/compiler` correctness work.
