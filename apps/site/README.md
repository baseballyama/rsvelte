# rsvelte site

The rsvelte site, a static SvelteKit app. GitHub Pages serves it at
[the project's page](https://baseballyama.github.io/rsvelte/).

| Route           | Purpose                                                                   |
| --------------- | ------------------------------------------------------------------------- |
| `/`             | What rsvelte is, and how to start                                         |
| `/guide`        | The user guide: install, the three commands, configuration, exit codes    |
| `/rules`        | The rules of `rsvelte lint`, read from `apps/eslint-plugin/rules.json`    |
| `/playground`   | Compile, format and lint a component with the WebAssembly build in a page |
| `/architecture` | How the toolchain works, for contributors                                 |

The guide repeats [the user guide of `@rsvelte/cli`](../cli/README.md); change both together.
The playground runs the [browser host](../../crates/hosts/README.md#browser--webassembly).

## Local development

Use the repository's pinned Rust toolchain, the Node and pnpm versions in `mise.toml`, and
wasm-pack 0.15.1. Install from the repository root:

```sh
rustup target add wasm32-unknown-unknown
cargo install wasm-pack --version 0.15.1 --locked
pnpm install --frozen-lockfile
pnpm --dir apps/site run dev
```

`dev`, `check` and `build` first run `pnpm run generate`, which builds the WebAssembly bindings
into `generated/`. Git ignores that directory.

`.github/workflows/pages.yml` deploys the site on each push to `main`. It builds with
`PAGES=1`, which serves the site below `/rsvelte`.
