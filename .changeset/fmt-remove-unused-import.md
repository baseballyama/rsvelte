---
"@rsvelte/fmt": patch
---

fix(fmt): remove an unused `format_expression_source` import in `markup.rs`. The dead import had no effect on formatter output, but the CI build runs with `RUSTFLAGS=-Dwarnings`, which promotes the `unused import` warning to a hard compile error and broke the Clippy, Documentation, and Test jobs on `main`. Dropping the import restores a clean build.
