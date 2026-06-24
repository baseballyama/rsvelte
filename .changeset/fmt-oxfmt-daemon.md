---
"@rsvelte/fmt": patch
---

fmt: format inline `<style>` blocks through a warm oxfmt daemon (POSIX) instead
of spawning `oxfmt` per block. Spawning paid a Node cold start (~370ms measured)
every time a changed `<style>` block was re-formatted — the dominant cost of
format-on-save once `.svelte`/`.ts`/`.js` moved in-process. A long-lived daemon
(`daemon.mjs`, shipped in the package) keeps oxfmt loaded; the binary connects
over a Unix socket and gets each block back in ~ms (~370ms → ~5ms warm).

The daemon is deliberately "dumb": the Rust side resolves the per-block oxfmt
options (base `.oxfmtrc` + the block's print width) and sends them inline, so the
daemon never reads config files or applies `overrides` — its output is
byte-identical to the spawn path (verified 555/555 on a real-world `.svelte`
corpus, daemon vs spawn). Any failure (no Node, no bundle, connect/spawn/protocol
error) falls back to spawning `oxfmt`, so correctness never depends on it; Windows
stays on the spawn path. `RSVELTE_FMT_NO_DAEMON=1` forces the spawn path.

The daemon is version-keyed by oxfmt fingerprint + protocol version (an oxfmt
upgrade starts a fresh one), idle-exits after 60s, and handles concurrent
invocations (e.g. `pnpm -r`) on one instance. Directory delegation stays a single
`oxfmt` invocation — oxfmt already parallelizes its own directory walk there, so
routing it per-file through the daemon would be slower, not faster.
