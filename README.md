# rsvelte

rsvelte is a Rust port of the official Svelte 5 compiler and related developer
tools. It aims to match the official compiler output and work directly with the
[OXC](https://oxc.rs/) toolchain.

[Website](https://baseballyama.github.io/rsvelte/) |
[Playground](https://baseballyama.github.io/rsvelte/playground) |
[Compatibility](https://baseballyama.github.io/rsvelte/progress) |
[Benchmarks](https://baseballyama.github.io/rsvelte/benchmark)

> [!WARNING]
> rsvelte passes all in-scope fixtures in the official Svelte 5 test suite, but
> it is still pre-1.0. APIs and behavior may change. Test it carefully before
> using it in production.

## Why rsvelte

Most native JavaScript tools only understand JavaScript and TypeScript files.
They must call the JavaScript-based Svelte compiler to work with `.svelte`
files. rsvelte implements the compiler and related tools in Rust.

This lets tools such as oxlint, oxfmt, Rolldown, and tsgo add Svelte support
without starting the JavaScript compiler.

## Quick start

Use the Vite plugin in a standard Vite and Svelte project:

```bash
npm install -D @rsvelte/vite-plugin-svelte
```

```js
// vite.config.js
import { svelte } from "@rsvelte/vite-plugin-svelte";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [svelte()],
});
```

SvelteKit requires a package manager override. Do not add a second Vite plugin.
See the
[`@rsvelte/vite-plugin-svelte` setup guide](apps/npm/vite-plugin-svelte/README.md)
for the exact configuration.

## Packages

Each package has its own installation guide, API details, and current
limitations.

| Use case                                           | Package                                                                              |
| -------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Vite and SvelteKit                                 | [`@rsvelte/vite-plugin-svelte`](apps/npm/vite-plugin-svelte/README.md)               |
| Svelte compiler for JavaScript and browsers (Wasm) | [`@rsvelte/compiler`](apps/npm/compiler/README.md)                                   |
| Svelte compiler for Node.js (native N-API)         | [`@rsvelte/vite-plugin-svelte-native`](apps/npm/vite-plugin-svelte-native/README.md) |
| Type-checking CLI                                  | [`@rsvelte/svelte-check`](apps/npm/svelte-check/README.md)                           |
| Svelte-to-TSX conversion                           | [`@rsvelte/svelte2tsx`](apps/npm/svelte2tsx/README.md)                               |
| Formatting                                         | [`@rsvelte/fmt`](apps/npm/fmt/README.md)                                             |
| Standalone linting                                 | [`@rsvelte/lint`](apps/npm/lint/README.md)                                           |
| Svelte diagnostics in oxlint                       | [`@rsvelte/oxlint-plugin`](apps/npm/oxlint-plugin/README.md)                         |
| Language server                                    | [`@rsvelte/language-server`](apps/npm/language-server/README.md)                     |
| VS Code                                            | [`rsvelte-vscode`](apps/npm/vscode/README.md)                                        |
| Rust API                                           | [`rsvelte`](crates/rsvelte/README.md)                                                |
| C API and other languages                          | [`rsvelte_capi`](crates/rsvelte_capi/README.md)                                      |

## Compatibility and performance

<!-- svelte-target-version -->

**Targeting Svelte `v5.56.9`** ([`20b341f10048`](https://github.com/sveltejs/svelte/commit/20b341f10048)). This line is updated by `pnpm run update-docs`.
<!-- /svelte-target-version -->

rsvelte passes 100% of the official Svelte fixtures currently in scope. CI also
compares compiler output, diagnostics, formatting, linting, TypeScript output,
source maps, and generated edge cases with the official tools.

- [Live compatibility results](https://baseballyama.github.io/rsvelte/progress)
- [Compatibility checks](compatibility/README.md)
- [Real-world test method](scripts/compat-corpus/README.md)
- [Live benchmarks and test details](https://baseballyama.github.io/rsvelte/benchmark)

The Svelte 4-to-5 migration tool is not in scope.

## Contributing

```bash
git submodule update --init --recursive
pnpm install
pnpm run generate-fixtures
cargo test --release
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for requirements, test commands,
debugging steps, performance tests, and pull request rules.

## License

[MIT](LICENSE)
