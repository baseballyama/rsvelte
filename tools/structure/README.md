# Structure check

Checks the repository's layout:

- File sizes, against `limits.json`.
- The crate graph (`crates.test.ts`): which kind of crate may depend on which, and that each
  language crate's name follows its path.
- The kernel's layers (`kernel.test.ts`): each kernel module uses only the modules listed before
  it in its `lib.rs`.
- Module files (`modules.test.ts`): no file only lists child modules. Its parent declares such a
  module inline. No file writes its tests inline; they sit in `tests.rs`.
  No parent defines an item that it never uses and that one child alone uses.

```sh
mise run structure
```

Split a file that is over its limit, or list it in `limits.json` with the reason it may stay
larger.
