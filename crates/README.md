# crates

A crate's place says what it knows: no language, one language, or how to run plugins.

```
crates/
├── language_independent/      know no language
│   ├── kernel/                sources, spans, diagnostics, the artifact database, task scheduling
│   ├── plugin_interface/      what a host gives a plugin: options, the tasks that run, functions
│   ├── lint_runner/           rule running and ESLint-style reports, for any linter
│   ├── document_printer/      layout instructions and a printer, for any formatter
│   └── test_harness/          runs each crate's tasks over its tests/fixtures/ and the corpus
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
└── hosts/                     run plugins: command_line, browser, site; see hosts/README.md
    └── configuration_loading/ loads configuration files, for hosts only
```

A task needs only the kernel and the plugin interface. The lint runner and the document printer
are there for the tasks that want them. `tools/structure/crates.test.ts` checks who may depend on
whom.

How the crates depend on each other is in the [root README](../README.md).
