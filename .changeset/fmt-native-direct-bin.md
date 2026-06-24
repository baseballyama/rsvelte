---
"@rsvelte/fmt": patch
---

fmt: ship the CLI as a native-direct binary, dropping the Node launcher from the
hot path. A `postinstall` step now copies the platform-native `rsvelte-fmt`
binary over the package's `bin/rsvelte-fmt`, so the package manager's
`.bin/rsvelte-fmt` runs the binary directly — no per-invocation Node cold start
(~200ms measured). The consumer's `oxfmt` launcher + Node interpreter, which the
JS launcher used to pass via `--oxfmt-bin` / `RSVELTE_FMT_NODE`, are written to a
`rsvelte-fmt.runtime.json` sidecar at install time and read by the binary.

The JS launcher is kept as a fallback for when `postinstall` doesn't run
(`--ignore-scripts`, package managers that gate build scripts, or Windows, which
stays on the launcher) — same behavior as before, just slower. Output is
unchanged (same formatter engine); this is purely a distribution/startup change.

Consumers that gate install scripts (e.g. pnpm's `onlyBuiltDependencies`) should
allow `@rsvelte/fmt` to get the native-direct speedup; otherwise the fallback
launcher is used.
