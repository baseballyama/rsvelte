# crates

```
crates/
├── kernel/                    sources, spans, diagnostics, the artifact database, task scheduling
├── languages/<language>/      css, html, svelte, typescript, vue; each has only the tools it implements
│   ├── core/                  parsing and analysis, registered as shared artifacts
│   ├── compile/               compile tasks
│   ├── format/                format tasks
│   ├── lint/                  lint tasks
│   └── check/                 type check tasks (typescript, vue)
├── languages/svelte/
│   ├── syntax/                the source AST and tokens
│   ├── parser/                source to AST
│   ├── compiler_syntax_tree/  the template HIR
│   ├── semantic/              name resolution and component analysis
│   ├── lint_typed/            type-aware lint rules
│   ├── typescript_projection/ Svelte to TypeScript, for type checks
│   ├── typecheck/             type checks and diagnostic mapping
│   └── compile_vapor/         Svelte compiled for the Vue Vapor runtime
├── languages/typescript/content_mapper/  the protocol to the native TypeScript checker
├── languages/vue/compile_svelte/         Vue compiled for the Svelte runtime
├── language_independent/lint_runner/  rule running and ESLint-style reports, shared by every linter
├── hosts/                     command_line, browser, config: see hosts/README.md
└── test_harness/              runs each crate's tasks over its tests/fixtures/ and the corpus
```

How the crates depend on each other is in the [root README](../README.md).
