---
"@rsvelte/fmt": minor
---

perf(fmt): cache formatted inline `<style>` blocks to skip the oxfmt round-trip (#703)

Inline `<style>` CSS is delegated to `oxfmt` (for byte-identical output parity with standalone `.css`), which means staging the body and a subprocess round-trip — the dominant cost when formatting a real `.svelte` tree. Most `<style>` bodies are already canonical on a re-run, so this work was repeated every invocation.

`rsvelte-fmt` now keeps an on-disk content-addressed cache of formatted `<style>` results, keyed by the oxfmt version (binary fingerprint), the resolved `.oxfmtrc`, and the exact body. Unchanged blocks are served from cache and skip `oxfmt` entirely; only cache misses reach the batched oxfmt call. Cache hits are byte-identical to a fresh format, so output is unchanged.

On a warm cache the inline-`<style>` overhead effectively disappears (in a local 343-block check, the run dropped from ~0.37s to ~0.17s; on larger real corpora the saved oxfmt round-trip is proportionally bigger). Cold runs add only the cost of writing cache entries.

The cache is on by default. Disable it with `--no-style-cache` or `RSVELTE_FMT_NO_CACHE`; relocate it with `RSVELTE_FMT_CACHE_DIR` (defaults to the platform cache dir, e.g. `~/.cache/rsvelte-fmt`).
