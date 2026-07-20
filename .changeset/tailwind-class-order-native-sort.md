---
"@rsvelte/fmt": minor
---

feat(fmt): native `sortTailwindcss` for default-config Tailwind projects

`rsvelte-fmt` now sorts the classes in static `class` attributes when
`sortTailwindcss` is configured **and** the project uses a stock, zero-config
Tailwind v4 setup (`@import "tailwindcss";` with no `@plugin` / `@utility` /
`@custom-variant` / `@theme` / `@config` and no v3 `tailwind.config.js`). The
sort is a pure-Rust port of `prettier-plugin-tailwindcss` / Tailwind v4
`getClassOrder` (new `tailwind_class_order` crate), so no Node/Tailwind engine is
spawned; it matches the real sorter on 99.8% of a 3,806-attribute real-world
corpus.

For a custom stylesheet/config — where the order depends on the JS engine and
cannot be reproduced faithfully — `rsvelte-fmt` prints a warning naming the
reason and leaves classes unchanged (previously it always warned). Values with
`{expr}` interpolation are never touched. The `attributes` option is honored
(default `["class"]`).
