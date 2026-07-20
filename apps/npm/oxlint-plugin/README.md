# @rsvelte/oxlint-plugin

Run rsvelte's Svelte diagnostics as [oxlint](https://oxc.rs/docs/guide/usage/linter)
rules. Add one line to your `.oxlintrc.json` and oxlint's JS/TS rules and
rsvelte's Svelte rules — the native [eslint-plugin-svelte](https://sveltejs.github.io/eslint-plugin-svelte/)
rule ports **plus** the Svelte compiler's own validator / accessibility warnings
— land in a **single pass and a single report**.

The engine is **native-first with a wasm fallback**: on a supported platform the
plugin loads a prebuilt native addon (`rsvelte_lint.node`, shipped in the
per-platform `@rsvelte/lint-<triple>` packages) for maximum speed, and
transparently falls back to the [`@rsvelte/compiler`](https://www.npmjs.com/package/@rsvelte/compiler)
WebAssembly engine everywhere else. Both produce byte-identical diagnostics, and
there is no `postinstall` step.

> **⚠️ Early stage (v0), oxlint alpha.** oxlint's JS-plugin API and its `.svelte`
> support are alpha; see [Limitations](#limitations).

## Install

```bash
npm install -D @rsvelte/oxlint-plugin oxlint
# pnpm add -D @rsvelte/oxlint-plugin oxlint
```

Requires **oxlint ≥ 1.64** (the first release with the JS-plugin API).

## Usage

Enable the plugin and turn on rsvelte's recommended rule set in your
`.oxlintrc.json`:

```json
{
  "jsPlugins": ["@rsvelte/oxlint-plugin"],
  "extends": ["./node_modules/@rsvelte/oxlint-plugin/recommended.json"]
}
```

Then run oxlint as usual:

```bash
npx oxlint .
```

Every Svelte diagnostic is reported under the `svelte/` namespace, so you can
tune any of them alongside oxlint's own rules:

```json
{
  "jsPlugins": ["@rsvelte/oxlint-plugin"],
  "extends": ["./node_modules/@rsvelte/oxlint-plugin/recommended.json"],
  "rules": {
    "svelte/no-at-html-tags": "error",
    "svelte/a11y_missing_attribute": "error",
    "svelte/require-each-key": "off"
  }
}
```

You don't have to use `recommended.json` — you can instead list only the rules
you want:

```json
{
  "jsPlugins": ["@rsvelte/oxlint-plugin"],
  "rules": {
    "svelte/no-at-html-tags": "warn",
    "svelte/a11y_click_events_have_key_events": "warn"
  }
}
```

### Rule ids

- **Native rules** (eslint-plugin-svelte ports) keep their familiar id under the
  `svelte/` prefix, e.g. `svelte/no-at-html-tags`, `svelte/require-each-key`.
- **Compiler / validator / a11y warnings** use the compiler's snake_case code,
  e.g. `svelte/a11y_missing_attribute`, `svelte/css_unused_selector`,
  `svelte/state_referenced_locally`.

Severity is owned entirely by your oxlint config: a rule runs only when your
config (or the bundled `recommended.json`) enables it, and `"off"` / `"warn"` /
`"error"` are honoured as for any oxlint rule. `recommended.json` is generated
from the live rule catalog, so it never drifts from the engine.

## How it works

oxlint's alpha `.svelte` support extracts and lints the `<script>` block. This
plugin registers one oxlint rule per rsvelte diagnostic id; when oxlint visits a
`.svelte` file's script, the plugin reads the **whole** component from disk, runs
rsvelte's linter over all of it once (markup + script + style, cached per file),
and reports each diagnostic under `svelte/<id>`:

- Diagnostics **inside the `<script>` block** are mapped to accurate line/column
  positions.
- Diagnostics in **markup or `<style>`** — which oxlint's `.svelte` support
  cannot yet position — are anchored at the top of the `<script>` block, with
  their real `[line:column]` carried in the message.

## Engine (native / wasm)

The plugin picks its engine at startup:

1. **native** — `require`s `rsvelte_lint.node` from the matching
   `@rsvelte/lint-<triple>` optional dependency (installed automatically for your
   platform);
2. **wasm** — falls back to `@rsvelte/compiler` if the native addon isn't present
   (unsupported platform, `--no-optional`, …).

Both engines run the same Rust rule engine and return identical diagnostics.
Override the choice with `RSVELTE_OXLINT_ENGINE=native|wasm` (setting `native`
errors instead of falling back — useful in CI to guarantee the fast path), and
set `RSVELTE_OXLINT_DEBUG=1` to print the selected engine once to stderr.

## Limitations

These follow from the current (alpha) state of oxlint's `.svelte` support and
will lift as it matures:

- **Scriptless components are skipped.** oxlint does not invoke plugins on a
  `.svelte` file that has no `<script>` block, so this plugin sees nothing for
  them and reports nothing. A component with any `<script>` (even an empty one)
  is linted in full, markup included. To lint an otherwise scriptless component,
  add an empty `<script></script>`.
- **Markup / style positions are approximate.** As described above, such
  diagnostics point at the top of the `<script>` block; the true location is in
  the message text (`[line:column] …`).
- **No autofix.** rsvelte's fixes are not yet bridged to oxlint's `--fix`.

For pixel-accurate markup positions and full scriptless coverage today, use
[`rsvelte-check`](https://www.npmjs.com/package/@rsvelte/svelte-check) or the
[rsvelte VS Code extension](https://marketplace.visualstudio.com/items?itemName=baseballyama.rsvelte-vscode)
directly; this plugin is about folding Svelte diagnostics into an existing oxlint
pass.

## Sister packages

Part of the [rsvelte](https://github.com/baseballyama/rsvelte) project — a
Rust port of the Svelte compiler:

- [`@rsvelte/compiler`](https://www.npmjs.com/package/@rsvelte/compiler) — the compiler / linter engine (wasm)
- [`@rsvelte/svelte-check`](https://www.npmjs.com/package/@rsvelte/svelte-check) — CLI type + diagnostic checker
- [`@rsvelte/svelte2tsx`](https://www.npmjs.com/package/@rsvelte/svelte2tsx) — Svelte → TSX
- [`@rsvelte/fmt`](https://www.npmjs.com/package/@rsvelte/fmt) — the formatter
- [`@rsvelte/vite-plugin-svelte`](https://www.npmjs.com/package/@rsvelte/vite-plugin-svelte) — the Vite plugin

## License

MIT
