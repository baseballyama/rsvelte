Global variable names that ESLint declares for `ecmaVersion: "latest"`, from the MIT-licensed
ESLint 10.14.0 (`conf/globals.js`, `es2026`), and the names of `globals.browser`, from the
MIT-licensed `globals` 16.4.0 (`globals.json`, `browser`). A name in both is a builtin.

Each row of `globals.rs` is `(name, Global::Builtin | Global::Browser)`, sorted by byte order for
binary search.
