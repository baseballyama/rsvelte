Global variable names that ESLint declares for `ecmaVersion: "latest"`, from the MIT-licensed
ESLint (`conf/globals.js`, `es2026`), and the names of `globals.browser`, from the
MIT-licensed `globals` (`browser`, with `node` read for whether Node.js declares the name
too). A name in both ESLint's and `browser` is a builtin. The first line of `globals.rs`
names the versions, which a test compares with `tools/oracle/package.json`.

Each row of `globals.rs` is `(name, Global::Builtin | Global::Browser { node })`, sorted by
byte order for binary search.

`typescript_library.rs` holds the names the MIT-licensed `@typescript-eslint/scope-manager`
declares for `lib: ['esnext']`, its default, each with whether it is a value as well as a
type, sorted the same way. Its first line names the version.

Regenerate both with `node tools/oracle/oracle.ts globals`.
