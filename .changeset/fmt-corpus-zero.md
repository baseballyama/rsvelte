---
"@rsvelte/fmt": patch
---

Formatter-parity corpus reaches 0 known failures (from 295): every in-scope
component across sveltejs/svelte + svelte.dev + bits-ui/flowbite/melt/shadcn now
formats byte-identically to the `oxfmt(svelte:true)` oracle, with 23 principled
documented exclusions (oracle bugs that corrupt source, oxc/prettier engine
divergences, invalid input, migrate, and one oxfmt cross-platform
non-determinism case). See `docs/fmt-oracle-bugs.md` + `docs/corpus-fmt-remaining-work.md`.
