# rsvelte_lint

A fast, native Svelte linter built directly on the [rsvelte](../../) compiler —
no second ESTree parse, no Node.js in the hot path. See
[`docs/svelte-lint-design.md`](../../docs/svelte-lint-design.md) for the full
architecture & decision record.

> **Using this from a JS/TS project?** Install the prebuilt
> [`@rsvelte/lint`](../../apps/npm/lint) npm package instead of building this
> crate from source:
>
> ```bash
> npm install -D @rsvelte/lint
> npx rsvelte-lint src/
> ```
>
> See [`apps/npm/lint`](../../apps/npm/lint) for the full CLI/config reference.
> The rest of this README covers running/developing the crate directly with
> Cargo.

It combines two diagnostic sources:

1. **Validator wrap** — the rsvelte compiler already emits ~70 warning codes,
   ~145 error codes, and 42 `a11y_*` rules during analysis. We surface those as
   lint diagnostics with near-zero rule code (the "single biggest lever").
2. **Native rule engine** — a single shared DFS over the template AST that
   dispatches to `Rule` hooks, porting the proven `vize_patina` structure.

## Try it

```bash
cargo run -p rsvelte_lint -- crates/rsvelte_lint/demo/Demo.svelte
```

See [`demo/README.md`](demo/README.md) for the expected output and the opt-in /
autofix / SARIF variants.

## Usage

```bash
cargo run -p rsvelte_lint -- src/                 # lint a directory
cargo run -p rsvelte_lint -- --fix src/           # autofix in place
cargo run -p rsvelte_lint -- --format sarif src/  # SARIF for CI code-scanning
cargo run -p rsvelte_lint -- --list-rules         # list the native rules
cargo run -p rsvelte_lint -- --print-eslint-config > eslint.rsvelte.json
```

Key flags: `--config <file>` (auto-discovers `rsvelte-lint.json` upward when
omitted), `--config-from-eslint <eslint.config.js>` (import `svelte/*`
severities), `--off`/`--error <rule>`, `--max-warnings <n>`. Output formats:
`human`, `human-verbose`, `machine`, `machine-verbose`, `github-actions`,
`sarif`. Exit codes follow ESLint conventions (non-zero on any error or when
`--max-warnings` is exceeded).

## Config (`rsvelte-lint.json`)

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

A rule value is a severity scalar (`"off"`/`"warn"`/`"error"` or `0`/`1`/`2`) or
a `[severity, ...options]` pair. `extends: ["none"]` starts from an empty
baseline.

## Coexisting with ESLint

rsvelte-lint ships as a **complement** to ESLint, not (yet) a replacement. Run
`--print-eslint-config` to generate a flat-config snippet that turns the
native-owned `svelte/*` rules off in ESLint so each finding fires exactly once.

## Native rules

Default-on (recommended): `no-at-html-tags`, `no-at-debug-tags` (autofix),
`require-each-key`, `no-dupe-else-if-blocks`, `no-dupe-style-properties`,
`no-object-in-text-mustaches`. Opt-in (off by default, matching
eslint-plugin-svelte's `recommended: false`): `button-has-type`,
`no-restricted-html-elements`. Each is a 1:1 port of the corresponding
eslint-plugin-svelte rule and validated against that plugin's own fixtures by the
compat oracle (`tests/eslint_plugin_oracle.rs`). Run `--list-rules` to see
defaults.

## Testing

```bash
cargo test -p rsvelte_lint
cargo clippy -p rsvelte_lint --all-targets --all-features -- -D warnings
```

The compat oracle reads fixtures from the `eslint-plugin-svelte` reference
submodule and skips automatically when it isn't checked out.
