---
"@rsvelte/compiler": patch
---

Bump target Svelte to **5.53.2**. The only compiler-side change upstream is `6aa7b9c64` "fix: update expressions on server deriveds", which routes `name++` / `name--` / `++name` / `--name` through new `$.update_derived(...)` / `$.update_derived_pre(...)` helpers when `name` resolves to a derived binding. The new `runtime-runes/derived-update-server` fixture is skipped in our compatibility report (documented in `tests/compatibility_report.rs`) until rsvelte's server-side update-expression walker grows derived-binding awareness — tracked as a follow-up port.
