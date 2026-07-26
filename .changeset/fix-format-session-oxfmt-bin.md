---
"@rsvelte/fmt": patch
---

fix(fmt): let `FormatSession` embedders pin the `oxfmt` binary (#1792)

`rsvelte_fmt::FormatSession` — the in-process pipeline the (upcoming) Rust
language server embeds instead of spawning the `rsvelte-fmt` CLI — always
built `OptionFlags::default()`, which pins `oxfmt` to a bare `oxfmt` on
`$PATH`. That's fine for the CLI, which always gets an explicit `--oxfmt-bin`
from its own npm launcher, but a process an editor spawns directly does not
generally have the consumer's `oxfmt` on `$PATH`.

`FormatSession::resolve_with_oxfmt_bin(path, oxfmt_bin)` lets an embedder pin
the binary explicitly — the embedder-facing equivalent of `--oxfmt-bin` — and
falls back to the new `RSVELTE_FMT_OXFMT_BIN` env var when `None`, mirroring
the `RSVELTE_FMT_NODE` convention the CLI's own npm launcher already uses to
forward its `oxfmt` resolution into the native binary. `FormatSession::resolve`
is unchanged in signature and is now equivalent to
`resolve_with_oxfmt_bin(path, None)`.
