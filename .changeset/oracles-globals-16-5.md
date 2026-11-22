---
'@rsvelte/cli': patch
---

`rsvelte lint` now knows the globals that ESLint 10.15.0 knows from `globals` 16.5.0, such as `DigitalCredential`. As in eslint-plugin-svelte, `svelte/no-top-level-browser-globals` no longer reports `localStorage`, `sessionStorage` and `ErrorEvent`, which are now also globals in `node`.
