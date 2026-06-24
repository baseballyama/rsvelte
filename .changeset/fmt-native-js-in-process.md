---
"@rsvelte/fmt": patch
---

fmt: format `.ts`/`.js` files in-process via `oxc_formatter` instead of
delegating them to an `oxfmt` subprocess. It's the same engine `oxfmt` uses for
these files, so the output is byte-identical (verified 1496/1496 on a real-world
corpus), while skipping the per-invocation `oxfmt` Node startup. CSS / Markdown /
YAML / JSON stay delegated to `oxfmt` (those are a separate, prettier-based
engine).

`.oxfmtrc` `overrides` are now parsed and resolved per file, so each file is
formatted at the same options `oxfmt` would apply. An override `printWidth`
larger than `oxc_formatter` can represent (320) — e.g. a "never wrap" `1000` — is
delegated to `oxfmt` (which honors it) to stay byte-identical. Files `oxc` can't
parse fall back to `oxfmt`, so coverage never regresses, and `--no-native-js` is
an escape hatch.
