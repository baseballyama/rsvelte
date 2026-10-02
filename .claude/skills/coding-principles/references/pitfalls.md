# Pitfalls

Bugs that pass unit tests and are hard to reproduce.

## Joining paths

A path from a user or a config file can be absolute.

- Rust: `base.join(p)` returns `p` when `p` is absolute. This is usually what you want, but if
  `p` must stay inside `base`, check that on purpose.
- TypeScript: use `path.resolve(base, p)`, not `path.join(base, p)`. `join` only glues strings,
  so an absolute `p` becomes `base/p`.

## Symlinks

A path can look like it is inside an allowed directory while a symlink in the middle points
somewhere else. Lexical checks (`resolve`, string prefix) do not follow symlinks.

- Resolve the real path first (`std::fs::canonicalize`, `fs.realpath`), then check it.
- If the target does not exist yet, resolve the nearest parent that exists and add the rest.

## Shared regular expressions (TypeScript)

A `RegExp` with the `g` or `y` flag keeps state in `lastIndex`. If you store it and call
`test()` again, the answer changes between calls. Remove these flags from any regex you cache
or reuse: `flags.replace(/[gy]/g, '')`.

In Rust, compile a regex once (for example in a `LazyLock`) and reuse it. Do not compile it
inside a loop.

## Collections that grow

A cache, history or buffer without a limit grows until the process runs out of memory in a
long-running process (LSP, daemon, watch mode). Give it a finite, named limit and an eviction
rule.

## Skipping work must not shrink the result

It is fine to skip items that did not change. It is not fine to return only the items you
processed when the caller expects one result per input. Return a result for every input, in
input order: new values for the processed items and existing values for the skipped ones.

## Apply a flag to every case

If one option controls several kinds of items, every kind must read the option. A kind that
uses a hardcoded value makes the option silently not work for that kind.
