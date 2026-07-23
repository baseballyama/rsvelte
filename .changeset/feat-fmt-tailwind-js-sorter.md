---
"@rsvelte/fmt": minor
---

feat(fmt): sort custom Tailwind configs via a Node sidecar

`sortTailwindcss` previously covered only a stock, zero-config Tailwind v4 setup
(sorted natively in Rust); a custom `@theme` / `@plugin` / `@utility` /
`@custom-variant` / `@config` stylesheet or a v3 `tailwind.config.js` warned and
left classes untouched, because their order depends on the project's compiled
CSS.

For those custom setups `rsvelte-fmt` now shells out to a one-shot Node sidecar
(`lib/tailwind-sort.mjs`) running the real `prettier-plugin-tailwindcss` — the
same plugin and `createSorter` / `sortClassAttributes` API `oxfmt` uses, pinned
to the same insiders build — so the result is byte-for-byte identical to the
oxfmt oracle. Every static class string across the run is collected and sorted
in a single batched sidecar call, and the sidecar never throws: if Node or the
plugin is unavailable the run warns once and leaves class names unchanged, never
a wrong reorder. The default zero-config path stays pure-Rust with no subprocess.

Adds an rsvelte-only `sortTailwindcss.strategy` extension (not an oxfmt key):
`auto` (default — stock native, custom via JS), `native` (always pure-Rust), and
`js` (always the JS oracle, even for a stock config). With the default `auto` an
existing oxfmt `sortTailwindcss` config works unchanged.
