---
"@rsvelte/fmt": patch
---

fix(deps): update prettier-plugin-tailwindcss to 0.8.1

Dependency-only bump of the `prettier-plugin-tailwindcss` Node sidecar used by
`rsvelte-fmt`'s custom-Tailwind-config sort path (`lib/tailwind-sort.mjs`), from
a pre-release insiders build to the stable 0.8.1 release that `tailwind_class_order`'s
oracle is already measured against. No sort-output changes; formatter parity
corpus tests pass unchanged.
