# Crates

A crate's place says what it knows: no language, one language, or how to run plugins.

```
crates/
├── language_independent/      know no language
│   ├── kernel/                documents, spans, diagnostics, generated text, the artifact database, task scheduling
│   ├── plugin_interface/      what a host gives a plugin: options, the tasks that run, functions
│   ├── lint_runner/           rule running and ESLint-style reports, for any linter
│   ├── document_printer/      layout instructions and a printer, for any formatter
│   └── test_harness/          runs each crate's tasks over its tests/fixtures/ and the corpus
├── languages/<language>/      css, html, svelte, typescript, vue; each has only the crates it needs
│   ├── syntax/                trees and their parser; depends only on other syntax crates
│   ├── semantic/              analysis of those trees; depends only on syntax and semantic crates
│   ├── compile/               compile tasks, or what compilers share (css: scoping)
│   ├── format/                format tasks
│   ├── lint/                  lint tasks, or what linters share (html: button types)
│   └── check/                 type check tasks (svelte, typescript, vue)
├── languages/svelte/typescript_projection/  Svelte to TypeScript, for type checks
├── languages/typescript/content_mapper/  the protocol to the native TypeScript checker
├── bridges/                   compile one framework's components for another's runtime
│   ├── svelte_to_vue_vapor/   Svelte compiled for the Vue Vapor runtime
│   └── vue_to_svelte/         Vue compiled for the Svelte runtime
└── hosts/                     run plugins: command_line, browser, site; see hosts/README.md
    └── configuration_loading/ loads configuration files, for hosts only
```

Each crate under `languages/` takes the name `rsvelte_<language>_<directory>`, with `css` spelled
`stylesheet` and `html` spelled `markup`. A language splits into syntax and semantic only where some
crate needs the trees without the analysis. A language uses another when it embeds it: Svelte and
Vue embed CSS, HTML and TypeScript, and neither uses the other. Crates under `bridges/`, named
`rsvelte_<directory>`, are the one place that uses two frameworks.

A task needs only the kernel and the plugin interface. The lint runner and the document printer
are there for the tasks that want them. `tools/structure/crates.test.ts` checks who may depend on
whom.

How the crates depend on each other is in the [root README](../README.md).
