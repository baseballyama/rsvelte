# structure

Checks the repository's layout: file sizes against `limits.json`, and the crate graph
(`crates.test.ts`: which kind of crate may depend on which).

```sh
mise run structure
```

A file over its limit is split, or listed in `limits.json` with the reason it may stay larger.
