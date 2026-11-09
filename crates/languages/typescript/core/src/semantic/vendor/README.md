Global variable names that ESLint declares for `ecmaVersion: "latest"`, from the MIT-licensed
ESLint 10.14.0 (`conf/globals.js`, `es2026`), and the names of `globals.browser`, from the
MIT-licensed `globals` 16.4.0 (`globals.json`, `browser`, with `node` read for whether Node.js
declares the name too). A name in both ESLint's and `browser` is a builtin.

Each row of `globals.rs` is `(name, Global::Builtin | Global::Browser { node })`, sorted by byte
order for binary search.
