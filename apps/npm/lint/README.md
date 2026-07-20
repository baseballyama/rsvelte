# @rsvelte/lint

A fast, native Svelte linter built directly on the
[rsvelte](https://github.com/baseballyama/rsvelte) compiler — no second ESTree
parse, no Node.js in the hot path. `rsvelte-lint` combines two diagnostic
sources in one pass:

1. **Validator wrap** — the rsvelte compiler already emits ~70 warning codes,
   ~145 error codes, and 42 `a11y_*` rules during analysis. Those surface
   directly as lint diagnostics.
2. **Native rule engine** — a single shared AST walk that ports
   [`eslint-plugin-svelte`](https://sveltejs.github.io/eslint-plugin-svelte/)'s
   rules natively (all 80 upstream rules are ported and validated
   byte-for-byte against the plugin's own fixtures — see
   [Rule coverage](#rule-coverage)).

> **⚠️ Early stage (v0).** Output and flags are stabilising.

## Install

```bash
npm install -D @rsvelte/lint
# pnpm add -D @rsvelte/lint
# yarn add -D @rsvelte/lint
```

The package resolves the right prebuilt native binary for your platform via
`optionalDependencies` — there's no oxfmt-style external dependency to install
alongside it; `rsvelte-lint` is self-contained. Supported targets:

| OS | Architecture |
|---|---|
| macOS | arm64, x64 |
| Linux | x64 (glibc), arm64 (glibc) |
| Windows | x64 (MSVC) |

If your platform isn't listed, please [open an issue](https://github.com/baseballyama/rsvelte/issues).

### Native-direct binary (no Node startup)

On install, a `postinstall` step swaps in the platform-native binary as the
CLI's `bin` (the same mechanism [`@rsvelte/fmt`](../fmt) uses), so
`rsvelte-lint` runs directly with no per-invocation Node cold start.

If your package manager **gates install scripts** (e.g. pnpm's
`onlyBuiltDependencies`), allow `@rsvelte/lint` so this step runs:

```jsonc
// package.json (pnpm)
"pnpm": { "onlyBuiltDependencies": ["@rsvelte/lint"] }
```

Without it (or with `--ignore-scripts`, or on Windows) a small Node launcher is
used instead — identical output, just a little slower to start.

## Usage

```bash
npx rsvelte-lint src/                 # lint a directory (recurses, finds *.svelte)
npx rsvelte-lint src/App.svelte       # lint a single file
npx rsvelte-lint --fix src/           # apply autofixes in place
npx rsvelte-lint --format sarif src/  # SARIF for CI code-scanning
npx rsvelte-lint --list-rules         # print every native rule + default severity
```

Add it to your `package.json`:

```json
{
  "scripts": {
    "lint": "rsvelte-lint src/",
    "lint:fix": "rsvelte-lint --fix src/"
  }
}
```

Directory arguments are walked recursively for `.svelte` files (skipping
nothing special — point it at `src/`, not the whole repo, if you have
generated `.svelte` output you don't want linted, or use `ignores` in your
config — see [Configuration](#configuration)). Multiple paths and files can be
mixed on one invocation: `rsvelte-lint src/lib src/routes/+page.svelte`.

Other flags:

| Flag | Effect |
|---|---|
| `--off <rule>` | Turn a rule off (repeatable) |
| `--error <rule>` | Treat a rule as an error (repeatable) |
| `--max-warnings <n>` | Exit non-zero if warnings exceed `n` |
| `--config <file>` | Explicit config path (see [Configuration](#configuration)) |

Run `rsvelte-lint --help` for the authoritative list.

## Configuration

`rsvelte-lint` looks for `rsvelte-lint.json` (or `.rsvelte-lintrc.json`),
walking upward from the working directory, unless `--config <file>` is passed
explicitly:

```json
{
  "extends": ["recommended"],
  "rules": {
    "svelte/no-at-html-tags": "error",
    "svelte/button-has-type": ["warn", { "submit": true, "reset": false }],
    "svelte/no-restricted-html-elements": ["error", { "elements": ["marquee"] }]
  },
  "files": ["src/**/*.svelte"],
  "ignores": ["**/generated/**"]
}
```

- **`extends`** — `["recommended"]` (the default even with no config file at
  all) runs every rule at its declared default severity. `["none"]` (aliases:
  `"off"`, `"empty"`) starts from a baseline where nothing runs unless
  explicitly turned on in `rules`.
- **`rules`** — keyed by rule id (a native `svelte/*` id, or a bare compiler
  code like `a11y_img_redundant_alt` for validator-wrapped findings). A value
  is either a severity scalar — `"off"` / `"warn"` / `"error"`, or the numeric
  ESLint equivalents `0` / `1` / `2` — or a `[severity, options]` pair, where
  `options` is passed straight through to the rule (most rules read
  `options[0]` as an object, matching ESLint's variadic rule-options
  convention).
- **`files`** / **`ignores`** — gitignore-flavoured globs (`**`, `*`, `?`)
  over the path relative to the working directory. An empty `files` list
  matches every candidate passed on the command line; `ignores` always wins
  over `files`.

Run `--list-rules` to see every native rule's id, category, default severity,
and whether it's autofixable; rules with an options schema are marked
`(options)`.

## Migrating from ESLint

`rsvelte-lint` ships as a **complement** to `eslint-plugin-svelte` first, not
(yet) a replacement — the two are designed to run side by side without
double-reporting:

```bash
# Import your existing eslint.config.js svelte/* severities into rsvelte-lint
npx rsvelte-lint --config-from-eslint eslint.config.js src/

# Generate a flat-config snippet that turns the native-owned svelte/* rules
# off in ESLint, so each finding fires exactly once
npx rsvelte-lint --print-eslint-config > eslint.rsvelte.json
```

`--config-from-eslint <file>` statically parses an ESLint flat config and
imports its `svelte/*` rule severities as overrides on top of your
`rsvelte-lint.json` (or the recommended preset if you have none).
`--print-eslint-config` prints a flat-config object disabling every
`rsvelte-lint`-owned rule id in ESLint; spread it into your `eslint.config.js`.

## Suppressing findings

Three suppression forms are supported, so existing ESLint-annotated code and
Svelte's own convention both work with no changes:

- **`<!-- eslint-disable-next-line svelte/no-at-html-tags -->`** / **`<!--
  eslint-disable-line [rule ...] -->`** — suppress specific rules (or every
  rule, with no ids) on the following/same line.
- **`<!-- eslint-disable [rule ...] -->` … `<!-- eslint-enable [rule ...] -->`**
  — suppress a block range; an unmatched `eslint-disable` runs to end of file.
- **`<!-- svelte-ignore <code> -->`** — Svelte's own convention, treated like
  `disable-next-line` for the listed compiler/rule codes. Unlike
  `eslint-disable`, a bare `<!-- svelte-ignore -->` with no codes suppresses
  **nothing** (it never wildcards).

A file can also carry an **inline configure comment** to override a rule's
severity or options for that file only, matching ESLint's own inline-config
syntax:

```svelte
<script>
  /* eslint svelte/sort-attributes: ["error", { "order": ["id", "class"] }] */
</script>
```

This form is parsed leniently (single-quoted strings, unquoted keys, and
trailing commas are all accepted, matching ESLint's own `levn` parser); an
unparseable comment is ignored rather than treated as an error, so it never
turns into a wrong finding.

## Output formats and exit codes

`--format` accepts `human` (default), `human-verbose`, `machine`,
`machine-verbose`, `github-actions` (alias `github`), or `sarif`. The human
formats print a `rsvelte-lint found N errors and M warnings in K files`
summary; the others stay line-oriented for tooling.

| Exit code | Meaning |
|---|---|
| `0` | No errors (and, if `--max-warnings` is set, warnings within budget) |
| `1` | At least one error, or warnings exceeded `--max-warnings` |
| `2` | Usage error (bad `--format`, unreadable config, no input paths) |

## CI integration

```yaml
# .github/workflows/lint.yml
- run: npx rsvelte-lint --format github-actions src/
```

`--format github-actions` emits `::error file=…::…` / `::warning file=…::…`
workflow commands so findings show up as inline annotations on the PR diff.
For code-scanning integration, use `--format sarif` with
[`github/codeql-action/upload-sarif`](https://github.com/github/codeql-action):

```yaml
- run: npx rsvelte-lint --format sarif src/ > rsvelte-lint.sarif
  continue-on-error: true
- uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: rsvelte-lint.sarif
```

## Rule coverage

All 80 `eslint-plugin-svelte` rules are ported natively and validated
byte-for-byte (message, line, column, autofix output, and editor suggestions)
against that plugin's own upstream fixtures by a CI-enforced compat oracle. The
authoritative list of ported rules and the handful of fixtures that genuinely
need a JS/TS tokenizer or type checker (out of scope for the native engine,
covered separately) is the oracle test registry at
[`crates/rsvelte_lint/tests/eslint_plugin_oracle.rs`](https://github.com/baseballyama/rsvelte/blob/main/crates/rsvelte_lint/tests/eslint_plugin_oracle.rs). The default `recommended` preset runs every rule at its declared
default severity: most correctness and style rules default to `warn` (a handful
— e.g. `no-dupe-else-if-blocks`, `no-dupe-style-properties`,
`no-object-in-text-mustaches` — to `error`), while all pure-formatting rules
(owned by the sibling [`@rsvelte/fmt`](../fmt)) plus a set of opinionated opt-in
rules such as `button-has-type`, `no-restricted-html-elements`, and
`sort-attributes` default to `off` and must be enabled via `rules` in your
config. Run `--list-rules` to see the full default-severity table.

## Supported platforms

See [Install](#install) above.

## See also

- [`@rsvelte/fmt`](../fmt) — the sibling Rust-powered formatter for `.svelte` +
  JS/TS/CSS.
- [`@rsvelte/svelte-check`](../svelte-check) — type-checking CLI.
- [`@rsvelte/compiler`](../compiler) — the compiler itself, as WebAssembly.
- [`crates/rsvelte_lint`](https://github.com/baseballyama/rsvelte/tree/main/crates/rsvelte_lint) —
  the Rust crate this package wraps, including the architecture decision
  record and demo.

## License

MIT
