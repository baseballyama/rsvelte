---
"@rsvelte/fmt": patch
---

fmt: format `.json` / `.jsonc` / `.json5` in-process via `oxc_formatter_json`
instead of delegating them to an `oxfmt` subprocess. It's the same engine `oxfmt`
uses for JSON, so the output is byte-identical (verified 243/243 on a real-world
corpus) while skipping the per-invocation `oxfmt` startup — a standalone JSON
file now formats instantly on save, like `.ts`/`.js`/`.svelte` already do.

`package.json` keeps going to `oxfmt`: it additionally runs through
`sortPackageJson` (a key-ordering pass that lives in oxfmt, not oxc), so
formatting it natively would diverge. Files matched by an `.oxfmtrc` override, or
any JSON when the base `printWidth` exceeds the native max (320), also fall back
to `oxfmt`, as do parse errors — so coverage never regresses. The native JSON
path is gated by the same `--no-native-js` escape hatch.
