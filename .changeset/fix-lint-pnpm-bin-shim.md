---
"@rsvelte/lint": patch
---

fix(lint): stop the postinstall binary swap breaking pnpm's `.bin` shim (#1723)

`postinstall` used to copy the platform-native `rsvelte-lint` binary over
`bin/rsvelte-lint` (the file `package.json`'s `bin` field points at), so the
package manager's `.bin/rsvelte-lint` entry would run the native binary
directly with no Node startup cost.

pnpm's `.bin` entry is a generated shell shim, not a symlink, and it decides
its interpreter by reading the *target file's shebang at shim-generation
time* — before `postinstall` has necessarily run. If that read sees this
file's original `#!/usr/bin/env node` shebang, pnpm bakes `exec node
".../bin/rsvelte-lint" "$@"` into the shim permanently. `postinstall`'s later
swap to a native Mach-O/ELF binary then makes that baked-in Node try to parse
binary bytes as JS: `SyntaxError: Invalid or unexpected token` on `pnpm exec
rsvelte-lint`.

`bin/rsvelte-lint` is now always the Node launcher (never mutated at install
time); it resolves and execs the platform-native binary itself, forwarding
argv/stdio and the exit code/signal. This is correct under every package
manager's `.bin` mechanism — symlink (npm, yarn classic) or generated shim
(pnpm) — at the cost of one Node cold start per invocation, the same
trade-off already accepted whenever `postinstall` didn't run (`--ignore-scripts`,
gated build scripts, Windows).
