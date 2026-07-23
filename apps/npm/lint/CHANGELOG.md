# @rsvelte/lint

## 0.9.1

### Patch Changes

- 690a885: fix(lint): stop the postinstall binary swap breaking pnpm's `.bin` shim (#1723)

  `postinstall` used to copy the platform-native `rsvelte-lint` binary over
  `bin/rsvelte-lint` (the file `package.json`'s `bin` field points at), so the
  package manager's `.bin/rsvelte-lint` entry would run the native binary
  directly with no Node startup cost.

  pnpm's `.bin` entry is a generated shell shim, not a symlink, and it decides
  its interpreter by reading the _target file's shebang at shim-generation
  time_ — before `postinstall` has necessarily run. If that read sees this
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

## 0.9.0

## 0.8.2

## 0.8.1

### Patch Changes

- a44b469: fix(compiler): add a stable `@rsvelte/compiler/wasm` subpath and fix package metadata

  The published package now exposes the WebAssembly binary under a stable
  `@rsvelte/compiler/wasm` export. Previously the only way to reach the `.wasm`
  bytes (e.g. to drive `initSync` on Node) was a deep import that hard-coded the
  internal build crate's filename, so consumers broke whenever that name changed
  (`rsvelte_core_bg.wasm` → `rsvelte_lint_bg.wasm`). Import from
  `@rsvelte/compiler/wasm` instead — it stays stable across releases.

  Existing crate-named deep imports keep working (an `exports` passthrough
  preserves them), and the default `import ... from '@rsvelte/compiler'` is
  unchanged.

  Also corrects the package `description`, which had been the linter crate's text
  rather than the compiler's.

- 386f732: fix(wasm): enable reference-types in wasm-opt

  Newer rustc/LLVM can emit a second wasm table (a reference-types externref table
  alongside the funcref indirect-call table) for `wasm32-unknown-unknown`, which
  `wasm-opt`'s default MVP feature set rejects with "Only 1 table definition allowed
  in MVP". Whether the extra table appears depends on the rustc version CI resolves
  that day, not on anything in this repo, so the wasm build could break without any
  change here.

  Passing `--enable-reference-types` lets wasm-opt parse and optimize it. The
  `rsvelte_fmt_wasm` artifact shrinks ~1% as a result; `rsvelte_lint`'s is byte-identical.

## 0.8.0
