# structure

Checks the repository's layout: file sizes against `limits.json`, the crate graph
(`crates.test.ts`: which kind of crate may depend on which), and the kernel's layers
(`kernel.test.ts`: each kernel module uses only the modules listed before it in its `lib.rs`).

```sh
mise run structure
```

A file over its limit is split, or listed in `limits.json` with the reason it may stay larger.
