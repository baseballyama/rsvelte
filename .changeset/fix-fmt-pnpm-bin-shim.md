---
"@rsvelte/fmt": patch
---

fix(fmt): stop the postinstall binary swap breaking pnpm's `.bin` shim (#1725)

`postinstall` used to copy the platform-native `rsvelte-fmt` binary over
`bin/rsvelte-fmt` (the file `package.json`'s `bin` field points at), so the
package manager's `.bin/rsvelte-fmt` entry would run the native binary
directly with no Node startup cost. It also wrote a `rsvelte-fmt.runtime.json`
sidecar next to the binary with the consumer's `oxfmt` + Node paths, since the
native-direct binary has no launcher to pass them via `--oxfmt-bin` /
`RSVELTE_FMT_NODE`.

pnpm's `.bin` entry is a generated shell shim, not a symlink, and it decides
its interpreter by reading the *target file's shebang at shim-generation
time* — before `postinstall` has necessarily run. If that read sees this
file's original `#!/usr/bin/env node` shebang, pnpm bakes `exec node
".../bin/rsvelte-fmt" "$@"` into the shim permanently. `postinstall`'s later
swap to a native Mach-O/ELF binary then makes that baked-in Node try to parse
binary bytes as JS: `SyntaxError: Invalid or unexpected token` on `pnpm exec
rsvelte-fmt` (the same bug fixed for `@rsvelte/lint` in #1723 / #1726).

`bin/rsvelte-fmt` is now always the Node launcher (never mutated at install
time); it already resolves and execs the platform-native binary itself,
forwarding argv/stdio, the exit code/signal, and the consumer's `oxfmt` +
Node paths via `--oxfmt-bin` / `RSVELTE_FMT_NODE`. This is correct under
every package manager's `.bin` mechanism — symlink (npm, yarn classic) or
generated shim (pnpm) — at the cost of one Node cold start per invocation,
the same trade-off already accepted whenever `postinstall` didn't run
(`--ignore-scripts`, gated build scripts, Windows).

`install.js` and the now-dead `rsvelte-fmt.runtime.json` sidecar reader
(`load_oxfmt_runtime_sidecar` in `crates/rsvelte_fmt/src/oxfmt.rs`) are
removed, along with its dedicated tests — the JS launcher already forwards
the same information on every invocation, so the sidecar had nothing left to
do.
