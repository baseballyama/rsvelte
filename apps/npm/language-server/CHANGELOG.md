# @rsvelte/language-server

## 0.6.0

### Minor Changes

- 024e8a5: `textDocument/completion` offers HTML close tags.

  `tag_prefix` excluded a `/` prefix outright, so every `</` position answered with nothing
  while the official server answers with `collectCloseTagSuggestions`
  (`vscode-html-languageservice`). Measured on 29 documents against both servers, rsvelte
  emitted zero `/`-prefixed items in all of them.

  The rule has two branches whose `filterText` disagree about the `>`, so each is the other's
  negative control: with a still-open ancestor whose line indent differs from the cursor's,
  the edit replaces the whole line prefix and filters on `<indent></tag`; otherwise it
  replaces from the `/` and filters on `/tag`. With no ancestor the whole tag table is
  offered and the filter carries the `>`.

  The ancestor's name comes from the document, not the tag data, because a component and a
  `svelte:` element are ancestors the provider does not list — only the no-ancestor fallback
  reads it. An ancestor stops being one when its end tag begins before the cursor, so a fully
  typed `</div>` falls back to the tag table rather than offering `/div`.

### Patch Changes

- 6329638: Vendor the CSS data the official language server reads, with the provenance discipline `html_data/` already uses: the version comes out of language-tools' `pnpm-lock.yaml`, the resolved package has to agree with it, and the SHA-256 of every file read is recorded in the generated header. `getEntryDescription` is ported rather than wrapped and compared to the function itself on all 3,194 entries in both markup kinds.
- 49465da: `textDocument/linkedEditingRange` returns a `wordPattern` that accepts its own ranges.

  The protocol says the pattern describes valid contents for the ranges returned beside it, and a
  client uses it to decide whether an in-flight edit still applies. rsvelte sent a pattern that
  rejected the contents of the very ranges it accompanied — a tag name containing a `.`, such as
  `Foo.Bar`, failed to match — so a client validating an edit against it would stop applying the
  linked rename partway.

  The pattern is now byte-identical to the official server's, which is VS Code's default word
  pattern. The ranges themselves already agreed with official on every measured case; only the
  pattern diverged.

## 0.5.5

### Patch Changes

- cb290b5: A `{:then}` / `{:catch}` binding keeps its own source-map segments, so a diagnostic, symbol or hover on it reports the identifier's real range instead of a zero-width position at the start of the generated chunk
- 4d24fac: Mark unused and deprecated code in diagnostics: fill `DiagnosticTag` from the TypeScript code, which tsgo's LSP omits.
- 846473c: Load `svelte/compiler` from a bundle's `default` export, so preprocessing works in a real project.
- 2152f06: Report an unknown `{#...}` block at its opening type with `expected_block_type`, matching the official compiler instead of deferring the error until a later closing tag. Return the language server's existing `null` result for invalid block-marker completions before attempting to map them through a projection that the malformed template cannot produce.

## 0.5.4

### Patch Changes

- 4840a2e: Stop queued analysis work when the language server shuts down.

## 0.5.3

### Patch Changes

- 81d9def: Ship the VS Code extension as one VSIX per platform.

  The extension bundled all five native language servers — ~110 MB uncompressed,
  including a 24 MB unsigned Windows PE — into a single universal VSIX, and every
  release since 0.5.0 failed the Marketplace's virus check on upload. Open VSX,
  which does not scan, carried 0.5.0/0.5.1/0.5.2 while the Marketplace stayed on
  0.4.1 and has since dropped the extension entirely.

  Each platform now gets its own VSIX carrying only its own server, alongside a
  binary-free universal package that the registries serve to every other platform,
  where the extension falls back to the bundled JS server as before. The publish
  guard also became per `(version, targetPlatform)`: one platform failing
  validation no longer reads as "published" for the rest, so the next run retries
  exactly what is missing.

## 0.5.2

### Patch Changes

- 955b2ac: Declare the language-server capabilities the server already answers. Completion now advertises the TypeScript and Emmet trigger characters (`.` above all, so member completion opens on its own instead of only on an explicit request) as well as `labelDetailsSupport`; `source.addMissingImports` joins the advertised code-action kinds it was already serving; pull diagnostics declare `interFileDependencies`, so editing an imported module refreshes the reports that depend on it; and `prepareProvider` is offered only to a client that advertised prepare support.

## 0.5.1

### Patch Changes

- a70f939: Keep serving after an undecodable LSP message. `lsp_server`'s stdio transport ends its reader thread on the first frame whose body will not deserialize, which closed the connection and took the server down — one malformed message from any client, extension or proxy in the chain and every open document lost its language features. The body of such a frame has already been consumed in full, so the stream is still framed correctly; the message is now dropped with a warning and the server keeps reading. A malformed _header_ stays fatal, because the reader no longer knows where the next frame begins.

## 0.5.0

### Minor Changes

- e69cf32: Ship the complete native editor distribution: upstream-compatible VS Code settings and commands, native VSIX binaries, standalone release archives, and setup for Neovim, Zed, Sublime Text, Helix, and Emacs.
- 8689058: Add native Svelte code lenses, extract-component refactoring, and lint code actions.
- 8ac8590: Add the full TypeScript language surface through a supervised tsgo LSP child and diskless Svelte shadow workspace.

### Patch Changes

- f679440: Add native HTML and CSS language assistance for Svelte documents.
- 3dbee3b: Apply trusted-workspace Svelte preprocessors through a supervised Node sidecar and compose their source maps with TypeScript shadow mappings.

## 0.4.1

### Patch Changes

- 9c22cc3: Build the Linux binaries against glibc 2.35 instead of whatever `ubuntu-latest` happens to provide. The release matrix ran on the hosted `ubuntu-latest` image, which moved to Ubuntu 24.04 (glibc 2.39), so every published `linux-x64-gnu` / `linux-arm64-gnu` artifact refused to start on Ubuntu 22.04 LTS and other distributions on an older glibc — `libc.so.6: version 'GLIBC_2.39' not found`. The Linux legs are now pinned to `ubuntu-22.04`, and each one asserts the requirement by reading the artifact it just built, so a future image bump fails the release instead of shipping.

## 0.4.0

### Minor Changes

- 3c25cd9: Ship the native Rust `rsvelte-language-server` as per-platform npm packages and prefer it from the `@rsvelte/language-server` launcher.

  The launcher's `rsvelte-language-server` bin now resolves the prebuilt binary from the optional `@rsvelte/language-server-<triple>` dependency and execs it, falling back to the bundled JS server when no platform package is installed. `RSVELTE_LANGUAGE_SERVER_BIN` overrides the binary path and `RSVELTE_LANGUAGE_SERVER_JS=1` forces the JS fallback.

## 0.3.0

### Minor Changes

- b0eb890: feat(language-server): apply the project's `rsvelte-lint.json` to editor diagnostics

  The linter runs as wasm and has no filesystem, so `json_api::lint` hardcoded the
  `recommended` preset: every rule ran at its default severity and no project
  config could change that. In a codebase that has never been linted with rsvelte
  — or one whose Svelte rules are already tuned in ESLint — that meant thousands
  of unsuppressable warnings, and turning `rsvelte.lint.enable` off was the only
  way out.

  The server now discovers `rsvelte-lint.json` / `.rsvelte-lintrc.json` by walking
  up from the document's directory (the same file, in the same order, that the
  `rsvelte-lint` CLI resolves) and passes it to the new
  `lint_with_config(source, filename, config)` wasm export, so the editor reports
  what CI does. Resolved configs are cached and dropped when a config file is
  saved. A config that can't be read or parsed is reported to the client's log and
  the recommended preset is used, so a typo never leaves the editor without
  diagnostics.

## 0.2.2

## 0.2.1

### Patch Changes

- fd4572e: `svelte/no-top-level-browser-globals` now uses real scope resolution (oxc_semantic) instead of name matching: local bindings that share a browser global's name — `let { open = $bindable() }` props, imports, `let top` — are no longer falsely flagged, in both `<script>` and template expressions. Fail-safe: unresolvable scripts fall back to the previous behaviour.

## 0.2.0

### Minor Changes

- 678b7b0: feat(language-server): add `@rsvelte/language-server` + `rsvelte-vscode` extension

  A new Language Server (`@rsvelte/language-server`) exposes rsvelte's formatter
  and linter over LSP, and a thin VS Code extension (`rsvelte-vscode`) bundles and
  launches it.

  - **Formatting** — `textDocument/formatting` shells out to the native
    `rsvelte-fmt` CLI (resolved from `node_modules/.bin`, or `rsvelte.rsvelteFmtPath`)
    and returns a whole-document edit; silently disabled when the binary is absent.
  - **Diagnostics** — push diagnostics from the `rsvelte_lint` engine compiled to
    wasm and vendored into the package (no extra install), on open / change
    (300 ms debounce) / save.

  Settings: `rsvelte.format.enable`, `rsvelte.lint.enable`, `rsvelte.rsvelteFmtPath`.
  Type-checking is out of scope for v1.
