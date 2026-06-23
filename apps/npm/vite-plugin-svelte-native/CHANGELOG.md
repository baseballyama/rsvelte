# @rsvelte/vite-plugin-svelte-native

## 0.2.6

### Patch Changes

- d3eb1c0: Fix the doubled `apps/apps/npm/...` path in the published `repository.directory`
  metadata. The correct location is `apps/npm/<pkg>`, so the "source" link on
  each package's npm page now resolves instead of 404ing. This corrects the
  remaining packages missed when `@rsvelte/svelte-check` was fixed in #977: the
  `svelte-check-*` and `vite-plugin-svelte-native*` prebuilt-binary packages and
  `@rsvelte/svelte2tsx`. The `fixed` changeset groups carry the patch bump to
  every native sub-package.
- 92ea741: Fix invalid SSR codegen when a `{@const}` (or any awaited expression) sits in
  the consequent of a ternary in async mode — e.g.
  `{@const x = cond ? await fn({...}) : undefined}`. The server `await <expr>` →
  `(await $.save(<expr>))()` rewrite used a hand-rolled byte scanner that forgot
  the ternary alternate separator `:`, so `: undefined` leaked into the
  `$.save(...)` argument list and produced unparseable JS (issue #1036, bug 2).
  The operand is now bounded by its parsed `AwaitExpression` span, so everything
  outside it stays untouched.

## 0.2.5

### Patch Changes

- cbf2d18: fix(compiler): emit valid JS for `$state`/`$derived` private class fields in `.svelte.(js|ts)` modules (#907)

  `compileModule` produced **syntactically-invalid** JavaScript for several class-based rune-module shapes (reported against the `runed` library). The output parsed fine in isolation by `compileModule` itself — it only blew up once a bundler re-parsed it — so under Vite 8 + Rolldown, which compiles modules in parallel and aborts on the first bad file it reaches, the failing file set and the parser error text varied between runs. That _looked_ like a thread-safety bug, but the per-file output was actually deterministic; the compile path holds no shared mutable state (added a concurrency stress test that compiles the real `runed` corpus across 8 threads and asserts byte-identical output).

  Four deterministic codegen bugs in the line-based class-field transform, each now fixed:
  - **Trailing line comment swallowed into `$.set(...)`** — `this.#x = getter(); // note` lowered to `$.set(this.#x, getter(); // note, true)` (an unterminated call). RHS extraction now stops at the top-level `;` and re-appends the `; // comment` tail.
  - **Prefix-sibling field corruption** — wrapping a private-field read used a bare `str::replace`, so wrapping `#fps` rewrote the unrelated sibling `#fpsLimitOption` into `$.get(this.#fps)LimitOption`. Reads are now replaced only at a trailing word boundary.
  - **Multi-line constructor RHS split** — `this.#rect = {\n …\n }` was transformed line-by-line, orphaning `this.#rect = {` from its body. Constructor statements are now grouped by bracket depth before the transform runs.
  - **Server `$state` field lowered to a call** — on SSR a `$state` private field is a plain value, but `this.#x = v` was lowered to the call form `this.#x(v)` (and reads to `this.#x()`). `post_process_for_server` now distinguishes `$.derived(...)`-backed fields (callable) from `$state` fields (plain `this.#x` / `this.#x = v`).

  Also fixes a spurious `constant_assignment` error (`runed/persisted-state`): a class-method body was not registered in the scope map, so a method-local `let x` that shadowed a top-level function param `x` was misresolved to the outer (constant) binding. Class-method bodies are now registered like function bodies. Closes #907.

## 0.2.4

### Patch Changes

- 1bcbd77: fix(parse-envelope): remap typed-arrow `JsNode::Raw` offsets to UTF-16 (#908). A typed function parameter (`(r: number[]) => …`) is lowered to a `JsNode::Raw` JSON sub-tree, which the raw-transfer envelope encoder serialized verbatim — keeping its byte offsets while every other span was remapped to UTF-16. With non-ASCII source preceding the arrow, the whole arrow (params **and** body) drifted by `byteLen − utf16Len`, so `decodeParseEnvelope` spans no longer matched `parse` (JSON) and `source.slice(node.start, node.end)` broke (`magic-string` out-of-bounds). The `JsNode::Raw` writer now applies the same `convert_positions_to_utf16` remap as `write_json_node`, so the envelope is fully UTF-16-consistent.
- e4c82de: fix(parse): give `switch` discriminants and assignment-pattern defaults exact identifier spans (#916). In program/script context the statement converter routed a `switch (X)` discriminant, a `case X:` test, a `do … while (X)` test, and the default value of a destructuring `AssignmentPattern` through `convert_expression` (which subtracts the synthetic-paren offset) instead of `convert_expression_for_program`. That shifted those spans one code unit to the left — `switch (x)` spanned the `x` as `(`, and the `$bindable` callee in `let { open = $bindable(false) }` spanned as ` $bindabl` — so span-based edits (`magic-string`, svelte-shaker) corrupted the source. All four now use the program-context converter, so every identifier satisfies `source.slice(start, end) === name`.

## 0.2.3

### Patch Changes

- 093e2c7: fix(vite-plugin-svelte-native): re-export `parse`/`parseEnvelope` and ship the envelope decoder. The NAPI binding has always exported `parse` (JSON string) and `parseEnvelope` (raw-transfer Buffer), and both were declared in `index.d.ts`, but `index.cjs` never re-exported them — so at runtime `require('@rsvelte/vite-plugin-svelte-native').parse` and `.parseEnvelope` were `undefined`, leaving the fast standalone parse path (and the ~2x raw-transfer envelope path) unreachable through the public package. On top of that, the `decodeParseEnvelope` decoder the `parseEnvelope` doc references lived in `parse-envelope.js`, which was missing from `package.json#files` and so never shipped. `index.cjs` now re-exports `parse`, `parseEnvelope`, and `decodeParseEnvelope`, and `parse-envelope.js` is added to `files`. Closes #792.
- 02756b5: fix(parse): emit the full TS type tree for inline type annotations instead of a `TSUnknownKeyword` stub. `parse_svelte` (WASM) and `parse` (native) serialized an inline TS type annotation — e.g. the `: { hasIcon: boolean; label: string }` on a `$props()` destructuring — as a members-less, span-less `{ "type": "TSUnknownKeyword" }` stub, because the two hand-written `TSType` → JSON converters only handled a handful of keyword kinds and collapsed everything else (object literals, unions, references, arrays, literal types, …). They are now consolidated into one converter that emits svelte/compiler's (acorn-typescript) ESTree shape: `TSTypeLiteral` with a `members` array of `TSPropertySignature` nodes (each with its own span, `key`, and nested `typeAnnotation`), plus `TSUnionType`/`TSIntersectionType`, `TSArrayType`, `TSTypeReference` (with `typeArguments`), `TSLiteralType`, `TSParenthesizedType`, `TSTypeOperator`, `TSIndexedAccessType`, and the full set of keyword types. Any still-unmodelled exotic type degrades to a _span-bearing_ node rather than the old span-less stub, so downstream tooling can always address it. Closes #791.
- 0f46b27: fix(parse): emit AST spans as UTF-16 code-unit offsets, not UTF-8 byte offsets. `parse_svelte` (WASM), `parse` (native), and `parseEnvelope` (native raw-transfer) emitted node `start`/`end` (and `loc` `column`/`character`) as UTF-8 byte offsets, while `svelte/compiler` and the whole JS ecosystem (`magic-string`, `svelte-eslint-parser`, every `String.slice` consumer) use UTF-16 code-unit offsets. For ASCII source the two coincide, but the moment a source contains a non-ASCII character (e.g. Japanese UI strings) before a node, every later span was shifted by `byteLen − utf16Len` — producing wrong slices or a hard `magic-string` "end is out of bounds" crash. All three parse output surfaces now remap byte → UTF-16 on the way out (reusing the same converter the legacy AST path already applied), so `source.slice(node.start, node.end)` is correct regardless of preceding non-ASCII content. ASCII source keeps its fast path (the remap is skipped entirely). Closes #793.

## 0.2.2

### Patch Changes

- 2bafbc5: fix(vite-plugin-svelte-native): re-export `parse`/`parseEnvelope` and ship the envelope decoder. The NAPI binding has always exported `parse` (JSON string) and `parseEnvelope` (raw-transfer Buffer), and both were declared in `index.d.ts`, but `index.cjs` never re-exported them — so at runtime `require('@rsvelte/vite-plugin-svelte-native').parse` and `.parseEnvelope` were `undefined`, leaving the fast standalone parse path (and the ~2x raw-transfer envelope path) unreachable through the public package. On top of that, the `decodeParseEnvelope` decoder the `parseEnvelope` doc references lived in `parse-envelope.js`, which was missing from `package.json#files` and so never shipped. `index.cjs` now re-exports `parse`, `parseEnvelope`, and `decodeParseEnvelope`, and `parse-envelope.js` is added to `files`. Closes #792.

## 0.2.1

### Patch Changes

- 375c61c: fix(ssr): apply derived-read wrapping to `{@html expr}`

  On the server, `{@html expr}` skipped the dynamic-expression transforms that the
  regular `{expr}` tag runs — most importantly `wrap_derived_reads`. Since a
  `$derived` binding compiles to a getter function on the server, `{@html post.html}`
  where `post = $derived(...)` emitted `$.html(post.html)` (reading `.html` off a
  function, i.e. `undefined`) and rendered nothing. It now emits
  `$.html(post().html)`, matching the official compiler. Non-derived expressions
  and string literals are unaffected. This surfaced as empty article bodies when
  prerendering a SvelteKit site that does `{@html ...}` over a `$derived` value.

## 0.2.0

### Minor Changes

- e3f5ef5: Add `parse(source, options?)` and `parseEnvelope(source, options?)` NAPI
  exports. `parse` returns the AST as a JSON string (the cross-NAPI
  analogue of the wasm-exposed `parse_svelte`); `parseEnvelope` returns a
  raw-transfer `Buffer` in a new binary format documented in
  `src/napi_raw_parse.rs` — pair it with `decodeParseEnvelope` exported
  from `@rsvelte/vite-plugin-svelte-native/parse-envelope.js` to skip
  `JSON.parse` on the JS side.

  Every template node, attribute, directive, block, `Script`, `JsComment`,
  `SourceLocation`, and all 74 `JsNode` (estree) variants get dedicated
  binary tags. `StyleSheet`, `SvelteOptions`, and directive `metadata`
  remain inline JSON behind `TAG_JSON` for now.

  `NapiParseOptions { skipExpressionLoc?: boolean }` mirrors the existing
  `ParseOptions::skip_expression_loc`; when set, the envelope flags the
  JS decoder to skip the per-`JsNode` loc bytes.

## 0.1.4

### Patch Changes

- 6ac76c2: - `resolve_id` now preserves `?query` / `#hash` suffixes and handles bare `<script module>` HMR.
  - Rebuild against the bundled `@rsvelte/compiler` correctness work.

## 0.1.3

### Patch Changes

- d95f3bb: fix: port Svelte 5.55.9 follow-ups — `nullish-coallescence-omittance` SSR
  stringify omittance (upstream `a5df6616e`) and `Percentage` keyframe
  double-print (upstream `ca3f35bf7`). Class / style / innerHTML SSR paths
  and the head-element SSR / `css-keyframes-percent` print path are still
  tracked as follow-ups in the per-suite skip lists.

## 0.1.2

### Patch Changes

- 4db15ed: Roll up everything that has landed on `main` since `0.3.1` / `0.1.1`.
  - compiler: track upstream Svelte `5.51.4` → `5.51.5`.
  - vite-plugin-svelte-native: NAPI bindings now disable jemalloc's
    `initial-exec` TLS model so the dylib is safe to `dlopen` from Node on
    glibc hosts.
  - svelte-check / svelte2tsx: republish to pick up the routine dependency
    refresh (`serde_json` 1.0.150, `rustc-hash` 2.1.2).
  - Release workflow now publishes via npm OIDC trusted publishing (no
    `NPM_TOKEN`), Node 22, and `npm publish --provenance` for every
    platform sub-package — every tarball ships with provenance attestation.
  - Docs: README rewritten around the OXC integration goal, with per-task
    benchmark breakdown (parser / svelte2tsx / svelte-check) mirroring
    the live `/benchmark` page.

## 0.1.1

### Patch Changes

- 1153e43: test(release): patch-bump every package to validate the GitHub Actions release pipeline end-to-end

  The local one-shot `publish-all-local.sh` is the manual escape hatch; the
  intended steady-state path is `release.yml` (changesets/action + matrix
  binary builds + `pnpm publish`). This changeset bumps each of the four
  top-level packages by `patch` so we can:
  1. Watch changesets/action open the "Version Packages" PR.
  2. Merge it.
  3. Watch the release workflow build the 5-triple matrix for both
     `svelte_check` and the NAPI cdylib, stage them via
     `scripts/stage-svelte-check-binaries.mjs` /
     `scripts/stage-vps-binaries.mjs`, and publish all 14 npm packages.
  4. Confirm every `@rsvelte/*` on the registry shows the new patch version.

  `fixed` groups in `.changeset/config.json` make the 5 svelte-check
  platform packages and the 5 vps-native platform packages follow their
  main package automatically, so this changeset only names the four
  top-level packages.

  The submodule fork (`@rsvelte/vite-plugin-svelte`) lives in a separate
  repo and isn't part of this pipeline — it's published independently.
