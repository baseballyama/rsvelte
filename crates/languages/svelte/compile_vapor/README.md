# Svelte to Vue Vapor

`rsvelte_svelte_compile_vapor` compiles supported Svelte 5 components to JavaScript
for Vue Vapor. It shares the Svelte trees and facts with the other Svelte tasks.
The Rust backend builds a new JavaScript tree and prints it once.

| Target | Task | Runtime |
|---|---|---|
| Client | `vuelte.compile/client` | Vue Vapor, mounted with `createVaporApp` |
| Server | `vuelte.compile/server` | Vue SSR, rendered with `createSSRApp` |

Client output calls `defineVaporComponent`, DOM template factories, `renderEffect`,
`createIf`, `createFor`, and `createDynamicComponent`. Bindings clean up when their scope ends. The native
server emitter reads the same translated tree and writes escaped HTML. Head
content is available on the Vue SSR context as `head`. Hydration is not supported.

Custom elements mount through `createVaporApp`. Their wrapper handles typed props,
attribute reflection, shadow settings, native slots, and connection lifecycles.

The compiler supports parts of runes, branches, loops, keys, await blocks,
snippets, component props and children, raw markup, const tags, bindings, actions, attachments, transitions, animations, styles, and
special elements. See [documentation coverage](COVERAGE.md) for each feature and
its remaining work. Unsupported constructs return `vuelte_unsupported`.

Client tests use the production browser runtime from
[Vue 3.6.0-rc.10](https://github.com/vuejs/core/tree/v3.6.0-rc.10/packages/runtime-vapor).
Generated imports use `vue`, as a client bundler does. The fixture tools install
this version as `vue-vapor` so the regular Vue 3.5.43 oracle stays separate.

```sh
cargo test -p rsvelte_svelte_compile_vapor
mise exec -- node --test tools/fixtures/test/behaviour*.test.ts tools/fixtures/test/vapor-browser.test.ts
```

The runtime tests compare each compiled fixture with official Svelte output after
mount, each user action, and requested unmount. Head output is checked when requested. A deliberately broken update must report a mismatch.
Cases include state isolation, snapshots, branch disposal, nested keyed lists,
await blocks, snippets, head content, lifecycle cleanup, form groups, empty-list
fallbacks, nested styles, component snippets, and table cells.
A browser case with `node = true` also runs the client trace in Node.
Browser cases compare dimensions, ResizeObserver disposal, scrolling, custom element host events, shadow modes, injected CSS, transitions and keyed move animations in Chrome.
Full corpus parity and performance for Vapor are **UNMEASURED**.
