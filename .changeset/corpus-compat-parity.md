---
"@rsvelte/compiler": patch
---

Real-world output parity: rsvelte's CSR/SSR output is now byte-identical (after formatting normalization) to the official Svelte 5.56.2 compiler for 6,091 of 6,407 real-world sources collected from sveltejs/svelte and sveltejs/svelte.dev (including markdown code blocks), with zero error-presence/error-code mismatches. Fixes include the experimental_async gate, @const snippet scoping, custom-element accessors/props, a faithful css-prune port, server comment fidelity, derived compound-assignment lowering, and dozens of error-parity rules. A new corpus CI ratchet (compat/corpus/known-failures.json) prevents regressions while the remaining 316 entries are burned down.
