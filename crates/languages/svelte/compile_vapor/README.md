# Svelte to Vue Vapor

`rsvelte_svelte_compile_vapor` compiles supported Svelte 5 components to JavaScript for Vue
Vapor. It shares the Svelte trees and facts with the other Svelte tasks. The Rust backend builds
a new JavaScript tree and prints it once.

| Target | Task                    | Runtime                                  |
| ------ | ----------------------- | ---------------------------------------- |
| Client | `vuelte.compile/client` | Vue Vapor, mounted with `createVaporApp` |
| Server | `vuelte.compile/server` | Vue SSR, rendered with `createSSRApp`    |

Client output calls `defineVaporComponent` and DOM template factories, plus `renderEffect`,
`createIf`, `createFor` and `createDynamicComponent`. Bindings clean up when
their scope ends. The native server emitter reads the same translated tree and writes escaped
HTML. Head content is on the Vue SSR context as `head`. Hydration is not supported.

Custom elements mount through `createVaporApp`. Their wrapper handles typed props, attribute
reflection, shadow settings, native slots and connection lifecycles.

The compiler supports parts of these features:

- Runes, branches, loops, keys and await blocks
- Snippets, component props and children, raw markup and const tags
- Bindings, actions, attachments, transitions and animations
- Styles and special elements

[Documentation coverage](COVERAGE.md) lists each feature and its remaining work. Unsupported
constructs return `vuelte_unsupported`.

Client tests use the production browser runtime from
[Vue `3.6.0-rc.14`](https://github.com/vuejs/core/tree/v3.6.0-rc.14/packages/runtime-vapor).
Generated imports use `vue`, as a client bundler does. The fixture tools install this version
as `vue-vapor`, which keeps it apart from the regular Vue oracle.

```sh
cargo test -p rsvelte_svelte_compile_vapor
mise exec -- node --test tools/oracle/behaviour/*.test.ts
```

The runtime tests compare each compiled fixture with the official Svelte output after mount,
after each user action and after a requested unmount. They also compare head output when a case
asks for it. As a positive control, a broken update must report a mismatch. A browser case with
`node = true` also runs the client trace in Node.

The cases cover:

- State isolation, snapshots, branch disposal and nested keyed lists
- Await blocks, snippets, component snippets and head content
- Lifecycle cleanup, form groups, empty-list fallbacks, nested styles and table cells

In Chrome, browser cases compare:

- Dimensions, ResizeObserver disposal and scrolling
- Custom element host events, shadow modes and injected CSS
- Transitions and keyed move animations

Full corpus parity and performance for Vapor are **UNMEASURED**.
