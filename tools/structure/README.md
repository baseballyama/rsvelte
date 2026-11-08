# Structure check

Checks the repository's layout: file sizes against `limits.json`, and the crate graph
(`crates.test.ts`: which kind of crate may depend on which).

```sh
mise run structure
```

Split a file that is over its limit, or list it in `limits.json` with the reason it may stay
larger.
