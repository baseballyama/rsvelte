# Conditional deletion prototype

This is an opt-in Vite **build adapter** for closed applications. It demonstrates
safe removal of a Svelte branch and its private styles. It does not replace the
native compiler or enable optimization in the dev server.

## Run

Use the Node version in `mise.toml`. The browser tests use installed Chrome.
Set `CHROME_PATH` on other machines.

```sh
npm ci --prefix tools/experiments/conditional-dce
npm test --prefix tools/experiments/conditional-dce
npm run test:native --prefix tools/experiments/conditional-dce
```

The first command installs only this experiment's dependencies. Tests write
build outputs under a temporary directory and reports under `results/`.
`AUDIT_CASES=primary` selects one browser case when running `node test.mjs`
directly. The full test runner requires all cases.

## Build API

```js
import { certifiedBuild } from './build.mjs';

const result = await certifiedBuild({
  config: { root, configFile: false, build: { sourcemap: true } },
  compiler: { preprocess },
  plugins: applicationPlugins,
  targets: [absoluteComponentPath],
});
// result.output contains the final Vite output; files are not written.
```

All application plugins must use the `plugins` argument. Each build gets fresh
Svelte plugin instances. Vite config files and hidden bundler plugins are rejected. Automatic PostCSS
config discovery is disabled. Explicit CSS pipelines keep their original output.
The caller publishes `result.output` only after this promise succeeds.

## Order

1. Run the complete Vite build with normal preprocessing and module resolution.
2. Read final transformed modules at `buildEnd`. Resolve each component import
   through Vite. Record all known prop values and all unknown uses.
3. If a compiler-owned condition is unreachable, run a second Vite build.
   Rewrite its source AST ranges before compilation. Keep the conditional
   boundary, replace its test with `false`, and remove its dead fragment.
4. Svelte determines style usage from the new template. Vite performs normal
   CSS splitting, URL handling, minification, hashing, and manifest generation.
5. Verify that other module inputs, compiler CSS, transformed code, and resolved
   edges match the first build. Abort on a changed revision before returning output.

Deletion requires normal production CSS minification.
There are no deletion comments, custom CSS emit hooks, or runtime variant
helpers. Shared styles and all keyframes remain available. This deliberately
keeps keyframes whose uses may pass through CSS variables or another stylesheet.

## Acceptance contract

| Boundary | Accepted behavior |
|---|---|
| Source | One plain `$props()` binding for `variant`; one pure `variant === 'danger'` condition; static fragments |
| Callers | Every reference is a direct imported component call with one literal string `variant` property |
| Unknown values | Keep the branch for spreads, getters, aliases, re-exports, escapes, and missing callers |
| Public API | Keep components that are entries, custom elements, or dynamically imported directly |
| Source writes and effects | Keep unrecognized scripts, bindings, template writes, and effectful conditions and dynamic template code |
| Later transforms | Keep when final component code differs from its compiler output |
| Config and output hooks | Keep when an application plugin declares a config or output hook; no preservation contract is assumed |
| Replay | Reject changed source, callers, compiler output, CSS, or module edges |
| CSS plugins | Keep if an application load/transform hook handles styles, emits files, or an explicit CSS pipeline is configured |
| CSS modes | Keep custom scope hashes, injected CSS, and unrecognized compiler modes |
| CSS | Let Svelte match selectors against the retained template; never infer ownership from a class name |

Use the pinned Svelte runtime. Do not replace compiler runtime helpers or create
DOM that reuses another component's private scope classes.
This contract assumes that all component callers are in the resolved graph.
External code must not obtain and invoke private component functions. Arbitrary
plugins that mutate other plugins or their hook contexts are outside the contract.
Other conditions and source shapes keep their original behavior and size.

## Evidence

The checked run is in [measurements/summary.json](measurements/summary.json).
A full run writes a new `results/summary.json`. Browser tests compare actual DOM,
computed colors, active animations, and side effects. They check lazy CSS loading,
manifest references, changed CSS hashes, and per-component compiler CSS maps.
SSR tests compare server HTML and hydrate it in Chrome with recovery disabled.
Revision tests add changes on purpose and require rejection. They also check that
one component can be removed while another remains.

The native executable borrows real `SyntaxTree` values, reads facts keyed by file,
artifact, revision, and node, and builds a separate output tree through `copy`.
It checks unchanged input trees, source spans, stale facts, and ordered work per
file. Its facts are supplied by the test; it does not infer Svelte prop values.

## Limits and native adoption

Two full builds are required when deletion succeeds. This reference adapter
parses generated JavaScript and sends edited source through the official
compiler again. It **does not meet the kernel's parse-once / no-reparse goal**.
No cold-build speed, HMR speed, corpus coverage, or complete final output source
map claim is made. Compiler CSS map probes do not prove final minified CSS maps.

For native adoption, keep the graph/proof boundary and revision checks. Replace
`rewriteSource` with a transform of the stored immutable tree or lowered IR.
Store proofs in a side table keyed by artifact identity and source revision.
Emit the analysis artifact first, then emit the proven artifact from the same
stored tree. The native executable verifies the mechanics of this contract;
connecting it to native Svelte lowering is still required.
