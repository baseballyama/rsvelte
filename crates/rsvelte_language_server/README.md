# `rsvelte_language_server`

The Svelte language server, as a Rust binary calling `rsvelte_core` directly.

## Vendored data

The HTML surface (tags, attributes, value sets, and the prose each carries) is
not written here — it is generated from the data the **official** language
server itself loads, so a completion's documentation is the same text on both
sides rather than a paraphrase.

| | |
|---|---|
| Package | [`vscode-html-languageservice`](https://github.com/microsoft/vscode-html-languageservice) |
| Version | `5.4.0`, the version `submodules/language-tools/pnpm-lock.yaml` pins |
| Licence | MIT (Microsoft Corporation) |
| Generated file | `src/html_data/web.rs` |
| Oracle fixture | `tests/data/html-documentation.json` |

Read from the `umd` build, which is what the package's `package.json` `main`
resolves to and therefore what the official server loads — the `esm` copy of the
same data hashes differently:

| File | SHA-256 |
|---|---|
| `lib/umd/languageFacts/data/webCustomData.js` | `34c1cf092562346e6a40a50567b6b22f0139981fe07f46d7f357820e4d2ecfd5` |
| `lib/umd/languageFacts/dataProvider.js` | `ae8c30b8cc165afd538198dac6b607f8a46b9d98624ee6811cc8ca86982be0d4` |

And from language-tools (MIT), pinned by the submodule:

| File | SHA-256 |
|---|---|
| `packages/language-server/src/plugins/html/dataProvider.ts` | `d065c264889493856a0b289e9e8563515f57c20e68acf0daa368b52110c6a01c` |
| `packages/language-server/dist/src/plugins/html/dataProvider.js` | `bfe5651d24d9f92c2445caa58764484caf9c6ce0635bfceb13452799d9ab627e` |

Regenerate both the table and the fixture with:

```bash
node scripts/dev/generate-html-data.mjs
```

It reads the version out of the lockfile and refuses to run against a package
that disagrees with it, so the pin lives in the repository rather than in
whatever happens to be installed. The package must be installed under
`submodules/language-tools` (`pnpm install` there); `--package-root <dir>`
points it elsewhere.

The official server does not serve that data directly: `svelteHtmlDataProvider`
(`packages/language-server/src/plugins/html/dataProvider.ts` in language-tools)
merges it with Svelte's own tags and directives. `src/html_data/svelte_html.rs`
is generated from that provider and holds **only the difference** — 11 tags, 108
global attributes and 8 tags with extra attributes — read out of the build in
`submodules/language-tools`, which the script accepts only when its own copy of
the TypeScript source hashes to the one this repository pins. Pass
`--language-tools-root <dir>` for a build outside the submodule.

Two things are **ported** rather than wrapped — the merge itself
(`src/html_data/provider.rs`) and `generateDocumentation` with the baseline
helpers it calls (`src/html_data/documentation.rs`). Ports of one upstream
function are the defect class this repository has paid for most often, so both
are compared to the functions themselves: all 607 entries the data holds in both
documentation formats (`tests/html_documentation.rs`), and the attribute list
served for every one of the 127 tags (`tests/svelte_html_provider.rs`). The
generator refuses to write anything unless replaying the merge in JavaScript
also reproduces the provider exactly, so the fixture and the port are checked
against the same function from two directions.
