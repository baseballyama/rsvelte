# `import-without-separator.svelte`

**Issue:** user report (Mochi + Bun build, no issue number)

`import"pkg";` needs no whitespace after the keyword, and that is how Bun's TypeScript transpiler prints a side-effect import, so every `lang="ts"` component with one reached `compile()` in this shape. The client's import extractor recognised a declaration by the literal prefixes `import ` / `import{`, left the statement in the script body, and emitted it inside the component function, which no parser accepts. The server and `compileModule` were never affected. The separator is the payload, so this file is deliberately not in formatted shape. The neighbouring cells (`'…'`, a tab, a newline or a comment after the keyword, `import*as`, the ASI forms whose ` from ` needle had the same baked-in space, and `import ("pkg")` / `import.meta`, which must *not* hoist) are in `crates/rsvelte_core/tests/import_without_separator.rs` with expected values from the official compiler.
