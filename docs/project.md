# Project pipeline — build, unused-code analysis, cross-file optimization

- Date: 2026-10-01. Code claims checked at `943aa6bdc9`, with that tree's names
  (`rsv_kernel`, `Ctx`, `ProjectTask`). HEAD spells them out and moved files: `rsv_kernel` →
  `rsvelte_kernel`, `rsv_js` → `rsvelte_typescript`, `rsv_svelte` → `rsvelte_svelte`
  (`lower.rs` → `compilation/lower.rs`, `analyze.rs` →
  `semantic/analyze.rs`, `Parsed` → `computation.rs:19-22`, `compile_input` starts at
  `computation.rs:98`), `source.rs:6` → `source/positions.rs:9` (fields `start_offset`,
  `end_offset`), `db.rs` → `computation/database.rs`,
  `pipeline.rs` → `computation/pipeline.rs`, `intern.rs` → `source/interning.rs`, `Ctx` →
  `DocumentContext`, `ProjectTask` → `FinishTask`. `FinishTask` is a HEAD name; other names in
  the sketches are proposals. State: design review, nothing
  implemented.
- Every number is measured (with the command or the source) or marked UNMEASURED. External facts
  name their source and the date they were read (all 2026-10-01 unless said).
- Upstream Svelte source lines are cited from the old rsvelte submodule at `7bc0a70fe`
  (`VERSION` 5.57.0). The fixture oracle is svelte 5.57.1 (`fixtures/_registry/oracles.json`).
- Builds on [concept.md](concept.md) (the per-file design) and [architecture.md](architecture.md)
  (the kernel as it is).

## 0. Where we start

| Missing today | Why it matters |
|---|---|
| The document list is fixed before the run (`run_each(docs)`, `rsv_kernel/src/pipeline.rs`) | A build or an unused-code check starts from entry points and **discovers** files |
| No resolver | An import is text, not an edge. Type check writes projections as `f{i}.ts` (`rsv_js/src/check.rs`), so no import between them resolves |
| No plugin claims `.js`/`.ts`/`.svelte.js`/`.svelte.ts`/`.html` documents (Svelte claims `.svelte`, Vue `.vue`, svue `.svue`); the 38 `svelte.compileModule` corpus units are all missing (architecture.md §4 at `943aa6bdc9`) | Most imports end in a module nothing reads |
| The JS parser reads a subset: no `import()`, no `import.meta`, no `class`, no `export { a }`, no `export … from`, no `export *` (`rsv_js/src/parser.rs`, header and the `unsupported expression` branch) | The edges X1 needs cannot be read yet |
| The only cross-file work is `FinishTask`, and its part is `Box<dyn Any + Send>` | It has no type and no hash, so nothing can cache it or check what crosses the file boundary |
| No second per-file pass | A file cannot be compiled with facts from other files |
| Only `Parsed` and `Normalized` build a `CompileInput` (`rsv_svelte/src/lib.rs`, `compile_input`). Lowering, `resolve` and `analyze` already read only that input: the script as a JS `Ast`, the template as HIR (`rsv_svelte/src/lower.rs`, `db94f0bd13`) | X4 needs a second producer of `CompileInput` |
| The Svelte parse is all or nothing (`Parsed = Result<Component, Diagnostic>`, `rsv_svelte/src/lib.rs`); `parity.json` leaves out 16,071 units that rsvelte refused as unsupported (architecture.md §4, at `893f2cf1c7`) | A file we cannot parse hides its imports |
| `tools/fixtures` has no unit kind with more than one file (`tools/fixtures/src/types.ts`: `run(unit, src: string, variant)`) | Project units: 0 by construction |

### Words used here

| Word | Meaning |
|---|---|
| project | One app or package config: its Vite config, tsconfig and aliases. A workspace has one or more projects |
| project files | Every file that belongs to a project, from the config globs (Q-P6). Unused-file analysis and per-file tasks use this set, not only the files reached from entries. X3 claims export, type, namespace and member findings only in reached files ∩ (project files ∪ entries) (knip's `projectPaths`; knip reads other walked files only for their specifiers, `ProjectPrincipal.ts:198-228`); uses from those other files only veto findings (X3 "Across projects"), while knip ignores them, a reasoned adjust class that may only remove findings; knip's reachability through them follows only `import`, `export … from`, any `import()` whose text has no `$` or `+`, `import('…')` in block comments, `require`, `require.resolve` and `import x = require` (`follow-imports.ts:6-70`), with no glob, `new URL`, JSDoc `@import`, `/// <reference path>`, call or env-pragma edges, listed |
| summary | A small value computed from one file alone: what it imports, exports, and passes to other components |
| link | The step that puts all summaries together into facts about the project |
| slice | The part of the project facts that one file is allowed to see |
| barrier | A point where every file must finish one phase before any file starts the next |
| Known / Unknown | A fact is Known when we can prove it. Otherwise it is Unknown, and every tool treats it as "anything can happen" |
| open world | The default: facts are Unknown unless proven |
| open module | A module that may have edges we cannot read (P10) |
| leaf | A module that cannot import code. The leaf list is versioned data: file extensions (CSS, Sass, Less, Stylus, JSON, and Vite's `KNOWN_ASSET_TYPES` at the pinned version: images, media, fonts, `pdf`, `txt`, `webmanifest`, Vite 8.3.1 `dist/node/chunks/node.js:731-764`) and the queries allowed on them (`?url`, `?raw`, `?inline`). A module whose query class is `url` or `raw` is a leaf for the bundler whatever its extension (Vite returns a string; X3 still walks a code file reached that way, X1 "Type edges"); `inline` is a leaf only on CSS and asset extensions (`./util.ts?inline` and `./C.svelte?inline` load as code). A call or `asset-url` target with an extension knip does not accept and no known language imports code from is also a leaf (X1 "Call edges"). A leaf is never open, except for X3, where the "knip compiler files" list of X3 decides; an unlisted plugin makes the whole project edge-uncertain instead (P10) |
| workspace root | The folder of the root `package.json` of the run (a path outside it has no `ModulePath`; in `edges.json` and in reasons it is written as `outside:` plus its real path with the copy root replaced, sorted after module paths; in a real run there is no copy root, so the absolute path stays and such digests differ per machine) (the pnpm, npm or yarn workspace root, or the project folder when there is none); in a fixture unit, a folder inside `input/`, so paths such as `../shared` stay inside the unit |
| module path | The real path relative to the workspace root, with `/` separators, so digests and expected files are the same on every machine |
| closed component | A component whose every use we can see (X4) |
| hint | A report line that states no finding, only something the user may want to look at |
| environment | A resolution target (client, server, or SvelteKit's service worker), whether Vite builds it as an environment or as a separate build |
| edge kind | `static`, `dynamic`, `reexport`, `glob`, `type`, `worker`, `asset-url` (`new URL(…, import.meta.url)`), `css` (a JS or Svelte module imports a CSS file; `@import` inside CSS comes with the CSS language), `require` (a call of the free global `require`; Rolldown makes it a `require-call` import, measured at 1.1.5 and 1.2.0, measured again at the pinned 1.2.11: a local or `createRequire` binding gives no edge), `call` (a call shape that knip's `calls.ts` reads: `require(…)`, `require.resolve(…)`, `import.meta.resolve(…)`, `module.register` and a `register` identifier in a file that statically imports `module` or `node:module` (the flag is set in `typescript/get-imports-and-exports.ts:283`, read in `calls.ts:168-175`), `fork`, `spawn`, `spawnSync`, `execFile`, `execFileSync`, `exec`, `execSync`, `worker_threads` `new Worker`, `new URL(…, import.meta.url)`, and the results of knip's ported visitors except the `import.meta.glob` one, which gives `glob`; X3 only, knip's meaning, X1 "Call edges") |

## 1. Claims

| # | Claim |
|---|---|
| X1 | Grow the per-file pipeline into a project pipeline with one module graph |
| X2 | Build: rsvelte takes part in a whole-project build |
| X3 | Unused-code analysis like knip, plus Svelte-specific findings |
| X4 | Cross-file compile optimization: compile a component with facts about how it is used |

## 2. Adversarial review

### X1 One module graph — verdict: keep, with summaries as the only boundary

**Objections**

1. **A graph breaks "one file per thread".** If lowering A reads B's tree, the unit of parallelism,
   caching and memory is no longer the file.
2. **Arena-relative values leak.** `Atom(pub u32)` indexes a per-document interner
   (`intern.rs`); `Span { lo, hi }` has no file (`source.rs`); module ids depend on discovery
   order. Put into a summary, they compile, hash, and mean something else in another file or
   another run (debt 5).
3. **A missing summary looks like "no callers".** If a file does not parse and the join skips it,
   "prop `p` is never passed" becomes true and the program becomes wrong.
4. **One graph ignores environments.** Client and SSR use different `exports` conditions, so one
   specifier can reach two modules.
5. **One graph ignores workspaces.** In a monorepo, aliases (`$lib`, `resolve.alias`), tsconfig
   `paths` and conditions belong to one app's config. A shared `packages/ui/X.svelte` reached from
   two apps has different edges and callers per app. Workspace packages are symlinked, so their
   real path is outside the app root.
6. **Edges are not purely syntactic for TS.** The TS transform drops an `import { A }` whose
   binding is used only as a type, unless `verbatimModuleSyntax` is set. The bundler then has no
   such edge. Deciding it needs scope facts and a tsconfig flag.
7. **Re-exports need resolution over the graph.** `<Button>` imported from a barrel
   (`export { default as Button } from './Button.svelte'`, `export *`) needs re-export chains
   resolved. That is a fixpoint with cycles, and an `export *` name can reach two bindings.
8. **Two resolvers in one run.** In type check, TypeScript resolves imports itself (concept C9).
   If we also resolve type edges, the process has two resolvers for one meaning (debt 3).
9. **Output order depends on scheduling** when parallel workers assign module ids.
10. **The cache key is incomplete.** Output depends on the compile filename (component name and
    CSS hash, `analyze.rs`), on every compile option (some are JS functions), on the target, and
    on the installed `svelte` version.
11. **A barrier costs memory even when nothing needs it.** Streaming cut the live heap peak
    increment from 36.1 MB to 0.4 MB (architecture.md §5.3, build `d6f426e250`). X4 is off by default (D2).
12. **The sketch cannot be typed as written.** `Ctx<'a>` borrows `&'a Document` (`db.rs`),
    `Artifact::Output` has no `Send` bound, and `compute(&Ctx)` is the only signature.

**Decision**

- **Phases.** Link runs only when a selected task reads a project fact. Specialize runs only when
  one reads a slice. Without Specialize there is no barrier for per-file tasks: they run in
  Discover on the same `Ctx`, as today, and streaming is kept. Link keeps only its inputs.

```
Discover  (per file, parallel)   parse ─► summaries ─► resolve ─► enqueue new files
Link      (per project)          graph, export table, project facts
Specialize(per file, parallel)   SpecArtifacts (Optimize; cross-file lint rules) and the tasks that read them
Finish    (once)                 1) for X3, the traced tsgo `-p` run per program (`TypeEdges`)
                                 2) FinishTask::finish (type check; until the content mapper, the existing
                                    projection check, once per program, §5) and
                                    ReportTask (unused-code report; reads `TypeEdges` through `RunCtx`)
```

- **Projects and workspaces.** A *project* is one app or package config (its Vite config, its
  tsconfig, its aliases). Every package, with or without Vite (in a workspace `vite`
  usually resolves from a package through the root's `node_modules`), is edge-uncertain
  (reason `other-bundler`) when it has a bundler or
  compiler config file on a versioned list (`rollup.config.*`, `webpack.config.*`,
  `rspack.config.*`, `tsup.config.*`, `astro.config.*`, `.babelrc`, `babel.config.*`, `.swcrc`, …; not
  `tsconfig.json`) or directly depends on any package of a versioned list (not transitively: adapters pull in `esbuild` and `rollup`) (rollup, webpack, rspack,
  esbuild, tsup, parcel, astro, `rollup-plugin-svelte`, `svelte-loader`, `unplugin-*`, …), with a unit
  each for rollup with `@rollup/plugin-inject` and for rspack with `unplugin-auto-import`,
  both also with a root `vite` dependency, and one with a vitest-only `vite.config`. A package
  with no Vite (no config, and `vite` not resolvable from it) has no snapshot; unless the rule
  above applies, its resolver uses Vite's default client and server environments (both
  condition sets, `node.js:661-681`) and both `NODE_ENV` values, with no plugins, and its
  tsconfig, `paths` included; it has no bundler edges to compare; its `.svelte` files have an
  Unknown compile mode; a `svelte.config` file makes it edge-uncertain (it cannot be read
  statically, §6, and its `preprocess` could add edges); Node's `module-sync` condition, for
  packages Node runs directly, is a gap knip shares, listed; otherwise it is not
  edge-uncertain for lack of a snapshot (a unit: a
  plain TS package in a pnpm workspace whose root does not depend on `vite`; with a root `vite`, the package gets a snapshot, and its `paths`-only imports stop claims through `paths-fallback-only`, counted). This is the one exception to "without
  `resolveConfig` the project is edge-uncertain" (§6). Our resolver takes, from each `resolveConfig` snapshot, the
  top-level `resolve.alias` and `preserveSymlinks` (Vite forces both into each environment,
  `node.js:37171-37172`) and Vite's top-level `tsconfig` option, and per environment
  `tsconfigPaths` (the top-level value is only its default, `node.js:28918-28919,28940,37131,
  37353`), `conditions`, `mainFields`, `extensions` and `dedupe` (`index.d.ts:2686-2697`,
  `node.js:28947`; vps adds `svelte` to `mainFields` and `conditions`,
  `src/plugins/configure.js:72-80`, and to `dedupe`, `src/utils/options.js:375-379`); user
  `assetsInclude`, a path filter (`createFilter`, `node.js:37412`; relative patterns resolve
  against `process.cwd()`, picomatch with `dot: true`, tested on Vite's id after `cleanUrl`,
  `node.js:1908-1918`), adds leaves (`node.js:32199,32223,37521`), with a unit where root is
  not the working directory; the filter runs per path in the snapshot process, and a path found
  after it ran is open. In builds, Rolldown
  also resolves as a fallback: tsconfig `paths` (`tsconfig: environment.config.tsconfig ??
  rolldownOptions.tsconfig`, default on, `node.js:34326`, following solution-style
  `references`, and, under auto-discovery (`tsconfig: true`, the default), with the nearest tsconfig of each
  importer (a nested one without `paths` blocks it), only for importers that tsconfig
  includes by Rolldown's rule (an inherited `include` is applied from the extending config's
  folder, unlike TypeScript, so Kit 2's `.svelte-kit/tsconfig.json` layout gets no fallback;
  units for that layout and for a base config in another folder): a `.js` importer only with `allowJs`, a `.svelte` importer only when `include` lists
  it; with a string tsconfig path, for every importer; with either, a referenced config whose
  `include` covers the importer wins over the root, even when the root also includes it, and
  with a string path to a references-only root that no referenced config covers, the root's
  own `paths` apply; units for `.js` and `.svelte` importers, for a string path, and for these
  three `references` shapes; Rolldown follows one level only (a reference to a references-only
  config gives no fallback) and, when two references cover the importer, the first listed
  wins, a unit each; dev has no such fallback, so a specifier only it resolves is
  `Unresolved` in the dev snapshots and, by the union, an open module for X3: a stop class
  `paths-fallback-only`, counted) and `build.rolldownOptions.resolve` (`alias`, `extensions`, with Rolldown's own defaults for
  every key the user did not set: extensions `.tsx, .ts, .jsx, .js, .json`, and its
  `conditionNames`, `mainFields`, `aliasFields`, `symlinks`, `define-config-*.d.mts:3636-3700`;
  Rolldown's defaults depend on `platform`, which Vite sets per environment, `browser` for the
  client and webworker SSR and `node` for other server consumers (`node.js:34245-34248`;
  `define-config-*.d.mts:3636-3670`), so the fallback is modeled per environment with that
  value, with a `project.graph` unit where a `paths` target folder has `browser` and `main`
  fields and is imported from SSR; any other `rolldownOptions.resolve` key, and a
  `platform` in the resolved per-environment `build.rolldownOptions` that differs from Vite's
  default (set by `rollupOptions` or `environments.*.build.rolldownOptions`, merged at
  `node.js:34244-34248`), gives `Unresolved`); worker bundles use
  `worker.rolldownOptions` and do not get Vite's top-level `tsconfig`
  (`node.js:25958-25964`), and are modeled with their own options; dev does neither (except
  under `experimental.bundledDev`, where our model gives `Unresolved`, which fails closed),
  and our build snapshots model both (Kit 2's service-worker build is a `vite.build` too, so its
  model includes the tsconfig fallback). The Kit build and service-worker model is Kit 2's
  (versioned data per Kit major). Kit 3 builds the service worker as a `serviceWorker`
  environment of the user's builder inside `buildApp` and replaces aliases only there
  (`exports/vite/index.js:1098-1124,1596-1713,2000-2002`); until that is measured, a Kit 3
  project stops X3 claims (reason `kit-major`) and X4 refuses it, while `project.graph` still
  compares Kit 3 units in both directions (so the `#lib` unit and the measurement that would
  lift `kit-major` can fail on a missing edge). A Kit major with no pinned data is treated the
  same way, except knip units (Kit 1.x stubs, or no Kit installed as in `plugins/sveltekit2` and
  `plugins/sveltekit-monorepo`), which use the pinned Kit 2 data, as the
  plugin-name read does. The `development`/`production` condition follows
  `isProduction`, which is `process.env.NODE_ENV === 'production'` (`node.js:29255,37401`), and
  `NODE_ENV` comes from the process environment first, then `.env` files (which can set only
  `development`; other values are dropped with a warning), then the command
  (`node.js:37256-37262,37396-37399`); because a `.env` file or the shell can fix the value, each snapshot process clears `VP_RUN_NODE_CLIENT_PATH` (a task runner Vite asks for
  `NODE_ENV` before `.env`, `node.js:103-113,161-165`) and sets `NODE_ENV` explicitly: every
  (command, mode) runs once with `production` and once with `development`, and for each (command, mode)
  whose loaded `.env*` files set `NODE_ENV` a third snapshot runs with it unset, because Vite
  sets the command default before it loads the config and applies `.env` after
  (`node.js:37262,37396-37399`), so the config can see `production` while `isProduction` is
  false; `unset` is its own value in the `snapshot` field, the report names the covered
  `NODE_ENV` values, and a unit has `.env` with `NODE_ENV=development` and a config that picks
  an alias by `process.env.NODE_ENV`. X3 resolves once per
  `(project, environment, snapshot)` and takes the union of the edge sets (not the union of
  the options: conditions pick the first key that matches, so merged options give one target);
  X2 and X4 use only the running build's snapshot. `project.graph` units: a custom `source`
  condition on a workspace package; custom `extensions` with a `util.js`/`util.ts` pair;
  `tsconfigPaths: true` with a `paths` key that has the name of an installed package, at the
  top level and for `ssr` only (until that unit passes, `tsconfigPaths: true` in any
  environment makes the project edge-uncertain); a paths-only value
  import with and without `rolldownOptions.tsconfig: false`, and one whose `paths` are only in a
  referenced `tsconfig.app.json`; an `environments.ssr.resolve.dedupe` override; a
  `development` export condition with a present `dist/`; and two non-output source targets
  under `development` and `production`, in both key orders, run with and without `NODE_ENV` set
  in the environment, neither reported (`project.unused-own` too). A workspace has one or more projects. A module is keyed by
  `(real path, query class, project, environment)`, and Link runs once per project. The query
  class is code, raw, inline, url, worker or style (vps's style id); `worker`/`sharedworker` wins
  over `url` and `inline` (`?worker&inline` bundles the worker's whole graph); an unknown query
  is open
  (`./C.svelte?raw` is text, not C's code). `ModulePath` is the
  real path from the platform's native realpath (on macOS APFS it returns the stored case),
  relative to the workspace root, with `/` separators. A real path outside the workspace root (a
  `link:../shared` dependency, yarn `portal:`, `npm link`) is `Outside` (not `External`, which
  means a `node_modules` package and is a leaf). Such a package may
  import an app file through a Vite or Kit alias (`$lib/x`), which Discover cannot see, so any
  dependency whose real path is outside the workspace root and outside every `node_modules`,
  whatever its spec, is a stop reason for X3 claims. So is any other target whose real path is
  outside the workspace root and not inside a `node_modules` package, however it is reached (a
  user alias `'@shared': '../shared'`): it is an open module, not a leaf (an own unit). The case-variant unit has expected edges per
  platform and runs on Linux only (the two files cannot both exist on a case-insensitive disk).
- **Discover's input** is the project files plus the entries of each project. Files not reached
  from an entry are still discovered, so per-file tasks run on them and X3 can call them unused.
  A document is parsed once per path while its arena is alive and import-resolved once per
  `(project, environment, snapshot)`; when a later project reaches a shared file after the arena is freed,
  it is parsed again, and the re-parse is counted; when the re-parse reads text with a
  different content digest, the module is open. Summaries that depend on compile options
  (`Analyzed`, `ComponentSummary`: `runes`, `customElement`, `compatibility.componentApi` come from
  vps's resolved `api.options` in the config snapshot, because Kit 2.62+ takes them from a
  `sveltekit({...})` argument too, kit `exports/vite/index.js:145,159-176,190-204`; a
  function-valued option is evaluated per file in the snapshot process with the absolute id
  Vite would pass, and when a path has several ids or the `serve` and `build` snapshots
  disagree, the file's mode is Unknown; with a `dynamicCompileOptions` hook, which also sees
  `code` and `environment`, every option-dependent fact is Unknown in X1; a file found after the snapshot ran has no evaluated value, so its mode is Unknown; per-file lint on a file whose mode is Unknown is reported under that reason, not run) are computed per `(path, project)`, and so are per-file task outputs that read them
  (lint diagnostics run once per project whose options differ), and each project joins only
  the traces of its own tsconfig programs: the root tsconfig itself unless it is references-only (`files: []` and no `include`, after `extends`; a root with neither key has TypeScript's default `**/*`, and Kit 2's root inherits `include`), and the configs its `references` name directly (nested references are not traced, which fails closed), each importer's targets the union over every program of the project that
  reads it (the `TypeEdges` rule, §5) (a references-only root, `files: []` with no `include`, has an empty program of its own). The root config is `tsconfig.json`,
  else `jsconfig.json` (Kit JS projects); a project with neither gets one program with tsgo's
  defaults, `allowJs` on and the project files as roots (knip builds no TypeScript program at all, so this choice is ours); `project.types` requires a non-zero
  count of importers tsgo reads in every unit that declares such importers (`.svelte`-only
  units declare none until the content mapper). Until S3,
  entries and project files come only from a unit's `meta.json` or from CLI arguments; there is no
  run on a real project before S3. Per-file fixture runs keep `run_each(docs)`.
- **Where Discover stops.** At a package boundary in `node_modules`, tested on the real path (a workspace package linked into `node_modules`, whose real path is inside the workspace root, is not a boundary; one outside the root follows the rule above), the edge becomes `External`,
  except for packages the build bundles (X2 "Reach per task"); their `.svelte` files are parsed for
  the build only.
- **Summaries of one file:**
  - `EdgeSyntax` (from the parse only): for each import or re-export, the specifier, the
    `ProjectSpan`, the kind (edge kind, §0 words), the imported names (default, namespace, named),
    `type` markers per specifier, and import attributes. Sources: `<script>` blocks and every
    template expression (`import()`, `new URL(…, import.meta.url)`, and `require()` candidates).
    Tag names are uses, not edges. Comments are a source too, as knip's
    `src/typescript/comments.ts` (lines 4-9, 113-166) reads them, from the parser's comment
    tokens with a JSDoc type parser (so no byte scan, P1): `@import` tags and `import('…')` in
    any block comment (`/* */` as well as `/** */`, `comments.ts:123`) are `type` edges that
    import the named member, or nothing named when there is no member; `/// <reference
    path|types>` are `type` edges, and an unresolved `reference path` is a hint, as knip marks it
    optional (`comments.ts:162`); env pragmas before the first statement (`comments.ts:148`)
    with a path (`// @vitest-environment ./env.ts`) are entry call edges, and with a package name
    (`jsdom`) are dependency uses (S4), as is `@jsxImportSource` (`comments.ts:143-146`). The
    conditions (which tags, the backward search for `{`, `comments.ts:76-92,126`) are knip's;
    where this text and that code differ, the code is the spec. knip drops comments in `.svelte`
    files, so comment edges there are our extension, gated by own units. Link makes a `require` candidate a bundler `require` edge only
    when `UseSummary` says the callee is the free global (Rolldown's rule); its argument counts as
    literal when it is one string literal or a template literal with no expressions (as Rolldown
    and knip do), and any other argument to a free `require` is an unknown root (X1 "Call edges"). Imported names of
    a `require` and CommonJS exports (`module.exports`, `exports.x`) follow knip's
    `imports.ts:73-137` and `exports.ts:395-480` at knip `99cac78` (an identifier imports `default`,
    destructuring imports names, a rest element imports the namespace, `module.exports =
    require(…)` is a re-export).
  - `ExportSummary` (from the parse only): local exports (with enum members and namespace
    members), re-exports, `export *`, JSDoc tags (`@public`, `@internal`, `@alias`, …), and for
    each export the other exports its declaration references (knip's `_addRefInExport` and its
    pending call refs, `walk.ts:203-352`, `get-imports-and-exports.ts:472`; whether such a
    reference keeps an export alive is `analyze.ts:70-100,191,269`, which for a type,
    interface or enum container depends on `ignoreExportsUsedInFile`, `analyze.ts:83-88`).
  - `UseSummary` (from `Resolved`, because a local name can hide an import): every use fact of
    knip's export analysis, ported as is at the pinned version like the call edges, with the
    code as the spec: the import and use records of `typescript/visitors/imports.ts`,
    `members.ts`, `walk.ts`, `calls.ts`, `exports.ts` and `comments.ts`, and the way
    `graph/analyze.ts`, `utils.ts` and `is-referenced.ts` read them. Examples, not the list:
    member uses (`ns.x`, `Enum.A`), with in-file member uses counted whatever
    `ignoreExportsUsedInFile` says (`walk.ts:941-948`); a whole-name reference to an enum or
    namespace (a type reference or `typeof`, `walk.ts:588-610`), which hides its member
    findings when `nsTypes` is off (`analyze.ts:117-118`, `utils.ts:130-136`; the included
    kinds, knip's `includedIssueTypes`, not the claim state `off`, are an input of that rule); *opaque* uses, where every export of
    the target counts as used (an `import()` not bound to an identifier or pattern,
    `imports.ts:51-68,319-331`; `@import * as T`; `NS[k]`; `for…in`/`for…of` over a namespace;
    `Object.keys(NS)`; a namespace rest pattern; an alias of a namespace never accessed,
    `walk.ts:950-975`, which `is-referenced.ts:70` cancels when only namespace refs exist); *loader* uses (`f(() => import('./x'))` uses `default` when the target
    has one and every export otherwise, the latter cancelled like an opaque use by `hasOnlyNsRefs`, `calls.ts:256-271`, `is-referenced.ts:68-71`, applied in
    Link against the target's `ExportSummary`); enumerated names (`Object.keys`/`values`/
    `entries`/`getOwnPropertyNames`, `calls.ts:220-247`, and computed or numeric element
    access, `members.ts:8-105`); custom-element registration (`calls.ts:8-59,112-117`,
    `walk.ts:986-996`); names in `declare module './x' { … }` as uses of `x` (`AUGMENT`,
    `ast-nodes.ts:182-210`); a bare `a;` statement on a destructured export
    (`walk.ts:976-981`); uses of an export inside its own file; and which value imports are
    never used as a value. Where we resolve a name better than knip, the difference is one
    reasoned adjust class: knip's partial shadow model (`walk.ts:479-485`; `members.ts:61-85` and
    `calls.ts:231-243` check none), with units, and with units that our scopes keep TypeScript's
    declaration spaces apart (a local `type NS` does not shadow a value import `NS`) and merge
    namespaces and enums as TypeScript does. P8 leaves no other way to carry these across files. Two knip inputs are not
    per-file facts, so the port records the facts without them and Link applies them: whether
    the file skips export analysis (knip's export handlers return early, `exports.ts:42,275,345,376`;
    a skip-exports entry that re-exports an imported namespace makes knip report its targets'
    exports, which our entry rule makes Unknown, a reasoned adjust class with an own unit for a
    re-export inside a plugin entry), and whether an import resolves inside the project
    (`localImportMap`, `get-imports-and-exports.ts:294-298`, `walk.ts:361,370,807-821`; one
    document can resolve differently in two projects, so facts are recorded for every import
    binding and Link applies knip's internal-target test; the same holds for `ExportSummary`,
    whose binding re-exports, `export {X}`, `export const Y = X`, `export default X` and
    `export =`, depend on it, `exports.ts:128-143,240-255,311-322,348-356`). knip uses no type checker
    (`ProjectPrincipal.ts:1`), so no use fact needs one. It also says, for each
    `require` candidate, whether the callee is the free global.
  - **Call edges** (`call`, X3 only). The rule is knip's, at the pinned version, ported as is,
    like the source mapping: the call shapes and flags of `src/typescript/visitors/calls.ts`
    (an object named `require`, shadowed or not; the argument positions and literal tests of
    each shape as that file has them, for example exactly one string literal for `require(x)`,
    and `path.join`/`path.resolve` with `__dirname` (or imported `join`/`resolve`, `calls.ts:65-77`)
    for `fork`, `spawn`, `spawnSync`, `execFile`, `execFileSync` and `worker_threads` `Worker`; the
    literal rule of `ast-nodes.ts:78-81`; the shape conditions themselves are that file's, for
    example `new URL` is a shape only when `arguments[1]` is `import.meta.url`, so
    `new URL(page.url)` is no call at all). **Process calls** (`fork`, `spawn`, `spawnSync`,
    `execFile`, `execFileSync`, `exec`, `execSync`) are judged in this order, not by knip's
    script parsing. 1) A `fork`, `spawn`, `spawnSync`, `execFile`, `execFileSync` or `Worker`
    that passes knip's `__dirname` test (`calls.ts:94,203-207,312-321`) makes its target an
    entry when it is a JS or TS file, and is an unknown root otherwise (this wins over the leaf
    rule below, because a shell script can run any file); its other arguments must pass the
    options allow-list below, with `silent`, `serialization` and `workerData` added, and any
    other key (`execArgv`, `env`, `eval`, `shell`, `cwd`, `execPath`, `argv`, …) makes it an
    unknown root, and so does an options argument that is not an object literal with no
    spread and no computed key (a `--import` hook in `execArgv` runs a file). The same options check applies
    to a `Worker` whose argument is a literal `new URL(…, import.meta.url)` (knip misses that
    hook too; it is listed with the shared false findings). In steps 2 and 3, *literal* means every argument is a string
    literal or an array literal of string literals, plus at most one options object whose keys
    are only `encoding`, `stdio`, `timeout`, `maxBuffer` or `windowsHide` (any `cwd`, `env` or
    `shell` goes to step 4), plus at most one function argument in the last position (the
    callback of `exec`), and *no shell metacharacter* means none of `$`, backtick, `;`, `&`,
    `|`, `<`, `>`, `(`, `*`, `~`, newline or carriage return. 2) A literal `node <file>` command
    with no flag and no shell metacharacter makes `<file>` an entry whose exports are skipped, as
    knip does (`graph/build.ts:546`), resolved with knip's resolve steps from the importer's
    folder as knip does (`graph/build.ts:527-529`); Node itself resolves from the working
    directory, so `<file>` becomes an entry only when Node's resolution from every candidate
    working directory (the folder of each `package.json` whose script starts an entry that
    reaches the importer, and the project's stated working directory) gives knip's target;
    otherwise, or when a reaching script runs `cd`, the call is an unknown root. 3) A literal call with no
    shell metacharacter adds nothing only when its (program, subcommand) pair is on a versioned
    list of pairs that never run project files (`git rev-parse`, `git describe`, …; no `-c` or
    `--config-env` option, and no subcommand that runs hooks such as `git commit`). A negative unit per list
    entry checks the list, for example `git -c alias.x='!node x.js' x` is red if it adds
    nothing. `fork` never adds nothing. Repository config can still run code from a listed pair
    (`core.fsmonitor` under `git status`); knip has the same blind spot, and it is listed with
    the shared false findings. 4) Every other
    process call (`tsx scripts/x`, `fork('scripts/w')`, `node --import tsx scripts/x`,
    `cd scripts && node gen`, `make icons`, a non-literal argument) is an *unknown root*. Each
    unknown root is counted as a hint, so the reach this costs is measured. knip's visitors are ported as code, one per visitor, with
    their enablers as versioned data; an enabler applies to the whole run, the union over all
    workspaces, as knip registers visitors once (`WorkspaceWorker.ts:287-295`,
    `build.ts:80,270-274`), with a two-workspace unit. They are: the always-on Bun shell visitor
    (`ProjectPrincipal.ts:81`, `typescript/visitors/script-visitors.ts:4-13`, every `` $`…` ``
    tag), execa, zx (with a zx shebang) and nano-spawn, whose scripts go through steps 1-4 like a
    process call (`execaNode('scripts/gen.mjs')` and `` $`node scripts/gen.mjs` `` make `gen.mjs` an entry;
    `` $`bun scripts/x.ts` `` and `execa('tsx', ['scripts/x.ts'])` are unknown roots; the options test
    of step 1 applies to their options objects, so `cwd`, `nodeOptions` or any key off the list
    makes an unknown root, and so do a Bun `.cwd(…)` or `.env(…)` chain, a `$({…})` options call,
    zx `within`, and in the file a zx `cd()` call, `process.chdir` or an assignment to `$.cwd` or
    `$.env`, a zx `$.prefix`, `$.postfix`, `$.shell` or `$.spawn` assignment, a `$.cwd(…)` or `$.env(…)` call
    on the global Bun `$`; the same calls in another module of the run, and zx files without the shebang that
    the Bun visitor still reads, are known false findings shared with knip, listed next to the hint; a `process.chdir` or a
    `process.env` write (such as `NODE_OPTIONS`) in the file of a step-2 `node <file>` call makes
    that call an unknown root too; one in an imported module or in the parent process is a
    shared false finding, since knip ignores the working directory, `graph/build.ts:527-529`);
    the Vite plugin's `import.meta.glob` visitor, which is our `glob` edge; the Node plugin's
    `fsPromisesGlob` and pino's transport call, which add globs and entry imports (every visitor
    result except the `import.meta.glob` one is a `call` edge, tagged `call` in `reach.json`); and the
    vitest, rstest, webpack, rspack, lit, catalyst, stencil, fast and knex visitors, whose match
    is an unknown root until ported. An enabler is also knip config: `config[plugin] === false`
    disables a visitor and any other truthy value (`true`, an object, an array) or an enabled
    ancestor enables it (`WorkspaceWorker.ts:153-168`), read from the stored knip config JSON for
    knip units and, in a real run, from wherever knip reads it (a config file, `package.json`
    `knip`, or `workspaces.<dir>`). A knip config written as code is user code
    (objection 2): a real run evaluates it only in the fresh config process, after the same
    trust as the Vite config. The Node plugin is on by default (`plugins/node/index.ts:9`) and
    `node: false` turns it off (`WorkspaceWorker.ts:154`); only the Bun visitor cannot be turned off. The enabler never removes our `glob` edge: it is a Vite fact. When knip's Vite plugin is
    not enabled (`vite: false`, or no `vite`, `vitest` or `vite-plus` dependency,
    `plugins/vite/index.ts:12-14`), knip reports glob targets as unused files: one reasoned
    adjust class, "knip's Vite plugin not enabled", with a unit for each cause; the condition
    is run-wide (`WorkspaceWorker.ts:287-295`), knip also reports files that only glob targets
    import and exports that only glob targets use; "not enabled" means no truthy config, no
    enabled ancestor and no enabling dependency (`WorkspaceWorker.ts:153-168`), and in a project with no Vite at all we still keep the edge (the safe direction),
    listed. One own unit per ported visitor keeps claims `on`, and one
    has no dependencies and a Bun `$` tag. Matches by name that knip misses (a renamed or
    namespace execa import, pino `target: path.join(__dirname, …)` or `targets: arr`) are
    known false findings shared with knip, listed next to the hint. Process calls that
    neither tool sees (`require('child_process')`, `tinyexec`, `cross-spawn`, and execa when no
    workspace depends on it), are known false findings shared with knip (`register('./loader.js', someVar)` is not
    one of them: its shape test fails, `calls.ts:181-191`, so it is an unknown root), listed next to that hint), and knip's resolve steps (`util/resolve.ts:44-69`,
    `resolve-module-names.ts:208-269`: an oxc-resolver with conditions `require`, `import`,
    `node`, `default` and tsconfig, a fallback one with `browser` and no tsconfig, `.js` to
    `.ts`, tsconfig `paths`, knip `paths`, `rootDirs`, workspace targets, a last `existsSync`).
    knip reads these shapes only in JS and TS files (its Svelte compiler keeps only `import`
    text, `compilers/svelte.ts`, `compilers/compilers.ts:13-14`), so call edges in `.svelte`
    files are our extension, gated by own units with a reasoned adjust; the same holds for
    `import.meta.glob` and `new URL(…, import.meta.url)` in `.svelte` files, which knip's
    `importMatcher` drops (`(?!\s*\.)`), with a unit. Where this text and that code differ, the code is the spec.
    They come from the parse only, so they are in `EdgeSyntax` and survive a `UseSummary`
    failure. Discover also reads every call target and every source-mapped target, because
    our resolver may not find them. A target flagged `IMPORT_FLAGS.ENTRY` (`calls.ts:151,164`) is a root of the X3 walk,
    as knip's `addEntryPath` (`graph/build.ts:505-507`): its own edges are walked and its exports
    are skipped, as knip skips the exports of files added as entries during the walk, unless the
    file is also an explicit entry (`graph/build.ts:381`). Other flags follow knip the same way.
    A call edge is never a bundler edge, and the edge itself opens nothing (its target may be
    open by P10, like any module); a directory target resolves
    as knip resolves it (`new URL('./src', …)` gives `src/index.*`). A call target, or an
    `asset-url` target, whose extension knip does not accept (`hasAcceptedExtension`,
    `ProjectPrincipal.ts:137-144,161-162`; `.sh`, `.wasm`) and no known language can use to
    import code is a leaf marked used and counted as a hint (P10); any other unclaimed
    extension (`.tsx`, `.jsx`, `.mdx`, `.astro`) stays open. An unresolved `asset-url` target
    is a hint, not open (knip treats it as optional, `get-imports-and-exports.ts:243-246`). A
    non-process shape match whose tested argument (the position knip's code tests, argument
    0 for `register`) fails that shape's test is an unknown root when the
    argument is not a literal or is a path-like literal (one that starts with `.` or `/`, has a
    `/`, or has a file extension); a `Worker` or `register` whose argument 0 is a literal
    `new URL(…, import.meta.url)` is not a failed test (the `new URL` is its own call edge). A literal that knip would put in `issues.unresolved` is an unknown root too: after knip's
    filters (builtins return early, `get-imports-and-exports.ts:157`; `http…`, package-like
    specifiers, gitignored files, `.json` and foreign extensions are dropped or external,
    `graph/build.ts:471-497`) and not optional. Builtins and package-like specifiers are
    `External`. An **unknown root** may make an unseen file run, so it has the scope of an open
    module: it stops every X3 claim (files, exports, types, members, props, dependencies) for
    every project in the run, because a file that runs makes its imports used. Each one is
    listed with its reason. Units: `fork(scriptPath)` with a variable, where the script imports
    an export (the expected `exports` state is `stopped`); `execSync(`node ${f}`)`;
    `spawn('node', [path.join(__dirname, 'x.js')])`; `const args = [path.join(__dirname, 'w.js')]; spawn('node', args)`;
    `spawn('sh', ['-c', 'node ./x.js'])`; `node --import ./a.js x.js`; `execSync('tsx scripts/changelog')`; `fork('scripts/w')`; `execSync('cd scripts && node gen')`; and one unit per rejected shape with no
    `call` row in `reach.json`. Targets go to `reach.json`, tagged
    `call`. Each difference from Rolldown's bundler `require` edge is by design: the two are
    different meanings (P9). A template-literal `import()` or `new URL` that X3 treats as a closed
    set (`glob`, `asset-url`) does not stop claims through this rule.
  - Edge kind is decided in Link, not per document: a document is shared by projects, and the
    flag that decides it (`verbatimModuleSyntax`) comes from the tsconfig that Vite's transform resolves for the file, with the same Rolldown include rule as the paths fallback but only from Vite's own `tsconfig` option or auto-discovery, never from `build.rolldownOptions.tsconfig` (`node.js:7606`, a unit), and with the same one-level and first-listed `references` rules (a unit each) (an inherited `include` applies from the extending config's folder, so in Kit 2's layout the flag of `.svelte-kit/tsconfig.json` does not reach `src/main.ts` and Vite drops a type-only class import; a Kit 2 unit in S2) (in a build, Rolldown's native `viteTransformPlugin`, Vite 8.3.1 `dist/node/chunks/node.js:7601-7615`; in dev, the JS path with `TsconfigCache`, `node.js:7456-7464,7534-7539`; Vite's top-level `tsconfig` option, `node.js:37482`, and the user's `oxc` options such as `typescript.onlyRemoveTypeImports`, `node.js:7575-7576`, are inputs too; Vite's default oxc `include` does not cover `.cts`, and with `oxc: false` Rolldown's own transform options decide, both listed as rare; following `extends` and solution-style `references`, measured by a probe; other differences from TypeScript's own lookup are measured by the unit; a unit has a references-only root tsconfig). Link
    applies the language's rule (`.svelte.ts` uses the TS rule, because Vite strips its types
    before vps compiles it; Svelte removes `import { type A }` entirely, unless
    `vitePreprocess` runs with `script` on: its oxc transform turns it into a side-effect import;
    TS with the flag keeps it as a side-effect import) to `EdgeSyntax` and `UseSummary`. A `project.graph` unit
    covers both languages, with and without the flag.
  - `ComponentSummary` (from `Analyzed`, `.svelte` only): the component's props, and each call
    site of a child component with its passed values, spreads and value uses (the facts X4's
    table joins).
  - **Every summary kind is present, `Failed(reason)`, or not applicable** (`ComponentSummary`
    for a `.ts` file). Of the failures, only `EdgeSyntax` opens the module. When another summary
    of a module fails (our analyzer refuses the file), the facts that come from it are Unknown:
    a component imported by a module whose `ComponentSummary` failed has Unknown props (no X3
    prop finding, no X4 row); an export imported by a module whose `UseSummary` failed is not
    reported unused, nor are that module's own exports (their in-file uses are lost), and that
    module's imports that need `UseSummary` to get a kind count as both a bundler edge and a
    reach edge, and its `require` candidates count as bundler edges (a non-literal one is an unknown root); when `ExportSummary` fails, the module's own exports and every export reachable
    through its re-exports are Unknown. A control unit has a refused caller.
- **Export table.** A `ProjectFact` resolves re-export chains per strongly connected component of
  the re-export graph, in O(edges + exported names). Two `export *` paths to the same binding are
  one name, as in ES modules. A name that reaches two different bindings is ambiguous, and a
  star-exported name that an explicit export of the same name shadows is reached by no name in
  ES modules. For X3, every star-exported binding whose name is ambiguous or shadowed counts as
  used when that name is imported (knip's `re-exports/ambiguous-barrel` expects every counter to
  be 0, with both shapes); for X4 the name is Unknown. Units: a barrel, an `export *` cycle, an
  ambiguous name, a shadowed name, two paths to one binding.
- **Type edges come from TypeScript.** Discover resolves every specifier with our resolver, but
  only to find files to read. Link decides the edge kind. For a `type` edge, the target for type facts is
  the one tsgo resolved, applied in Finish: the tsgo step runs first in Finish and
  `ReportTask` applies its targets (and their reach) in X3's join, so no Link fact, slice or X4
  input depends on tsgo. `ReportTask` calls the same export-table and walk functions as Link
  (P2) with tsgo and declaration-file targets laid over ours, so re-export hops, Unknown
  propagation and the file walk see them (a unit has a mixed import whose tsgo target
  re-exports a type from a second file). A tsgo target is first classified as any target is, on its real path (tsgo prints symlinked
  paths under `preserveSymlinks`): inside a `node_modules` package it is `External`; under an output folder it goes through the source mapping (X3); Kit's
  `${outDir}/types/**/$types.d.ts` is a leaf named by the Kit rule (its edges go only to route
  files, which are entries). The `tsgo-unread` test also applies after the source
  mapping. Any other tsgo target that has no module key in the importer's
  project (Discover never read it, or read it only for another project) has no edges resolved
  there, so it is an unknown root (reason `tsgo-unread`, counted). Units: a gitignored
  generated file reached only through a user tsconfig `paths` entry in a Kit 2 app; two Kit 2
  apps where app A reaches a file of app B only through such a `paths` entry and that file
  imports a third file (both expect `stopped` with reason `tsgo-unread`; `project.types` lists `tsgo-unread` targets separately and compares them with a hand-written list, so the one-way reach check skips them); and a Kit 2 app with a gitignored `.svelte-kit` whose `./$types`
  imports keep claims `on`. tsgo's targets come from its trace or API, joined on the real path of
  the importer (tsgo prints symlinked importer paths under `preserveSymlinks`; a file tsgo reads
  under two paths gives the union) and the specifier. Its *reach targets*, which mark a file as used, are ours ∪ tsgo's
  (`foo.js` and a hand-written `foo.d.ts` side by side: both are used). A name imported over
  an edge counts as a use on every target of that edge that exports the name, at every hop of a
  re-export chain (including `export *`) and for namespace and member uses (`ns.fn`,
  `Enum.A`): the fact target
  and every reach target (ours, tsgo's and declaration-file targets), so neither `foo.js` nor
  `foo.d.ts` reports an imported `fn`; a reach-only target's own exports that no edge uses are
  claimed like any export; own units under `project.unused` cover a value use and a
  `typeof`-only use of such a pair under a references-only root, a mixed import whose tsgo
  target differs from the bundler target (the type name is credited to tsgo's target; where
  tsgo's target also differs from knip's resolver and the files are not a declaration pair,
  such as a `types` export condition knip lacks, that is one reasoned adjust class), a
  `.ts` file importing `./foo.js` with `foo.js` and `foo.ts` side by side (`foo.ts` is a reach
  target too, because tsgo's target of a value edge from an importer tsgo reads is a reach target), and a barrel that does
  `export * from './legacy.js'` next to `legacy.d.ts`. knip reports the `.d.ts` of such a pair
  as an unused file under a references-only root, and the imported name in it under
  `isIncludeEntryExports`; both are knip false findings we avoid, a reasoned adjust class
  ("declaration pair") with the expected knip delta written per unit. An edge that Link
  decides is `type` never opens its target. A package-like type-only specifier (`geojson`, served by `@types/geojson`) is `External`
  only when no alias of the project matches it (tsconfig `paths`, knip `paths`, Vite and Kit
  aliases, workspace names). Any other type-only specifier
  with no reach target from either resolver (a tsconfig `paths` entry that neither Vite's resolve nor Rolldown's build fallback applies, imported from a `.svelte` file
  that tsgo cannot read yet), or any unresolved one without a tsgo run, is an unknown root (above), like an open module
  (X3 "Across projects"), and the report
  gives the reason. When tsgo leaves a `type` edge unresolved but our resolver (or the X3
  source mapping) resolves it, the type facts of the imported names are Unknown, never unused.
  The Kit rule names `./$types` (generated, never a project file), and, by specifier and
  before the unknown-root rule, Kit 2's `$app/types`, which neither resolver resolves (its
  tsconfig maps it to a file Kit never writes, `write_tsconfig.js:103-106`; the module is
  declared in `write_non_ambient.js`); a unit expects `on`.
  So file reachability (X3 unused files) counts type imports, as knip does, and type facts
  (X3 `types`, `nsTypes`, `rsv check`) use TypeScript's resolution, plus the bundler target for
  type names that travel over a value edge (P9). Reach-only targets and the
  source mapping (X3 "Across projects") are the only places our resolver answers where
  TypeScript's or knip's resolution is the meaning (call edges use knip's ported resolve steps); P9 lists all four. `reach.json` rows are tagged by producer (`type-reach`, `value-reach` for tsgo's target of a value edge, `declaration-file`, `call`, `source-map`, `knip-reach`), and `type-reach` rows are compared with tsgo's targets and `value-reach` rows with the trace (§6 `project.types`). X3 runs its own traced tsgo run (until the 7.1 content mapper, `rsv check` is a separate run
  over the projections, the existing tool that §5 changes only where the kernel forces it, `rsvelte_typescript/src/check.rs:303-391`; after the mapper the two may merge, with
  trace and diagnostics written to separate files, since tsgo prints both to stdout) when any export kind (`exports`, `types`, `nsExports`, `nsTypes`, members) or
  `files` is selected and the project has a `type` edge; also when `files` is selected and
  tsgo reads any importer (so value-reach targets, and with them the `files` result, do not
  depend on which export kinds are selected); and also when any edge carries a type name over a value edge (a mixed import, a value
  `export *`, a named re-export), so export claims always have it (an
  elided value import, `import { helper }` used only in `typeof helper`, is a use; an own unit
  runs with only `exports` selected and checks that tsgo starts); without that run (only
  Svelte or dependency kinds selected), claims reached through a `type` edge are Unknown, and a project with a
  `type` edge whose specifier our resolver cannot resolve is an unknown root. When tsgo is
  required and its run is incomplete, that is an unknown root for the run (reason `tsgo`):
  complete is decided from the diagnostics, not the exit code (tsgo returns 1 for a missing
  `extends`, broken JSON, an unknown option, a missing `references` path or a missing `files`
  entry, and 2 for TS18002/TS18003): tsgo ran with `--noEmit` and `-p <each config>`
  (the root unless it is references-only, and each config its `references` name directly; never `-b`, which writes a
  `.tsbuildinfo` and prints no trace on the next run), did not panic, reported no diagnostic
  located in a tsconfig file other than TS18002 or TS18003 and no config diagnostic by code (a missing `extends`, TS5083, and a missing `files` entry,
  TS6053, have no location; the option-category codes; a list kept as versioned data, while
  harmless unlocated codes such as TS2688 and a lone TS18002 or TS18003 do not count), with a missing-`extends` unit and an unlocated-TS5108 unit (`moduleResolution: "node"` in an extended config, with no `compilerOptions` key in the extending root, since with one tsgo locates TS5108 at it; a located twin too; tsgo still lists every root in `--explainFiles`, so only the code list stops it) that expect `stopped`; TypeScript 7 rejects
  `baseUrl` with TS5102 (located in the tsconfig, or with no location when it comes from an
  extended config, so TS5102 is on the code list), so such a project stops with that reason named and
  counted, and every root file
  appears in `--explainFiles`; a program whose only diagnostic is TS18002 or TS18003 counts as
  complete and empty; with `--ignoreConfig` and an empty root set tsgo is not run at all (it would print help)
  and the run is complete and empty; with a config, tsgo always runs, so the root-set
  cross-check stays; a unit for each; a project with no tsconfig runs with
  `--ignoreConfig` and only tsgo's supported extensions as roots; the root set comes from our
  port of TS file expansion, checked against `tsgo --showConfig` (a unit whose `include`
  matches `.js` with `allowJs` off) and every root file appears in `--explainFiles`; a control unit kills tsgo and
  expects `stopped`. Every edge from a declaration file by TypeScript's test (`.d.ts`, `.d.mts`, `.d.cts`, and any
  `.ts` basename with a `.d.` part, such as `c.d.module.css.ts`) is a `type` edge,
  whatever `verbatimModuleSyntax` says. The
  declaration-file rule (versioned data) adds reach-only targets, for value and type edges
  alike: TypeScript's mapping, `.d.ts` next to a reached `.js`/`.jsx`, `.d.mts` next to `.mjs`, `.d.cts` next to `.cjs`, `X.ts`/`.tsx`/`.mts`/`.cts` next to `X.js`/`.jsx`/`.mjs`/`.cjs` reached from a TS importer (`.ts`, `.tsx`, `.mts`, `.cts`, `.svelte.ts`, or `.svelte` with `lang="ts"`) or from a JS importer under `allowJs` (tsgo picks the `.ts` file; this rule needs no tsgo run, so `files` alone is enough; knip reports such a file under every root, and the files only it imports, a declaration-pair adjust with a unit; tsgo also resolves `./C.svelte`, outside ESM mode (in ESM mode only `C.d.svelte.ts` is tried, `resolver.go:1433-1435`), by trying `C.d.svelte.ts` first (TS6263, even without `allowArbitraryExtensions`), then appending extensions in TypeScript's order, `C.svelte.ts`, `.tsx`, `.d.ts`, then `C.svelte.js`, `.jsx` (tsgo 7.0.2 picks `C.svelte.js` even from a `.ts` importer with `allowJs` off), so this rule makes the first such file next to a `C.svelte` reached from any importer tsgo reads a reach target, without tsgo, listed in the same class, with a unit per extension, one with both `C.d.svelte.ts` and an unused `C.svelte.ts`, and one ESM importer), and `X.<ext>.d.ts`
  or `X.d.<ext>.ts` next to a reached `X.<ext>` for `.svelte` and leaf extensions (Vite's
  svelte-ts template has `a.module.css.d.ts` next to `a.module.css`; knip reports that file
  as unused under a references-only root, and an `X.d.<ext>.ts` under every root because its
  `IS_DTS` does not match it, `constants.ts:20`; both are declaration-pair adjusts with units).
  A reach-only target's own edges are walked as `type` edges, so a file it imports is used
  (knip reports both under a references-only root; the difference is written per unit). A `glob`
  edge's targets skip export analysis, as knip makes non-raw glob targets entries with exports
  skipped (`build.ts:555-558`). A target in the `raw` or `url` query class whose file a language plugin claims (static
  import or glob: `?raw`, `?url`, glob `query: '?raw'`, `query: {raw: ''}`, `as: 'raw'`,
  `importMetaGlob.ts:36-40`; `?inline` on a code file loads as code, §0) is a leaf for the
  bundler, but X3 walks it as a code module of the same project, with every edge kind and
  flag kept (call `ENTRY` roots, glob targets that skip export analysis, unknown roots),
  because knip strips the query (`util/modules.ts:100-125`, `resolve-module-names.ts:209`)
  and analyzes the file, and type check still reads it. Only its bundler status differs, and
  its exports are claimed per real path like any file's, with names imported over the raw or
  url edge credited (`raw` wins over `url` when both are given, as in Vite's asset `load`, `node.js:32213-32221`) (knip imports `default` there). Raw glob targets are analyzed by knip with
  exports (`importMetaGlob.ts:40`, `build.ts:551-555`) when they are in knip's `projectPaths`,
  and so by us; otherwise knip reads only their specifiers (`ProjectPrincipal.ts:163-168,220-228`). A raw or url target
  whose extension no plugin of ours claims but knip reads is open for X3 (the §0 leaf rule is for the bundler only), and one whose extension is outside knip's extension set for the run (`hasAcceptedExtension`, `ProjectPrincipal.ts:137-139`, which plugins and user `compilers` extend, so `.md` is read when `unplugin-vue-markdown` is a dependency) is a leaf for X3 too (P10 says the same; `./shader.glsl?raw` usually). A style file's status follows X3 "knip compiler files", with or without a query; a `.mdx` or other non-style compiler file follows that rule. The props of a component reached only through raw or url edges are Unknown (it has no call sites by construction). Units:
  `imports/import-meta-glob`; own units for `snippet.ts?raw` importing `util.ts` (used), for
  `Demo.svelte?raw`, and for a `?raw` target that holds an `import.meta.glob` and an
  `execSync('node scripts/gen.js')`. Non-raw glob targets (`?url` globs included, which knip makes entries with exports skipped, `importMetaGlob.ts:36-43`), visitor script entries, step-2 process-call entries (`build.ts:546`) and `ENTRY`-flagged call
  targets are entries for "An entry's Unknown exports pass Unknown through the export table"
  (X3), as knip's `reExportingEntryFile` reads the final `entryPaths`; a unit has a glob target
  that re-exports from `../lib`. Under `isIncludeEntryExports` knip's answer for such a file
  depends on its walk order (`ProjectPrincipal.ts:293`); we skip its exports always, listed. Reach-only targets are not in `edges.json`
  (Vite never loads them); `project.types` gates them. Units cover a `.ts` value import and a
  `.svelte` type import of such a pair. tsgo reads `.svelte` only through the 7.1 content mapper (concept C9); the pinned
  TypeScript is 7.0.2 (`tools/fixtures/node_modules/typescript-7`). Until the mapper exists, a
  type import inside a `.svelte` file has only its reach edge (a type name over a value edge
  from a `.svelte` importer, too, has no tsgo target and is Unknown the same way; and an importer that no tsgo
  program includes, such as Kit 3's service worker, `src/service-worker` by default, whose
  tsconfig the root `references` do not reach, has Unknown type facts the same way), so the target file is used, and
  the imported names, resolved through the export table to their bindings (through `export *`
  and named re-exports), are Unknown for X3, at every hop of the chain, not only the end binding; for
  `import type * as T`, every export reachable from the target is Unknown, and where knip
  reports a gated `nsTypes` issue there (it sees only the import text), that is a reasoned
  adjust. An own unit imports a type through an `export *` barrel and
  through a named re-export from a `.svelte` file, with no `types` issue expected. An own unit has a `types.ts` imported only by
  `import type` in `.svelte` files: it must not be reported unused. A
  SvelteKit project needs `.svelte-kit` first (`./$types`). We never run the `svelte-kit sync`
  CLI (Kit 2's rejects `-c`, a strict `parseArgs`, `cli.js:41-50`; Kit 3's has `-c`, `cli.js:36,47`, but we keep one path): the config snapshot's `build` resolution already runs
  Kit's sync and writes `.svelte-kit`, as `vite build` does (X3 "Entries", the config snapshot). `rsv check` in the
  LSP uses the existing `.svelte-kit/types`, for diagnostics only.
- **Portable values only.** Summary and slice outputs implement `Portable`. `#[derive(Portable)]`
  requires every field to be `Portable`. The kernel implements it for owned strings, `ModulePath`,
  `ProjectSpan { path, text, lo, hi }` (built only by `ctx.project_span(span)`, because only the
  `Ctx` knows which document a `Span` is in; `text` is `Source` or `Preprocessed(digest)`, so
  one pair of integers never means two texts; only the Vite integration produces preprocessed
  text, and `Document` gains that field in S7), `Count`, and ordered containers. Raw integers, `Atom`,
  `Span`, `NodeId`, `ModuleId` and hash maps are not `Portable`. A `Vec` whose order came from a
  hash map is not allowed (P12). `Portable` has a supertrait in a hidden module
  (`rsv_kernel::__private::Sealed`); the derive expands to a path to it, so the module is public.
  The CI check rejects the bare identifier `__private` anywhere outside the kernel crate and the derive crate (a path match would miss a crate alias or a Cargo `package =` rename),
  which an import alias of `Portable` cannot avoid. The test crate implements both traits through
  an alias; it lives outside the normal scan, and a separate CI step runs the check on it and
  expects a failure whose output names the test crate's file and line. Every crate hashes through one hasher alias in `rsv_kernel`; a cfg switches it to a random seed,
  and the P12 test runs under that cfg, so an order that came from a hash map shows up. Caught only by review: a `Count`
  built from a raw position, and an owned string that carries a position or an `Atom` id
  (`span.lo.to_string()`). In S0, `Portable` is a marker with the field
  check; the stable encoding and the 128-bit digest come in S5, which needs slice digests, and
  their cost is measured there.
- **One graph per environment, one slice per component.** A component's slice is the join over
  all environments of its project. The client and the SSR cache keys hold the same slice digest,
  and the X2 build guard makes both take the same decision, so hydration works. For X4 only,
  Discover walks every environment before anything compiles.
- **Determinism.** Module ids are arbitrary and never leave the process. Outputs and digests are
  sorted by the full module key (path, query class, project, environment). Joins are commutative and associative.
- **The compile filename** is the one vps passes: Vite's resolved id, which keeps the import's
  case on a case-insensitive disk and, with `preserveSymlinks`, the symlink path (so it is not
  always the real path), and the `rootDir` svelte would use (vps never sets it, so it is
  the working directory when `svelte/compiler` was loaded; the companion reads it once at
  `configResolved` and checks it there by compiling one scoped style with the official compiler
  twice (with the same `svelte/compiler` instance vps uses, resolved as vps imports it, on the file `<process.cwd()>/x.svelte`), with
  `rootDir` absent and with the value read; if the hashes differ, or the working
  directory changes later, every file uses the official compiler (fallback reason `rootDir`). It fills the value in on the
  native call only): the default `cssHash`
  hashes the filename relative to `rootDir`. `ModulePath` is only the cache key. The control is
  the root-plus-`-c` unit of §6.
- **Cache key of a per-file output:** the compile filename exactly as vps passes it and
  `rootDir` (two ids for one real path, such as `./button.svelte` and `./Button.svelte` on
  macOS, get two hashes; a `preserveSymlinks` unit on Linux checks it), `ModulePath`, content digest of the text the task reads
  (after preprocessing), the input source map, provider ID, tool build id, the full resolved compile options (a function
  option by the value it returned for that file, not its source text, because closures with
  the same text differ; `rootDir` after it takes its default, the working
  directory), target, environment, installed `svelte` version, compiler-closure digest and dependency versions,
  slice digest. With a `dynamicCompileOptions` hook, the output is not cached.
- **File-system errors.** An unreadable target that is not a leaf (EACCES, ELOOP, deleted after
  the probe, not UTF-8, over `MAXIMUM_SOURCE_LENGTH`) is an open module, with the reason.
- **One file-system epoch per run.** When Specialize will run, Discover keeps each document's
  text (`Arc<Document>`) until the run ends. Specialize and any re-parse read that text, never the
  disk. Its memory cost is part of Q-P1.
- **Moving between workers is allowed** when a barrier exists. A tree dropped on another worker
  returns its buffers to that worker's pool. Allocation metrics stay attributed by phase. Q-P1
  measures the pool effect.
- **Watch mode and the LSP** rerun Discover and Link in full until incremental Link exists (§7,
  "not planned yet"). They serve per-file tasks, cross-file lint and type check, never X3 claims
  (X3 "Entries"), and resolve configs with the `serve` command only (Kit then writes only
  the env types; `vite dev` also runs `sync.init`), never `build`. A `serve` resolution runs user code (the
  config and Kit's env entry), so the LSP does it only after workspace trust or opt-in; without
  it, the project is edge-uncertain and type check uses what exists. Type check's `.svelte-kit`:
  a one-shot `rsv check` runs only the final development sync of the config snapshot (X3 "Entries", the config snapshot), which
  is what `svelte-kit sync` does, never the production build snapshot; watch mode and the LSP use the existing
  Kit output and report one "run sync" diagnostic when the per-major files are missing
  (`${outDir}/tsconfig.json` and the `${outDir}/types` folder on Kit 2; on Kit 3 `node_modules/$app/tsconfig.json` under the
  Vite root, which an install can delete, and the `${outDir}/types` folder), with `kit.outDir`
  from a static config read, resolved against Kit's working directory on Kit 2
  (`core/config/index.js:214`) and against the Vite root on Kit 3 (`exports/vite/index.js:366`),
  with a unit where they differ; when `root` cannot be read statically, the
  `package.json` folder is checked, and the report says so. When the files are missing
  because `typescript` does not resolve from Kit's folder (`write_types/index.js:36`), the
  diagnostic names that cause instead, since running sync would not clear it.
- **Types.** Documents are `Arc<Document>`. `Artifact::Output: Send`, and `Send + Sync` for an
  output that several `Ctx` share, such as `Parsed`. `Ctx` stays `!Sync` and
  becomes `Send`. Summaries leave through `Ctx::take_summaries(&mut self)`. Under
  `Sharing::Isolated` (a bench arm), project tasks will not run; today they do (`run_document`).
- **Failure.** Each Discover step runs under its own `catch_unwind`. A panic in `EdgeSyntax`
  makes the module open; a panic in another task loses only that task's output. A panic in a
  project step marks that step failed and keeps the other outputs. Today any panic drops all of
  a document's outputs (`run_document`), and a `finish` panic clears every owner's outputs
  (`run_finish_tasks`).

### X2 Build — verdict: modify (one compile function inside vite-plugin-svelte; measured before any warm cache)

**Objections**

1. **Bundling is a non-goal** (AGENTS.md).
2. **Where build time goes is UNMEASURED.**
3. **There is no place to plug in a compiler.** SvelteKit creates vite-plugin-svelte (vps) itself
   (kit `packages/kit/src/exports/vite/index.js`, `import_peer('@sveltejs/vite-plugin-svelte')`),
   and vps has no option to swap the compiler (vps main `src/public.d.ts`). A second plugin next to
   it compiles each file twice or sees JS. The old rsvelte forked all of vps
   (`apps/npm/vite-plugin-svelte`, version 0.5.3, peer `svelte: ^5.0.0`) and calls
   `svelte.compile` directly (`src/utils/compile.js:104-105`). The fork is a second port of
   `compileSvelte` (debt 3) and already lacks upstream changes.
4. **Our output must match the installed runtime.** The output imports `svelte/internal/*`, which
   has no stable API between versions. Our oracle is svelte 5.57.1.
5. **Other plugins read `.svelte` source before compile.** Preprocessing is an `enforce: 'pre'`
   transform; `@sveltejs/enhanced-img` parses raw `.svelte`; compiled CSS goes back to Vite through
   module meta (vps `src/plugins/{compile,preprocess,load-compiled-css}.js`).
6. **Where the parallelism comes from.** vps compiles synchronously on the JS thread. Rolldown:
   "JavaScript plugins run in a single thread. Even though Rolldown's Rust core is parallel, every
   module must stop at the hook call phase" (<https://rolldown.rs/in-depth/why-plugin-hook-filter>).
   Rolldown waits on async hook promises together, so an async native compile already runs in
   parallel. A warm compile at `buildStart` adds serial time, or competes with Rolldown for cores,
   and compiles files that are never reached.
7. **The boundary may cost more than the compile** (a hypothesis for S7, P7). Old rsvelte: about 100 µs mean compile per file
   for `client, prod` over 5,836 files (`main:docs/per-call-fixed-cost.md:88`); over 1,477
   components the shipped wrapper took 2,119 ms and the JSON path 8,105 ms, both including the
   compile (`main:docs/perf-baseline.md:1048-1049`); the boundary cost alone is measured in S7. Source maps cross twice.
8. **Legacy files and function options need JS.** Whether a file is in runes mode can depend on a
   user function (`runes: ({ filename }) => …`, a parametric option), on `dynamicCompileOptions`,
   and, when `runes` is undefined, on analysis. `cssHash`, `warningFilter` and `onwarn` are JS
   functions.
9. **Not every compile goes through `transform`.** vps compiles libraries for dependency
   pre-bundling with its own `compileSvelte` (`setup-optimizer.js`), and `.svelte.js/.ts` go
   through `compileModule`.
10. **Dev and HMR output are not gated.** The per-file gate has only `client` and `server` with
    `runes: true` (`tools/fixtures/src/tasks/svelte-compile.ts`). Dev adds `$.hmr`,
    `import.meta.hot.accept`, `$.FILENAME` and location metadata (`svelte-inspector`).
11. **The CSS hash depends on the working directory.** svelte makes `filename` relative to
    `rootDir`, which defaults to `process.cwd()` (svelte `validate-options.js`, `state.js`).
12. **Builds are sequential and separate.** Vite app mode builds environments one after another
    (`buildApp`), with new plugin instances per environment. SvelteKit builds the server, then
    starts the client build inside the server's `writeBundle`.
13. **Our graph can miss a caller in a user project** (a Vite-only alias, a plugin `resolveId`).
14. **Dev.** Unbundled dev has no whole graph at the first request. Vite 8.1 (2026-06-23) adds an
    experimental bundled dev mode (<https://vite.dev/blog/announcing-vite8-1>).

**Decision**

- **Integration: replace one function, not the plugin.**
  1. Preferred: an upstream vps option `compiler` (default `svelte/compiler`), used for the
     `svelte.compile` call in `compileSvelte` (`utils/compile.js`) only. The pre-bundling call
     (`setup-optimizer.js`) and `compileModule` keep the official compiler. We propose it upstream.
  2. Until then: a companion plugin that replaces `api.compileSvelte`. This **is a second port**
     of vps's `compileSvelte` (stats, the dev `' *{}'` style injection, the `dynamicCompileOptions`
     merge, the input map, the `hmrPartialAccept` rewrite, `mapToRelative`, the CSS import, the
     `lang` check), because vps exports only `"."`. We accept it as a temporary exception to P2
     and P1 (it keeps vps's byte scans as they are), and delete it when option 1 ships. Its
     guard is a differential test on every vps version we support: vps's real `compileSvelte`
     against the companion with the official compiler injected, comparing the whole
     `CompileData` in build, dev and HMR modes. "Supported" is a pinned list of digests: the
     companion finds the vps folder whose `src/utils/compile.js` contains the live
     `api.compileSvelte.toString()` text, and swaps only when at least one such folder exists and every vps folder that can be resolved from the config file's folder,
     from the working directory and from Kit's folder, and whose `compile.js` contains that
     text, has the same digest and the same real path for `svelte/package.json` (pnpm installs
     byte-identical copies under different peer folders, and module-level code is not in
     `toString()`), and when the digest of the whole text of every vps file the port copies (`src/utils/compile.js`,
     with the module-level `scriptLangRE`; `src/utils/sourcemaps.js`; `src/plugins/compile.js`)
     equals the digest of a gated vps version
     (the signature changed between 7.0.0, `compileSvelte(svelteRequest, code, options,
     sourcemap)`, and 7.3.1, which adds `environment`); otherwise it stays inactive and says so.
     The swapped function keeps vps's original, and every fallback and re-run calls that
     original, never the port. At `configResolved` it also runs one differential probe (with `environment` set to a
     stand-in for the client environment, because none exists yet; a hook that throws on it
     leaves the companion inactive, with a unit): the live original with the
     official compiler and the port on one probe input, comparing the whole `CompileData`;
     a difference, or a probe error (a user hook that throws on the probe file), leaves it
     inactive; it also stays inactive when there is more than one `vite-plugin-svelte:config`. Positive controls: a vps 7.0.0 unit, a copy of a gated vps
     with only `scriptLangRE` changed, two two-copy units where the second copy has the same `compileSvelte` text but a different
     file digest in one and a different svelte path in the other, and a unit where the live vps loads from a folder outside the three
     (a wrapper package), built as a byte-identical gated copy that the probe tells apart by a different `svelte/compiler`; and a unit where no folder holds the live text (vps patched only inside `compileSvelte`); in all six the companion stays inactive, each with its exact `inactive(reason)`, which the build reports as the state
     `inactive(reason)` with native 0 and fallback 0, and the unit declares it. A fallback runs
     the user's `dynamicCompileOptions` twice (once in the port, once in vps's original); a hook
     with side effects sees that, and so does a parametric option (`runes`, `css`) that the native path evaluates where svelte
     would not (`<svelte:options css>` replaces the function, `compiler/index.js:38-39`; svelte
     always calls `customElement`, so that one only gets an extra call on fallback); when one of them throws, the file
     falls back.
  3. Not chosen: a fork of vps (objection 3).
  Everything else stays vps's: preprocessing, CSS virtual modules, HMR, the inspector, warnings,
  dependency pre-bundling, `compileModule`.
- **Plugin order.** `vite-plugin-svelte:config` sets `api.compileSvelte` in a `configResolved`
  with `order: 'pre'`; `vite-plugin-svelte:compile` copies it in an unordered `configResolved`.
  The companion uses `enforce: 'pre'` and an unordered `configResolved`, so it runs between them
  wherever the user lists it (Vite flattens Kit's nested plugin array first). Vite starts every
  `configResolved` handler in one `Promise.all`, so the companion replaces `compileSvelte`
  synchronously, before any `await`; the replacement itself may wait for the runtime check.
  Positive controls: the companion placed wrong (ordered `post`), and an `await` before the swap.
- **Proof that the native compiler ran.** In build mode only (Vite dev calls `buildEnd` only
  for the client and counts files that a preprocess error stopped), with the counts keyed by `this.environment`, and only that environment's key reset at
  its `buildStart` for watch mode: in `buildEnd` (skipped when it gets an error, and when the
  companion is `inactive`), native compiles plus fallbacks (each with its reason) must
  equal the expected count below, per environment; a mismatch fails the build; a
  count from the companion's own calls would read 0 + 0 = 0 when it never ran. The
  expected side is counted by the companion's own transform hook with `filter: api.filter`, so
  Rolldown applies the user's `include`/`exclude` and we do not re-implement its id filter;
  the hook then applies `api.idParser` and skips `raw` requests (`?raw`, `?url`, `?direct`), as
  vps's handler does (`src/utils/id.js:44-48`). Gate units also
  require native > 0, unless the unit declares native 0 with every fallback reason (the
  runtime-check controls: `svelte-split`, `svelte-version`, `svelte-deps`, `svelte-modified`),
  or declares `inactive(reason)` with native 0 and fallback 0 (the inactive controls: the six above and the three of S7, each with its declared reason). The build reports both numbers. Without this, a companion that never ran, or one that falls back on every file,
  passes `project.build`, because official output matches the official oracle.
- **Options allow-list.** The check is on values, and an `undefined` value counts as absent
  (Kit always passes `hydratable: undefined`). The native compiler accepts only values that have
  a gate variant: `generate` client and server, `runes: true` (after a function option is evaluated), and `runes` absent only once the
  per-file gate's `runes`-absent variants for client and server pass (S7): they compare the whole
  output (JS AST, CSS, warnings, errors) against an official run with `runes` absent, and the
  native side decides the mode once (svelte's `runes_option ?? (…)`,
  `phases/2-analyze/index.js:453-455`) and then runs the `runes: true` code path for a runes
  file, so one code path serves both (P2; svelte reads the option at `:367,403-409,502` too); until then an absent `runes` uses the official
  compiler, `css: 'external'`, the default `cssHash`, `dev: false`, `hmr: false`
  (vps passes both explicitly in production), `filename`, `rootDir` absent or a string (vps never sets it; svelte defaults it to the working directory, so when it is absent the companion passes `process.cwd()` explicitly on the native call, and the native side makes the filename relative as svelte's `state.js` does: `\` to `/` on both sides, a plain `startsWith` prefix, then one leading separator stripped; only from `state.adjust`, `2-analyze/index.js:478`, on, so parse warnings such as `element_implicitly_closed` and early-analysis warnings keep the absolute filename, `compile_diagnostic.js:63-64`, and the `rootDir` units have one of each), and
  an input `sourcemap` (vps always passes one: in Vite's dev container `getCombinedSourcemap()` returns an
  identity map when nothing came before; measured on Vite 8.3.1 with `build.sourcemap: false`, `getCombinedSourcemap()` returns a per-token map, not a one-segment-per-line identity map, and the S7 "identity map" variant uses the map Rolldown really passes); `dev: true` and `hmr: true` once their S7 variants pass. Any other value (`customElement`, `css: 'injected'`,
  `namespace`, `experimental.async`, `compatibility.componentApi`, `discloseVersion: false`,
  `preserveComments`, …), from config or from `dynamicCompileOptions`, uses the official
  compiler. Positive control: a unit with one `customElement: true` file and one plain file declares
  native 1 and fallback 1 (`option`), and is red when the allow-list is removed.
- **Errors.** When the native compiler returns an error, JS calls the official compiler, so the
  error text, `enhanceCompileError` and `toRollupError` stay vps's. The re-run counts as a
  fallback with reason `native-error`, and a gate unit fails when the official compiler then
  succeeds. `project.build` has units that must error, so native success where the official
  compiler errors is also red. An error unit is outside the count rules (the build stops at the
  first error while other transforms still run, so counts depend on scheduling); it gates only
  its erroring module: a native error, then an official error. Every other control declares its
  expected native count and fallbacks by reason.
- **Which official compiler.** Every fallback and re-run goes through vps's original
  `compileSvelte`, which uses the `svelte/compiler` of the folder it was loaded from; the runtime check and the
  `rootDir` check use the folder the digest rule above settles, and the two are told apart
  only when the probe's outputs differ (a named limit; the native output targets the settled
  svelte, which the runtime check ties to the root runtime), never the companion's own import (vps leaves
  `svelte/compiler` out of `dedupe`).
- **Runtime check.** At `configResolved`, resolve `svelte/compiler` from vps's folder (what vps
  compiles with) and `svelte/internal` from Vite's `config.root` (what the output imports; dedupe resolves from
  there, Vite 8.3.1 `node.js:29121-29125`).
  The checks run in this order, and the first that fails names the one reason; each failure
  makes every file use the official compiler, with one warning, and S7 counts each reason:
  1. `svelte-split`: the two are different packages. Two copies are one package when their
     `package.json` has the same real path (so a pnpm symlink is not a second package), or the
     same version and the same package digest (pnpm makes such copies for optional peers, as for
     vps above).
  2. `svelte-version`: svelte's version is not the pinned one.
  3. `svelte-deps`: a closure package (below) has a version other than the pinned one; the
     warning names the package and both versions.
  4. `svelte-modified`: the closure digest differs from the pinned one. The version is not
     enough, because `pnpm patch`, yarn `patch:` or patch-package change the code and keep it.

  The closure is every file reached from `src/compiler/index.js` (svelte's `./compiler`
  export, `default` condition) by static imports (relative; `#…` through the importing package's `imports` field, such as
  svelte's `#compiler/builders`; bare) and literal `require` calls, with Node's conditions
  (`import`/`node`/`default` for an import, `require`/`node`/`default` for a `require`; regen
  and the companion use one walk module, P2) (`aria-query` and
  `axobject-query` are CommonJS; a non-literal `require` or `import()` in the closure is a
  mismatch, so it fails closed), whatever its folder (so `src/utils.js`, `constants.js`,
  `escaping.js` and `src/internal/server/hydration.js` are in it; runtime files the compiler
  does not import are not, because native and official output import the same runtime), and
  through bare imports into every package it reaches, direct or transitive (`esrap`, `acorn`,
  `@sveltejs/acorn-typescript`, `zimmerframe`, `magic-string`, `@jridgewell/gen-mapping`, …).
  Each file is keyed by (package name, path inside the package) and its bytes are hashed;
  folder names and real paths are not inputs, since pnpm folder names carry the peer set and a
  store outside the root gives machine-specific paths (a package digest is the same over all
  files of one package). The pinned list is written once, when the fixture oracle is
  generated: the version of svelte and of every closure package and the closure digest go into
  the `oracles.json` entry of every task whose oracle list names svelte (found from the
  list, not written here; a task that loads svelte through another oracle, such as the lint
  task's parser, is not covered), each for the export condition its oracle loads (svelte-check loads
  `require`, the bundled `compiler/index.js`; the compile tasks load `default`, `src/`);
  `fixtures check` fails when these entries give one package two versions, and the companion
  pins from the `svelte.compile` entry, its only source. Today `regen` rewrites
  the whole entry from the live install even on a partial `--source` run
  (`tools/fixtures/src/regen.ts:36-76`), and nothing reads it back, so the tools change: the
  closure is written only by a `regen` over every unit of the task; a partial run, and every
  `compare`, first checks that the live closure equals the entry and refuses otherwise, or when the
  entry has no closure
  (positive control: one closure byte changed, then `regen --source x`, must fail). Own units whose install holds svelte
  have their lockfiles checked at import to resolve to exactly that set, so a unit never
  measures a version the per-file gates did not (units without svelte are not checked); the
  only exceptions are a unit that declares native 0 with a runtime-check reason (the controls
  below) and an inactive control that needs another `svelte/compiler` (the wrapper-package
  unit), whose lockfile must differ from the set in exactly the declared way (that
  package and that version, or that patched file), and which must give its declared
  state; supporting another version means regenerating the per-file gates
  with it. Since svelte declares caret ranges for these packages, a fresh install can drift
  after any patch release; what a user gets is measured, not taken from the corpus (which holds no
  lockfiles at the pinned svelte): a fresh resolution of the pinned svelte's caret ranges on a
  stated date, reported with that date, says whether the closure versions match the pinned
  set; until then UNMEASURED (S7). Patches (`pnpm patch`, yarn `patch:`, patch-package's
  `patches/`) are caught at run time by the digest. Two versions of one package in the closure
  are a mismatch (`svelte-deps`), since the pinned list and the file keys hold one version
  per name. Positive controls, each native 0 with its reason: a root
  `svelte/internal` from another install with another version or one changed byte
  (`svelte-split`); an older svelte (`svelte-version`);
  one closure package replaced by another version (`svelte-deps`); one byte changed in
  `src/compiler/**`, in `src/utils.js` and in `esrap` of a gated copy (`svelte-modified`). A
  negative control: the same closure under a different pnpm peer-suffix folder gives native > 0.
- **Per-file fallback.** JS evaluates the function-valued options for each file. The native
  compiler parses and analyzes, then returns either `Legacy` (or `Unsupported`) or the output. On
  `Legacy` or `Unsupported`, JS calls vps's original `compileSvelte`; the double parse is counted. vps keeps its `DEBUG=…:stats` collector per `createCompileSvelte()` (`utils/compile.js:22-50`), so in debug mode native files and fallbacks are counted in two collectors, a listed difference. A file with
  a function `cssHash` uses the official compiler. Because the choice is per file and per
  environment, a native server output can hydrate with an official client output; one
  `project.build` unit forces the fallback in the client only, hydrates with `recover: false`
  so a structural mismatch that reaches `HYDRATION_ERROR` throws (`render.js:112-142`; a
  block-branch marker mismatch recovers by rendering the block again, `blocks/if.js:36-53`, and
  text and attribute differences do not throw, so the two compares below carry the gate), and compares the DOM after hydration with an
  all-official build and the server HTML with the official server output (a DOM
  harness that `project.build` gains in S7). A second unit forces the fallback on the server
  only (a `dynamicCompileOptions` value off the allow-list for SSR, `compile.js:72-77`), so an
  official server output hydrates with a native client output, with `recover: false` and an
  interaction that renders a block again (hydration keeps the server's nodes, so the native
  client template shows only then); its positive controls inject defects into the native
  client output (a missing comment marker, `hydration.js:118-122`, must end in `hydration_failed`; element
  defects go to the DOM compare, since template functions return the server node with no tag
  check, `template.js:67-69,115-117`, and `child` creates a text node, `operations.js:117-119`;
  the comment case ends in `hydration_failed`, which
  `recover: false` turns `HYDRATION_ERROR` into, `render.js:135-137`; an error with a
  `https://svelte.dev/e/` line is rethrown as itself, `:128-131`, and each injected defect names
  its expected error; a wrong branch marker recovers, so the DOM compare after the
  interaction with the all-official build is the real gate). With X4 on, the build guard also fails when, in any environment, a closed component or one
  of its callers falls back, the companion is inactive, or the build's resolved plugins are not
  all on the named list (Kit's client build reloads the config, `vite/index.js:1347-1351`) (X4 rewrites change hydration markers). X4's Discover uses the same mode decision, or
  treats the file as open.
- **Transfer.** Source, options and output cross the boundary without JSON (P5). The boundary
  cost per call is its own measured number in S7.
- **Parallelism** is Q-P2: sync, async with our own bounded pool, or a warm cache. The pool size
  is set against Rolldown's pool; oversubscription is measured.
- **Edge targets:** `Path`, `External`, `Outside` (a real path outside the workspace root and
  not in a `node_modules` package; open, X1), `Unresolved`, `Virtual(plugin)`, `Asset` (every leaf), `Unbuilt` (a workspace package output that does not exist yet; X3 source mapping),
  `Worker`. Which of them are open is defined in P10.
- **HTML.** `index.html` is the entry of a plain Vite app. An HTML edge summary
  (`<script type="module" src>`, `<link rel="modulepreload">`) is part of S2; until it exists,
  `index.html` is open.
- **Reach per task.** The build follows `.svelte` inside `node_modules` when Vite bundles it
  (`ssr.noExternal`). Unused-dependency analysis stops at package names. Type check follows
  TypeScript.
- **X4 in a build: plugin sets.** Inside a build, the plugin and preprocessor sets come only from
  the running build's own resolved plugins, per environment; the companion never calls
  `resolveConfig` there (a `build` resolution would run Kit's sync mid-build). The build guard
  covers what other commands or modes would add.
- **X4 in a build: process-wide state.** Plugin instances are per build, so Discover, Link and
  caches live under a `globalThis[Symbol.for(…)]` key, keyed by environment, because a config that
  imports the companion by a relative path gets a new module instance when Kit reloads the config
  for the client build. A control unit imports it that way. Discover and Link run once, at the first
  `buildStart`. In SvelteKit the first build is the server, and the client shape does not exist
  yet: Kit's `config` hook sets `build.ssr = !secondary_build_started`, and the flag changes only
  in the server's `writeBundle` (kit 2.49.5 and 2.70.3). So the client graph is an approximation: the
  server's resolved config with Vite's default client conditions. The client build's guard checks
  it.
- **Build guard for X4.** In each build's `buildEnd` (before that build writes), for every closed
  component C, the build fails when any of these holds:
  - the real edges into C (`getModuleInfo(id).importers` and `dynamicImporters`, over every
    module id whose path is C, with or without a query, but not C's own style id) are not exactly
    the Link graph's edges into C for that environment, of the kinds Vite can see (§6 mapping;
    `type` and reach edges are left out);
  - C or any of its callers received code whose digest differs from its Discover snapshot, in
    this environment. Callers of a closed C are `.svelte` modules (other uses make C not closed).
    "Received" means the code and options passed to the compile function (after preprocessing,
    the dev style injection and `dynamicCompileOptions`), which holds for both integrations. Plugins that rewrite
    compiled JS later are out of scope;
  - the real graph has a module that P10 calls open, or an unbounded `import(x)`.

  The message names the module and says to build again with X4 off. The guard fails closed: we
  do not switch X4 off for one module during a build, because C may already be compiled with a
  slice that assumed the old code, and the client and server of C must make the same choice. In
  SvelteKit a failure in the client build leaves the server output on disk and a non-zero exit
  code. When every node has `csr = false`, Kit skips the client build, and the server's guard is
  the only one.
- **Open world only** in unbundled dev, HMR, vitest and Storybook. Bundled dev is Q-P9.
- **Speed claims** need the share of the Svelte step in a Vite production build, three arms
  (official plugin, old rsvelte, this rewrite), ABBA.

### X3 Unused-code analysis — verdict: keep; it is the first project task to build

**Objections**

1. **knip exists** and has many framework plugins.
2. **Entry points come from configuration.** Running `vite.config.ts` executes user code (unsafe in
   an editor on an unknown repo), and its result depends on `command`, `mode`, `.env*` files and
   every module the config imports.
3. **Unknown can make the report empty** (P10), and today most corpus files do not parse (§0).
4. **Framework-owned names look unused.** SvelteKit route modules export `load`, `prerender`,
   `actions`, HTTP verbs, …; hooks export `handle`, `reroute`, …; route components get `data`,
   `form`, `params`, `children` from generated code the graph does not see.
5. **knip has many rules for "unused export".** It reports an export used only in its own file
   (`ignoreExportsUsedInFile` is off by default), reports `default`, follows re-export chains,
   reports the exports behind a namespace that every importer uses only as a whole as
   `nsExports`/`nsTypes` and skips them when those kinds are off (`analyze.ts:261-277`,
   `has-strictly-ns-references.ts:31-43`; an opaque use counts as all used unless only
   namespace refs exist, `is-referenced.ts:70`), keeps alive what a used export's
   declaration references (with rules per kind, `analyze.ts:70-100`), does not report `@public`/`@beta` (and
   `@internal` in production mode), does not report entry exports by default, and has a
   production mode (knip.dev reference pages; 4 of the 15 Svelte-related knip test runs use
   `isProduction: true`, `test/plugins/sveltekit.test.ts`).
6. **knip cannot see `.svelte` exports or template uses.** Its compiler
   (`src/plugins/svelte/compiler.ts`) emits import text: script imports, template `import()`
   calls and style preprocessor imports, but no exports and no uses. In `fixtures/svelte` (rough text
   counts at `5479e68010` over 17,489 inputs, not structure): 1,594 files have a module script, 1,206 of them a
   line-start `export`; 2,161 lines are `import * as X from` a local path (the shadcn pattern).
7. **Spreads hide which props are passed.** Rough text counts in `fixtures/svelte` at `5479e68010`: 2,979 of
   83,899 component tags carry a spread, in 2,299 of 12,543 files with component tags (18%);
   1,058 of 6,375 `$props()` files take `...rest`; 1,981 files use `bind:` on a component.
8. **Unused dependencies need tool rules** (eslint and prettier plugins, Tailwind `@plugin`,
   vitest, Playwright, `package.json` scripts).
9. **Files reached only through CSS** (Sass partials, `url()` assets) look unreachable while there
   are no CSS edges.

**Decision**

- **Across projects.** Link runs per project, but X3 joins the uses of every project in the run,
  as knip does with one principal: a file is used when any project's graph reaches its real
  path. Export uses are not joined as per-project verdicts, because knip's rules are not
  monotone (an added importer can cancel a use: `hasOnlyNsRefs`, `is-referenced.ts:10-19,70`;
  the `nsExports`/`exports` split, `has-strictly-ns-references.ts:31-43`; the enum check,
  `graph-explorer/utils.ts:130-136`). Link resolves per project, then the per-importer use
  facts of every project are merged into one map per target real path, each importer document
  counted once, and the ported `isReferenced`, `hasStrictlyNsReferences` and
  `hasStrictlyEnumReferences` run once on that map, as knip's one `ImportMaps` per file
  (`run.ts:72`). The map (M_K) holds only knip's view, per (importer, edge, target): uses
  from importers in knip's analyzed set (files knip's walk visits and loads, empty compiled text included, `ProjectPrincipal.ts:209-214`,
  whose parse and analysis do not throw, `:216-231`, that have a workspace, `build.ts:456-461`,
  `ConfigurationChief.ts:465-476`, and that are in project files ∪ entries; a walk-added entry stays in the set when it was in knip's before-walk `projectPaths` (which the patch records), and otherwise belongs to U below, because whether knip analyzes it then depends on its walk order, `ProjectPrincipal.ts:197-227`; since
  `addEntryPath` puts them in `projectPaths`, `ProjectPrincipal.ts:141-144,194-226`; the oracle
  patch records this set at the end of `build.ts`'s `analyzeSourceFile` closure, after
  `updateImportMap` merged the file's uses, `build.ts:566-578`, since script inputs and glob
  resolution in between, `:525-558`, can still throw, and neither `analyzedFiles`, filled
  before analysis, `:456`, nor the graph keys, made for targets too,
  `util/module-graph.ts:24-34`, is that set; S3 compares our set with it)
  over an edge knip has (every file of the knip-walk model is parsed with the `oxc-parser` version the oracle install
  resolved, recorded in `meta.json` (knip declares a caret range), with knip's options,
  `sourceType: 'unambiguous'` and a file outside `DEFAULT_EXTENSIONS` (compiler output, or the raw text of a file whose extension has no compiler and is not in `FOREIGN_FILE_EXTENSIONS`, `SourceFileManager.ts:28-40`; a foreign extension with no compiler loads as `''`) parsed
  under the name `<path>.ts` (`ast-nodes.ts:19-28`), and records are
  read as knip reads them: static imports and re-exports from oxc's module record, which after a
  hard error keeps the records up to and including the failing statement and drops the rest;
  local exports come only from the AST walk, `walk.ts:502`, so a file with a hard error gets
  no export, type, namespace or member claims, reason `knip-parse`, counted, and a file our
  walk reaches only through records that knip's parse drops (after the cut, or any `import()`
  and use of that file), or only through files stopped this way, transitively, gets no claims
  of any kind, `files` included, with the same reason; the uses from such stopped files go to
  V, the named remove-only class "knip's parse cut" (units: an export after a syntax error;
  JSX in a `.js` file, which that oxc rejects, importing `./t` after the JSX, where `t` uses an
  export of a file reached another way); `import()` and every use from
  the AST walk, which is empty after a hard error, `get-imports-and-exports.ts:279,361`,
  `walk.ts:518-519`; from a non-project file, `module.dynamicImports`, `follow-imports.ts:47`;
  a unit has a template `import()` before a style error in a `.svelte` file; from a `.svelte`
  importer, an import that the ported Svelte compiler's output contains:
  script imports after its comment stripping, template `import()` by `dynamicImportMatcher`
  with backtick literals, and style preprocessor imports, `plugins/svelte/compiler.ts:6-13`,
  `compilers/svelte.ts:5-25`, `compilers.ts:31`; likewise a style importer such as a Tailwind
  `.css` contributes the ported style compiler's output, with knip's extension order, which
  tries `DEFAULT_EXTENSIONS` first, `resolve-module-names.ts:166`),
  credited only to the target knip's ported resolve steps give for it
  (`util/resolve.ts`, `resolve-module-names.ts:156-270`, as for call edges), with knip's own
  alias inputs: object-form `resolve.alias` and `test.alias` from plain object configs, inline `test.projects` and calling the raw Vite config
  function (`vitest/index.ts:104-107,160-196`), `$lib` from the SvelteKit plugin's AST read
  without `kit.alias` (`sveltekit/resolveFromAST.ts:44-49`); where knip's target is unknown
  the use goes to V. knip's target is also a reach-only target (tag `knip-reach` in
  `reach.json`), since Vite and knip try extensions in different orders (`node.js:683-691`
  against `constants.ts:16`): with `foo.js` and `foo.mjs` side by side, both are then used
  (units for `.js`/`.mjs`, and `.jsx`/`.ts`, which expects `stopped` since `.jsx` is a knip compiler-file candidate); where knip reports `files` for the file we reach
  and we report its `exports`, that is the class "resolver order" (replace, or remove when every export is used), with a
  unit for each direction; a non-project importer whose specifier Vite and knip resolve to
  different files is handled by modeling knip's walk as its own walk: knip's resolver on
  every file it visits, every visited file a `knip-reach` target, every analyzed file an M_K
  importer, so the cascade (exports used only by a project file knip reaches and we do not)
  cannot add a finding. Every other credited use (from other importers we
  analyze, or to tsgo, value-reach, declaration-file and source-map targets, or over our
  extra edge kinds) goes to the veto set V. Walk-added entries whose analysis by knip depends
  on walk order form a set U (kept out of M_K; their real records not in knip's view go to V),
  with the same re-export-walk scope as V, and files reached only through a member of U
  depend on it. A finding is kept only if it is present, with the same kind, on M_K ∪ S for
  every S ⊆ U (knip's rules are not monotone: two members of U together can
  remove a finding that neither removes alone, through `hasOnlyNsRefs` on one merged alias
  key, `is-referenced.ts:10-19`); when |U| for a target is above a small bound, the export
  claims of that target stop (counted, reported as a per-target stop reason `walk-order` in
  the claim state's reasons); a dropped finding that knip's actual order reports is the class
  "knip's walk order" (remove); a unit has the alias collision. A finding of M_K is
  then removed when its (file, name) is missing from the full analysis on M_K ∪ V or on M_K ∪ {v} for any single v in V (v = all records of one importer for one target; only
  the v whose target is the finding's file, or a file the re-export walk reaches from it, are
  tried, and the cost is measured, P7) (veto
  importers can cancel each other, `is-referenced.ts:10-19,70`), and its kind always comes
  from M_K, so V can remove findings but never add one or change its kind (units: `api.ts`
  and `api.js` side by side with a whole-namespace use of `./api.ts` and `M.b` over `./api.js`,
  where knip reports nothing in `api.ts`; an opaque importer and a whole-namespace importer
  both in V) (units: a whole-namespace use in a project file with `M.foo` from a non-project
  file, and the same from an unreached project file; knip reports nothing in either). Export
  findings are claimed only in reached files ∩ (project files ∪ entries), as knip analyzes
  only reached files (`analyze.ts:159`, `ProjectPrincipal.ts:193-222`). Per-project work stays only for resolution and the Unknown veto. An own
  `project.unused-own` unit has two projects sharing a target, one with an unbound `import()`
  and a whole-namespace use, the other with `NS.bar` (knip reports nothing). This covers every graph-explorer operation and every `importedBy` read in `analyze.ts`
  (`isEnumerated`, `explorer.ts:28-29`, `analyze.ts:116`; `refs.has`, `:117`). A second unit
  has `NS.bar` in one project and `f(NS)` in the other, run in default options and with
  `nsExports` on (knip reports `baz` under `exports`; an AND of per-project findings reports
  nothing). A prop is used when any project uses it. An export finding is reported when the
  merged rule reports it and no project has it Unknown; a prop finding when no project uses it
  and none has it Unknown, so `issues.json` needs no project field. It does
  carry a claim state per issue kind (`on`; `stopped` with the sorted reasons, each `(class, module path, shape or
  specifier, span)`, kept as a multiset with the span (one per environment and project, counted once across `(command, mode, NODE_ENV)` snapshots, and once per
  project for a module that no environment reaches; a reason with no
  source position, such as an edge-uncertain plugin, uses the config file's path and no span), so a second stop of the same class is seen; `off` when the
  options do not select the kind; knip's issue filters (`ignore`, `ignoreFiles`, `ignoreIssues`, `ignoreMembers`, the `workspace` selector, which also changes which workspaces knip analyzes, `ConfigurationChief.ts:272-310`, so it is ported as part of the workspace set, `IssueCollector.ts:138,161`, `IssueCollector.ts:105-129,136-167`, `analyze.ts:125`) are ported like `rules`; for knip units the expected `off` set is exactly the gated kinds
  missing from knip's resolved `includedIssueTypes` in the oracle run or set to `'off'` in its
  `rules` (the collector drops those too, `IssueCollector.ts:167`, except `files`, which
  `addFilesIssues` adds without that check, `:136-157`, listed), and it is compared like
  `stopped`; a kind that is both off and stopped is `off`), compared as part of the output in every
  task that writes `issues.json`. When the expected state of a kind is `stopped`, that kind's
  issues are not compared. Hand-written expected files state it; for knip units it is `on`
  unless a claim-state adjust (keyed by the kind, with `expect` = the sorted reasons, so a stop
  for another reason is red; with the same state table as issue adjusts:
  stale, redundant, fixed, ok) says otherwise. So a run that stops
  its own claims cannot pass a unit whose expected issues are empty, and a control that
  expects `stopped` names its reason.
  Source mapping (X3 only). The rule is knip's, at the pinned knip version, ported as is:
  `util/to-source-path.ts`, `util/load-tsconfig.ts` (including `walkReferences`), and the
  `sveltejs-package` plugin (its pairs, its default only when no script names
  `svelte-package`, its order among pairs, its extension search). Where this text and that
  code differ, the code is the spec; the port is tested by knip's `main()` tests that reach
  that code (`resolution/tsconfig-references-source-map`, `resolution/tsconfig-solution-references`,
  `resolution/subpath-imports-outdir`, `resolution/subpath-imports-to-dist`, named in Selection
  part 2). A target under an output folder is replaced, for X3 facts, by the mapped source
  file: the edge's export and prop uses go to it and its imports are walked; the bundler edge
  keeps the output target, with the target kind `Unbuilt` when the output does not exist yet
  (not compared with Vite, does not open the module). A call-edge target is mapped the
  same way. A module under an output folder is in the bundler graph only: X3 never walks it, and
  it adds no uses and no findings (a stale `dist/` that still imports a name the source no longer
  imports does not make that name used; an own unit checks this). `package.json` `main`/`exports`/`bin`
  entries are mapped the same way. A mapped target with no file is `Unresolved` (open). Our
  extensions, each gated by own units alone with a reasoned adjust where knip differs: `.svelte`
  files (`X.svelte` and `X.svelte.d.ts` → `X` plus each Svelte extension in the package's own
  `svelte.config` `extensions`, because svelte-package renames each of them to `.svelte`
  (kit `packages/package/src/utils.js:153-166`; where the extensions are read differs by
  `@sveltejs/package` version: 2.5.8 reads `svelte.config.js` then `.ts`, 3.0.0-next.5 resolves
  the Vite config, so a `sveltekit({extensions})` argument wins; this is versioned data, keyed
  by the installed version and, for 3.x, by whether the Vite config has `sveltekit()` (without
  it the extensions are `['.svelte']`, kit `packages/package/src/config.js:10-19`); the input
  folder comes from `config.kit.files.lib` (`cli.js:87`) where knip uses `DEFAULT_INPUT`, a
  reasoned adjust), so mdsvex's
  `src/Post.svx` is found; tried only when knip's
  extension search finds no file, so `store.svelte.d.ts` still maps to `store.svelte.ts`), and
  excluding the `svelte-package` output folder from project files (knip excludes the tsconfig
  `outDir/**`, inherited through `references` too, `load-tsconfig.ts:69-72,113`, from its
  `definitionPaths`, but keeps output files in its project files; our "no findings under an
  output folder" rule is a reasoned adjust class). Gates: `project.unused` on knip's `sveltejs-package` and
  `sveltejs-package2` fixtures (Selection part 2) and own units: a built `dist/` with expected
  export findings (its prop findings are expected in `project.svelte-unused`); a `src/lib/store.svelte.ts`
  module with no `store.svelte` component, imported for types through `dist/store.svelte.d.ts`
  (the reverse order maps to a missing `src/lib/store.svelte`, which is open and gives no claims,
  so the unit turns red); an mdsvex `.svx` component with a value import and a type import (mdsvex makes the project
  edge-uncertain and the unclaimed `src/lib/Post.svx` is open, so the unit expects `stopped`
  with both reasons; the mapping is gated by its `reach.json` row, tag `source-map`, whose
  shape is `{tag, from: output path, target: source path}`, from `dist/Post.svelte` to
  `src/lib/Post.svx`, which a broken mapping changes); a stale `dist/` file that imports a name
  the source no longer uses (the name is reported); a references-only root tsconfig; a script with `-i` and a
  `src/lib` folder; no `dist/` at all, with a consumer app that also has a type import from the
  package (Vite fails that build, so the unit
  is exempt from `project.graph`, `project.build` and the S3 Vite-reach check; it runs
  `project.unused`, `project.unused-own` and `project.types`; and its entries and aliases
  are written by hand in `meta.json`; its `project.types` run compares the `type-reach` rows
  with tsgo and the `source-map` rows with hand-written rows). The source mapping itself is
  never compared with tsgo. An
  edge-uncertain project, or one with an open module, may address any file in the run, so it
  stops X3 claims for every project in the run (a run is one workspace). Own units: two apps
  and one shared package with no `exports`, whose file is reached only through one app's alias:
  an export only that app uses gives no issue, and an export no app uses gives one; the same
  with an auto-import plugin in one app gives no claims at all.
- **Our value is the Svelte part:** unused props, snippets, bindable never bound, `<script module>`
  exports, cross-file CSS classes. knip does not report them (objection 6). Callback props are
  props, so "events never handled" is "prop never passed". Unused CSS inside one file is already
  upstream's `css_unused_selector`.
- **knip's rules.** Each rule of objection 5 is either matched or an adjustment with a written
  reason; the list lives next to the importer. A unit is keyed by a digest of the knip test's
  options other than the mode, and the fixture's config; the mode (default or production) is a
  task variant. A reached barrel makes every file it re-exports reached, as in knip; an unused
  re-export is an unused export of the barrel.
- **Claims only in project files.** Export, type, namespace and member findings are claimed
  only in reached files ∩ (project files ∪ entries) (§0 "project files"), and so are Svelte
  findings (props, snippets, bindable, `<script module>` exports): a component outside project
  files, or one no entry reaches (it gets the unused-file finding only), gets none. Units: a gitignored generated module
  with one unused export (no finding); a Kit 2 app that expects no finding under
  `.svelte-kit/generated`; a knip `project` glob narrower than the walk; a raw glob whose
  target is outside the project globs.
- **Adjust classes have a direction.** Each reasoned adjust class states whether it adds,
  removes or replaces knip findings, in one table next to the importer, and the adjust tool
  rejects an entry that goes the other way. Classes that add or replace include "declaration
  pair" (exports of a reach-only `.d.ts` where knip reports the file), "knip's Vite plugin not
  enabled" (exports in raw glob targets and in files only glob targets import, where knip
  reports `files`; its removal part is a separate class), "knip's partial shadow model" (we
  see fewer uses) and "reachability through non-project files", split into an add part
  (our larger reach) and a replace part (knip follows any `import('…')` in a block comment of
  a non-project file, `follow-imports.ts:31,60-67`, so it reports `exports` where we report
  `files`), kept apart from "uses from non-project files" (remove). "knip's import-only view
  of `.svelte`" is split by cause the same way (template uses; bound or loader `import()`; regex edges, which knip's comment stripper can
  also break by ignoring strings, `compilers.ts:11,31`). Each part declares the set of
  directions it allows, with one unit per allowed direction, and the tool rejects any other.
  Our own extra languages that knip never reads (`.svue`) are one more class (add, remove
  or replace: an unused `.svue` file, or exports reached only through it, are ours alone).
  A `.svelte` importer contributes to M_K exactly the records of the ported Svelte
  compiler's output (import text only, so a namespace import has no refs and a bound
  `import()` is opaque, `compilers.ts:13-14,25-37`); our real uses inside it (template uses,
  member uses, bound or loader `import()`) go to V. So "knip's import-only view of `.svelte`"
  never adds a finding or changes a kind; its causes are
  template uses, bound or loader `import()` (remove); and, with {remove, replace}, `export …
  from` in `<script module>` that `importMatcher` drops, regex edges from import-like text in
  strings, template literals and trailing `//` comments (`compilers.ts:12`), real imports the
  block-comment stripper eats (`compilers.ts:11,31`), backtick `import()` in a script,
  `import.meta.glob`, `new URL`, call and comment edges in `.svelte`; each with a unit (junk import text that breaks
  the parse only removes: whatever it would replace is stopped by `knip-parse`). So the class says "only removes"
  for its first causes and "removes or replaces" for the rest. "knip
  leaves it unresolved, we resolve it" (the use goes to V) is a named class (remove or
  replace).
- **What the oracle can see.** knip keeps only the import text of a `.svelte` file, script
  included (`compilers/compilers.ts:28-40`), so every use inside it is invisible to knip: one
  reasoned adjust class, "knip's import-only view of `.svelte`", with units for a template use
  (`<D.Root>` with `import * as D`, the shadcn pattern; knip reports `exports` and `types`), a
  script member use (`D.cn()`), and a whole-namespace use (`<X ns={D} />`), each expected as a removal of knip's finding
  (the kind always comes from M_K, so it never moves to `nsExports`). Export issues inside `.svelte` files and everything about props
  and snippets go only to `project.svelte-unused`. The `default` export of a `.svelte` file is
  never reported; the unused-file finding covers it.
- **"Prop never passed" in X3.** Uses the closed-component rule of X4, joined over every project
  in the run ("Across projects": open modules anywhere in the run stop it), and follows re-export
  chains and namespace member tags (`<M.Root>`) through the export table. A prop is passed by an
  attribute, a shorthand, `bind:`, child content (`children`), or a nested `{#snippet name}`. A
  spread of an object literal with known keys passes those keys; any other spread makes that
  component's props Unknown. Entry and route components stay Unknown. "Bindable never bound" uses
  the same spread rule. Unknown counts are reported as hints, so the reach of the finding is
  measured.
- **Unknown per fact kind.** File reachability, export use, prop passing and dependency use are
  separate facts. A literal `import.meta.glob` is a closed set of edges. A template-literal `import()` is a closed
  set only when at least one entry reaches its importer and every entry that reaches it is an
  input of a Vite environment, the
  importer passes that environment's `build.dynamicImportVarsOptions` filter (default
  `exclude: [/node_modules/]`, Vite 8.3.1 `dist/node/chunks/node.js:34214`), Vite accepts its
  pattern (builds: Rolldown's `viteDynamicImportVarsPlugin`, `node.js:32613-32623`; dev:
  `dynamicImportToGlob`, `node.js:32527-32535,32645`), and it has no `/* @vite-ignore */`
  (`node.js:32659`). A template `new URL(…, import.meta.url)` is closed only under the same
  entry condition, in the client environment (`node.js:27085`), with a pattern
  `buildGlobPattern` accepts (`node.js:27158`). A probe unit per form gates the build path, and a dev-server probe per form gates the dev
  path (dev resolves an alias template first and skips it silently when that fails,
  `node.js:32568-32574,32662-32664`); until a form has a dev probe, it is unbounded.
  Any other template `import()` or `new URL` is unbounded (own units: a Node-run
  `scripts/migrate.js` with `import(`../migrations/${f}.js`)`, and the same file reached by
  no entry). An unbounded `import(x)` is an unknown root, like an unbounded free
  `require(x)`: SSR code, Kit server files, the dev server and Node scripts may load any file
  at run time (own units: `scripts/run.js` that imports every file in a folder, and
  `import(`${base}/plugins/${n}.js`)`). knip ignores non-literal `import()`
  (`imports.ts:319-331`), so where it reports such a target, the difference is a reasoned
  adjust. For
  dependencies in SSR code it makes "unused dependency" Unknown.
- **Open modules and edge-uncertain projects** follow P10; the report lists each with the reason.
- **Non-JS files** (CSS, Sass, images, and HTML, which knip puts in `projectPaths` only when a compiler for the extension is enabled, `ConfigurationChief.ts:42-47`, `constants.ts:16,198-203`; Tailwind registers `.css`, `plugins/tailwind/index.ts:12-29`, for any Tailwind dependency, and its compiler turns `@plugin` and `@config` into imports, `plugins/tailwind/compiler.ts:3-20`; see "knip compiler files" below) are never reported unused until the CSS and Sass languages
  give CSS edges.
- **knip compiler files.** knip reads more extensions than we do: its own (`.tsx`, `.jsx`,
  …, `constants.ts:16`) and every compiler of the run, which is knip's `getIncludedCompilers`
  output per workspace: built-ins with their dependency lists (`.mdx` with `@mdx-js/*` or
  `remark-mdx`, `.tsrx`, `.sass`, `.scss`, `.less`, `.styl`, `.stylus`, `compilers/index.ts:29-61`),
  plugin `registerCompilers` (Tailwind `.css`, Astro `.astro`, `unplugin-vue-markdown` `.md`,
  …), and knip config `compilers` keys (a function or `true`, `compilers/index.ts:12-27`), kept
  as versioned data and applying run-wide (`ProjectPrincipal.ts:97-101`). A file in the
  workspace with such an extension whose language we do not read is an open-module
  candidate whether we reach it or not (reason `knip-compiler`, counted, X3 only), whatever
  Q-P12 decides, because knip can make it an entry we do not model (Storybook
  `stories: ['../src/**/*.mdx']`, `plugins/storybook/index.ts:19-23,80-84`). Built-in style compilers
  stay leaves, except that their `url()` specifiers are emitted without an added extension
  (`compilers/scss.ts:12-30,47-56`), and scoped, `~` and `pkg:` specifiers are emitted as bare
  imports (`scss.ts:58-66`, `less.ts:29-35`, `stylus.ts:26-32`); knip resolves both with
  `DEFAULT_EXTENSIONS` first. We have no Sass, Less or Stylus parser, so these specifiers come
  from a port of knip's own style compilers (they model the oracle's text, as the ported
  Svelte compiler does, and decide none of our structure, so P1 does not apply), and a file of a
  built-in style compiler (`.scss`, `.sass`, `.less`, `.styl`, `.stylus`; a Tailwind `.css`
  follows only its own rule below) whose extension has a compiler registered is open when any
  specifier the port emits, resolved by knip's ported resolve steps, lands inside the workspace
  (a real path not inside a `node_modules` package, as in X1) on a `DEFAULT_EXTENSIONS` file, a `.svelte`
  file or a non-style knip-compiler candidate; a style target is never claimed and gets its
  own test, and assets on the leaf list (images, fonts, `.json`, …) stay leaves, so `@use
  "./variables"` or an image or font `url()` keeps it a leaf (units with `url(./icon)` next to `icon.ts`, and with
  `@use "@lib/theme"` through a `paths` key next to `theme.ts`). Once any workspace registers the Tailwind compiler, every `.css`
  in the run is read by it (`ProjectPrincipal.ts:96-99`), which turns `@import`, `@import
  url()`, `@plugin` and `@config` into imports (`plugins/tailwind/compiler.ts:3-17`; with
  knip's extension order `@import "./button"` can resolve to `button.ts`, so these records go
  into M_K as the style compiler output), and such a file is open when an `@plugin` or
  `@config` target is not package-like by knip's `isStartsLikePackageName`
  (`util/modules.ts:54-57`) or resolves inside the workspace by knip's ported resolve steps (a workspace package, a
  package-like `paths` key), found with
  the Svelte style parser, not a byte scan (P1); a file the parser rejects is open; a unit has
  two workspaces where only the app depends on Tailwind. On an extension we read, the allowed compilers are knip's `builtInCompilers`
  (`compilers/index.ts:29-35`), knip's Svelte plugin compiler and Tailwind's `.css` compiler
  (modeled above); any other one (a user or
  `asyncCompilers` function, Nuxt's `.ts` compiler when a workspace has a `nuxt` or
  `nuxt-nightly` dependency or `.nuxt`,
  `plugins/nuxt/index.ts:123-133`, `unplugin-auto-import`'s `.ts` compiler,
  `plugins/unplugin-auto-import/index.ts:16`, all run-wide) stops claims with reason
  `knip-compiler`, since M_K models only the allowed text. knip
  registers compilers per workspace and builds each workspace's default `project` and `entry`
  globs from its own extensions (`WorkspaceWorker.ts:259-266`, `graph/build.ts:178-191`), so
  when a workspace that holds a `.svelte` file does not register knip's Svelte compiler itself
  (no `svelte` in its own `dependencies` or `devDependencies`, the set knip's
  `hasDependency` and every `isEnabled` read, `DependencyDeputy.ts:160-166`, for example only in
  the root's or only in `peerDependencies`, or `svelte: false` in
  its knip config, `plugins/svelte/index.ts:16-18`), its `.svelte` files are not knip project
  files, and claims stop for the run with the same reason (units: `svelte: false`, and a
  workspace without its own `svelte` dependency); a user compiler function on any other extension, style ones
  included, and every `asyncCompilers` key make that extension a
  candidate; `compilers: { '.x': true }` counts only for a built-in (`compilers/index.ts:21-61`). These candidates are not project files, so S3's
  project-file equality does not count them; they are compared with knip's `projectPaths` limited to the
  extensions of the oracle run that we make candidates (not `.svelte`, not built-in style
  extensions, and for `.css` only the files the Tailwind rule above opens), taken from that run,
  not from our modeled list, so a missing plugin compiler in our data shows; knip's `project`
  globs (per workspace, `graph/build.ts:191-192`) and gitignore cut them, so ours ⊇ knip's is
  the check, and `.tsx`/`.jsx` candidates are compared the same way. Style files that knip reports under `files` are a remove class.
  Units: a `tailwindcss` CLI input with `@plugin './x.js'` that no JS file imports, an `@plugin` reached only through
  a CSS `@import`, and a Storybook `.mdx` that imports a `.ts` file, a built-in `.mdx` with `@mdx-js/react` and
  no `addon-docs`, a `.tsrx` file, and a knip config `compilers` key (each expects `stopped`).
- **Entries are knip's kind of entries:** framework entries (SvelteKit routes, hooks, params,
  service worker, `instrumentation.server`, and the files `kit.files` points to), config files,
  `package.json` `main`/`exports`/`bin`, scripts, test-runner entries, and knip's `definitionPaths`
  as production entries (`graph/build.ts:145-155,200-205,340-358`): the `.d.ts` files of the
  `include`/`files` of each knip workspace's own `tsconfig.json` (its `package.json` folder, or
  knip's `tsConfigFile`; `build.ts:135,145`), with `extends` applied as knip's get-tsconfig
  applies it (an inherited `include` is rebased; Kit configs have none of their own), not
  following `references` and not `jsconfig.json`, with gitignored files dropped by knip's
  rule, ported as is (`.gitignore` files in the workspace folder and its parents up to the git
  root, `glob-core.ts:299-310`; nested `.gitignore` files only when any gitignore has a `!` line,
  `glob.ts:75`, `glob-core.ts:336-342,372`; `info/exclude` only when the working folder is the git
  root, `glob-core.ts:184`; never the global excludes file; none when `gitignore: false`,
  `glob-core.ts:353`); the scratch copy root is made a git root (an empty `.git`), so the walk
  stops at the same place in the oracle and in our run, with units with and without a `!` line;
  `outDir/**` is excluded, inherited through `references` too (`load-tsconfig.ts:69-72,113`) (`load-tsconfig.ts:56-82,
  166-175`, `build.ts:357`). No `include` and no `files` means knip's default `**/*` (`load-tsconfig.ts:74`); tsconfig
  `exclude` applies as negated globs, folders expanded by the same `hasExtension` rule
  (`load-tsconfig.ts:69,76-77,167`), and `files` entries bypass `exclude`, `outDir/**` and the dot-folder rule (the entry glob
  has `dot: true`, `glob.ts:68`), while a missing one is dropped by the entry glob
  (`build.ts:357`); the tsconfig glob does not follow symlinked folders
  (`followSymbolicLinks: false`, `glob.ts:92`); a unit for each;
  wildcards never enter dot folders, with or without an `include` (tinyglobby with `dot` off,
  `glob.ts:89-95`), while a literal dot part does, and an `include` folder whose last part has a
  dot (`src/v1.2`) is not expanded (`hasExtension`, `load-tsconfig.ts:10-21`); the set is empty for `files: []`
  with no `include` after `extends` (a *references-only root*), for `include: []`, for no
  tsconfig, and when get-tsconfig throws (a missing `extends` target; invalid JSON parses as empty
  options and gives `**/*`); in production mode knip's `negatedEntryPatterns` are removed from it too (`build.ts:340-345,352-357`, for example vitest's `__mocks__/**`), with a unit; ignored workspaces are removed from it, and so are nested
  workspaces when some pattern in the same normal entry glob call (not the skip-exports call,
  `build.ts:362-368`) starts with `**/`; we port this, and a unit covers it
  (`WorkspaceWorker.ts:220-223`); one unit per case. These entries, like `package.json` entries
  (`build.ts:203-204,216`), never skip export analysis, so under `isIncludeEntryExports` their
  exports are claimed. Own units: a non-ambient, unreferenced `src/global.d.ts` with `declare
  global` and an export under a root tsconfig that includes it (no `files` issue); the same
  file in a nested workspace whose own tsconfig includes it (no `files` issue) and in one with
  no tsconfig under a root tsconfig with `include: ["src"]` (reported), and with a default
  root tsconfig, whose `**/*` already covers it (no `files` issue); and the same file under a references-only root (reported, as knip's
  `resolution/ambient-declaration-files`, which Selection part 2 names). They come from
  framework and tool rules over a config snapshot:
  - Entries may come from a static read of the config, the way knip reads `vite.config`/
    `svelte.config` ASTs, but the plugin and preprocessor sets need Vite's own
    `resolveConfig(command, mode)` (§6 plugin rule). The LSP and watch mode never offer X3
    claims: their snapshots would run Kit's sync again and again and fight the user's dev server
    over `.svelte-kit`. X3 runs only as a one-shot CLI command, which writes `.svelte-kit` once per
    mode, as `vite build` does.
  - Every config resolution, the LSP's included (each project's config snapshot, Kit's sync inside its `build` resolution, and, outside the LSP, the final development sync), is taken in a fresh Node process
    started in a stated directory: the folder of the project's `package.json`, or one the user
    declares; the report names it. One process cannot serve two Kit projects, because Kit saves
    `process.cwd()` once per module instance.
  - Paths inside output (vps's absolute `filename`, `cssId`, the appended CSS import, recorded
    options) have the copy's root replaced by a placeholder before they are stored or compared;
    a control runs one unit from two copy roots.
  - Snapshots are not cached between runs: every run resolves the config again. Every Kit
    resolution writes the env types (`.svelte-kit/env.d.ts` on Kit 2, `node_modules/$app/types/env.d.ts` on Kit 3) (and may run the user's env entry); a `build`
    resolution runs Kit's full sync and writes `.svelte-kit` in the working directory, as
    `vite build` does. Every step that loads a config, oracle or ours (snapshots, the final development sync, both `project.build` arms, the
    `project.graph` probe build and the service-worker build) runs on a
    scratch copy of the unit's `input/`, whose root is taken as a real path (macOS temp paths
    are symlinks); the installed dependencies are copied with the copy, keeping pnpm's and the
    workspace's symlinks when they point inside the copy (a link that points outside it is
    refused); module paths are relative to the copy root and the environment is pinned. No arm
    injects `rootDir` into vps's options: it stays svelte's default, the real path of the stated working directory
    inside the copy, so a run never changes pinned files; the modes run in a fixed order
    one after another, never in parallel, with the build's default mode (`production`) and `NODE_ENV=production` last, in every run, and Kit 2's sync writes `.svelte-kit/ambient.d.ts` for the mode that ran (`src/core/sync/sync.js:22-24`), so without a further step the last snapshot would decide it (Kit 3 writes no `ambient.d.ts`). After the last snapshot, the run takes one more config resolution, `resolveConfig({ configFile }, 'build', 'development')` in a fresh process like any snapshot (Kit 2's `core/sync/sync.js` is not exported, and its CLI rejects `-c`); it runs `sync.all(…, 'development')` (Kit 2 `vite/index.js:449`) and `sync.env(…, config.mode)` (Kit 2 `:528`, Kit 3 `exports/vite/index.js:622`; Kit 3's mode-dependent output), the mode `svelte-kit sync` uses (Kit 2 `cli.js:36,45`, Kit 3 `:37,46`), so the user's `.svelte-kit` and what tsgo reads, and what the old check can reach through the `extends` chain, match `svelte-kit sync && svelte-check` (a unit compares Kit's generated output with a real `svelte-kit sync`, Kit 2, and `svelte-kit sync -c`, Kit 3, on a file set per Kit major kept as versioned data: Kit 2 `.svelte-kit/{tsconfig.json,ambient.d.ts,non-ambient.d.ts,types/**}` and its env files, since the CLI runs `sync.all_types`, Kit 2 `cli.js:100`, while we run `sync.all`; Kit 3 `node_modules/$app/**`, where it writes env and app types, `write_env.js:20`, `write_app_types.js:305`, and `${outDir}/types/**`, the route `$types` that the generated `rootDirs` reads, `write_types/index.js:38,69,187`, `write_tsconfig/index.js:39`; positive control: deleting one route's `$types` after our arm runs turns the unit red; the unit ships no `${outDir}/types`, because Kit regenerates route types only when sources are newer, the meta-data file is missing or a source was removed (`write_types/index.js:114-122`), so shipped files would let copy times decide; with a `$env/static/*` name that only `.env.development` defines and a Kit 3 explicit-env case; both arms run with `NODE_ENV=development`, because Vite sets it before Kit's hooks and Kit 2 copies every `process.env` key into `$env/static/private`, `node.js:37261-37263,6061`; both Kit CLIs resolve the Vite config in `build` with `process.env.MODE ?? 'production'` (Kit 2 `core/config/index.js:192`, Kit 3 `:128`), and ours in `development`, so a config that branches on mode can differ, listed for both majors). The step runs once per Kit project. Knip units do not run it: they use the `.svelte-kit` that knip ships (for example
  `plugins/sveltekit/.svelte-kit/tsconfig.json`), since their stub dependencies would make it throw. Kit 2 writes route types only when `typescript` resolves from Kit's folder (`write_types/index.js:36`); with TS 7 installed as `typescript` it writes them without proxies (`tweak_types` fails and returns null, `:628,874-875`). The cause is detected from the output, not the version: when `${outDir}/types` or the `$types.d.ts` of a route Kit writes types for (one with a leaf, layout or endpoint, `write_types/index.js:68`) is missing after the sync, that is its own named cause, counted, and type facts stop, so the "run sync" hint does not fire forever. If it throws, or the resolved plugins lack `vite-plugin-sveltekit-setup` (a config that adds `sveltekit()` only for `serve` runs no Kit hook; Kit's own CLI then falls back to `svelte.config.js` or defaults, Kit 2 `config/index.js:70-85,199-203`, Kit 3 `:135-137`, so we fail closed where `svelte-kit sync` succeeds, counted), type facts of that project stop, `rsv check` reports one "sync failed" diagnostic, and when X3 needs tsgo it is an unknown root with reason `sync`, so tsgo never reads the production snapshot's output; `vite dev` writes its own mode (`dev/index.js:65`), as without us; `get_env` reads `loadEnv(mode, dir, '')` (`utils.js:73`), so `NODE_ENV` set by the snapshot is an export too. A key for reuse is "not planned
    yet" (§7); a recorded read set does not work as one, because Vite bundles the config to a
    temp file with a random name, vps and Kit import their configs with a time query, and
    `loadEnv` copies the whole environment. The cost of resolving every run is measured (S3).
  - The snapshot's stated inputs are the working directory, the config-file path (`-c`), the
    mode, the command, and a digest of the process environment (reported; the fixture importer
    pins the environment).
  - Own units, each with its declared directory in `meta.json`: two Kit apps in one workspace
    (each gets its own process and directory); one app whose declared directory is the
    workspace root, built with `-c` and no `sveltekit()` argument (expected:
    entries from the root's `svelte.config`, `.svelte-kit` at the root, written by the
    snapshot from the `-c` config), and the same app with its own folder declared, as a separate unit, which must give
    different entries.
  - SvelteKit takes options from `svelte.config.*` or from the `sveltekit()` plugin call; Kit reads only
    `svelte.config.js`, then `svelte.config.ts` (`.js` wins), never vps's longer list of names;
    from Kit 2.62.0, any argument to `sveltekit()` (even `{}`) makes Kit ignore `svelte.config.*` as a
    whole, for entries, aliases and preprocessors (versioned data; Kit warns so). When a static
    read cannot tell whether the argument is `undefined`, the entries come from `resolveConfig`,
    or the project gets no entry claims. Own units: the two files name different `files.hooks`;
    `sveltekit({})`; both `svelte.config.js` and `.ts`.
  - Entry globs, project-file globs and framework-owned names are versioned data, not code.
- **Every entry module's exports and every entry component's props are Unknown,** unless a
  framework rule names them, or `isIncludeEntryExports` is on (taken from the workspace that holds the exporting file by path, `analyze.ts:164-167`; the
  workspace value wins over the
  root config, which wins over the option, `ConfigurationChief.ts:153,438`; a unit has the
  option `true` and the config `false`). Then entry module exports are claimed as knip claims
  them: plugin entries still skip export analysis unless the plugin opts in (`build.ts:267`)
  or an explicit `entry` glob also matches them (`build.ts:380-381`), so Kit route exports are
  claimed only in that case. Entry component props stay Unknown whatever the option says. An entry's Unknown exports pass Unknown through the
  export table to every binding they re-export, as knip skips exports whose re-export chain
  reaches an entry (`analyze.ts:213-216`); whether the option is on is read from the workspace
  of the exporting file, as knip reads it (`analyze.ts:164-167`), with a two-workspace unit. knip follows a star re-exporter only when no named pass-through of that name exists
  (`is-referenced.ts:126-129`), so where a named re-export elsewhere makes knip report a name we
  call Unknown or used, that is a reasoned adjust class with a unit. knip marks a re-exporting entry without checking
  `export *` shadowing or ambiguity (`is-referenced.ts:36-37,124-129`), so a binding whose only
  path to an entry is a shadowed or ambiguous `export *` is Unknown here too, with a unit. Ambient declaration files (by TypeScript's declaration-file test, any `.ts` basename with a
  `.d.` part, where knip tests only `IS_DTS`, `build.ts:601-606`, so an unpaired ambient
  `x.d.foo.ts` that knip reports is a listed difference; no static exports, counted on the
  knip-walk model's parse (same oxc, same options; a parse that throws counts as not
  ambient), as knip's `typescript/ast-nodes.ts:32-38`, `build.ts:599-605`; Kit's `src/app.d.ts`, which ends in `export {}`, is one) are
  never reported unused; an own unit has Kit's template `app.d.ts`.

### X4 Cross-file optimization — verdict: modify (opt-in, closed components only, provable rewrites only)

**Scope.** Only decisions **the Svelte compiler makes** and cannot make alone, because it sees one
file. JS-level inlining and dead-code removal stay with Rolldown/oxc.

**Objections**

1. **No AST oracle.** Output that differs from upstream cannot be compared with upstream. Concept C3
   allows it only as opt-in with runtime tests (concept.md:128).
2. **Static imports do not make the set of call sites complete.** A component is also a value:
   `mount/hydrate/render(C, …)`, a dynamic `<X>`, `<svelte:component this={C}>` (still accepted in
   runes, with a warning), `{#each comps as X}`, a prop, a snippet argument, context,
   `export { default as X } from`, `import * as M` then `<M.default>`, `import()`. `<svelte:self>`
   passes props with no import at all (runes: only the warning `svelte_self_deprecated`,
   `2-analyze/visitors/SvelteSelf.js`). SvelteKit pages have zero static call sites.
3. **Compiled JS has lost the Svelte meaning.** `$.prop($$props, 'p', …)` is an opaque call into a
   private runtime. A JS pass would find meaning by the shape of output (debt 2, P1).
4. **Facts inside lowering scatter the optimizer** across `lower/client.rs` and `lower/server.rs`
   (debt 3).
5. **Rewrites into other runes change timing or reactivity.** Upstream `prop()` evaluates the
   fallback when the component starts, even if the prop is never read
   (`internal/client/reactivity/props.js`). A default that upstream calls simple
   (`is_simple_expression` in `compiler/utils/ast.js`: literals, identifiers, function and arrow
   expressions, and conditional, binary and logical expressions of these) is evaluated eagerly on
   the client even when a value is passed. A lazy default is a `derived`. A bindable default is
   proxied (`client/visitors/VariableDeclaration.js`, `should_proxy`).
6. **A `const` has a temporal dead zone.** Upstream client reads a non-source prop as
   `$$props.p`, which has none. Another default in the same destructuring
   (`let { p = 5, q = p * 2 }`) is evaluated when that statement runs.
7. **The binding kind changes other decisions.** Upstream marks a component tag or a render tag
   as dynamic when its name is a prop (`2-analyze/visitors/Component.js`, `RenderTag.js`). After
   `const Icon = undefined`, `<Icon />` becomes a direct call and throws.
8. **Upstream never folds `{#if}`.** No 3-transform `IfBlock` visitor evaluates its test.
9. **Legacy callers** pass `$$legacy`, `$$slots` and `$$restProps`.
10. **Oracles that do not test the rewrite.** SSR byte equality fails for correct rewrites
    (hydration markers). Compiling the rewritten program with the official compiler and comparing
    it with our lowering of the same program checks lowering, not the rewrite. `in` walks the
    prototype (`'constructor' in $$props`). On a spread or `$state` props object,
    `getOwnPropertyDescriptor` runs proxy traps.
11. **The gain is UNMEASURED.**

**Decision**

- **Closed components.** C is closed only if all of these hold:
  - C's project is not edge-uncertain (P10);
  - C is in runes mode and declares its props with one destructured `$props()` (no
    `let props = $props()`, no `$$props`, no `$$slots`, no `<slot>`);
  - every module with an edge of any kind to C (including namespace imports and imports with a
    query) uses C's value only as a tag name that resolves, by scope and the export table (X1),
    to C's default export; a barrel that only re-exports C passes this on to its own importers, and C is not closed
    when an entry's exports reach C's default binding at any hop (named, `export *` or
    namespace re-export), because the entry's importers are outside the run (own unit: the Kit
    library template, whose `src/lib/index.ts` re-exports `Button`, with a demo route that
    leaves out a prop, and no prop finding expected);
  - type-only references (`ComponentProps<typeof C>`) are allowed;
  - C's call sites include every `<svelte:self>` inside C;
  - C is not an entry module, a framework convention file, or under `node_modules`;
  - C is not a custom element (`<svelte:options customElement>` or the `customElement` option),
    and `compatibility.componentApi` is not 4;
  - no caller is in legacy mode;
  - the project has no open module (P10) and no unbounded `import(x)`.

  Any spread at any call site of C makes all prop facts of C Unknown.
- **Common preconditions** for a prop in closed C. `p` names the local binding; the prop key may
  differ (`let { 'data-x': x } = $props()`).
  - `p` is not updated (upstream `binding.updated` or `binding.reassigned`: `p = …`, `p++`,
    `bind:x={p}` inside C, `export { p }`, destructuring assignment) and not `$bindable`.
  - The default is absent, or a string, number, boolean or `null` literal.
  - Before the `$props()` statement there is no statement with a runtime effect (imports, type
    declarations and function declarations are allowed).
  - The key is not a CSS custom property (`--x`).
  - Every use whose meaning depends on the binding kind is safe. The list below comes from two
    sources: the analysis visitors that read the binding kind, and the transform code that calls
    `scope.evaluate` (which treats a prop as unknown and a `const` literal as known). It is
    checked again on every upstream version bump.

| Use of `p` (upstream reader) | Allowed |
|---|---|
| Snippet position: `{@render p?.()}` (`RenderTag.js`), `<svelte:boundary pending={p}>` or `failed={p}` (server `SvelteBoundary.js`, `scope.evaluate`) | only when the value is `undefined` or `null`. With `false`, `0` or `""`, the upstream client renders nothing but the rewrite throws (the upstream server already throws). It also changes snippet resolution, which only CSS reads; CSS comes from `Analyzed` |
| `{@render p()}` without `?.` | no (dev throws `invalid_snippet` upstream) |
| `<p />` as a component tag (`Component.js`) | no (objection 7) |
| A component attribute `<D x={p}>` (`shared/component.js`) | yes, any literal: D reads the same value through `prop()` and the rest-props descriptor traps. It changes snippet resolution, which only CSS reads; CSS comes from `Analyzed` |
| Text, `<title>` (template inlining through `scope.evaluate`) | yes: the inlined text equals the text upstream prints |
| Attribute values, including `<input value>`, `<select value>`, `<option value>`, `<textarea value>`, `autofocus`, `checked`, `muted` (`Identifier.js`: `has_state` becomes false) | yes: the update moves from a template effect to init; one oracle (b) pair per element kind |
| Event handler `onclick={p}` (`shared/events.js`: a prop gets a `?.apply` wrapper, a `const` is passed directly) | yes: `null` is skipped on both sides, and a non-function throws at event time on both; one oracle (b) pair |
| Shorthand `style:p` (`StyleDirective.js`), member and call expressions (`is_safe_identifier`: `needs_context`) | yes: they only make updates static or drop an unneeded context push |
| `{#each}` over an expression that reads `p` and whose items are mutated (`EachBlock.js` promotes the binding) | yes, with an oracle (b) pair |

- **Rewrites.** A row applies only when every precondition holds; otherwise nothing changes.

| Fact about closed C (join over all call sites and environments) | Rewrite |
|---|---|
| The key of `p` is never passed | `const p = <default, or undefined>` |
| The key of `p` is always passed the same value (table below), and the value is not `undefined` | `const p = <value>` |

  - `key={undefined}`, with the global `undefined`, counts as not passed.
  - For `children`, any child content counts as passing it, including comments when the caller's
    resolved `preserveComments` is true.

| Call-site form | Value |
|---|---|
| `key` (a bare attribute) | `true` |
| `key="text"` | the text decoded as upstream decodes it (`validate_code` in `1-parse/utils/html.js`), as a string |
| `key={lit}` or `key="{lit}"` (one expression chunk), `lit` a string, number, boolean or `null` literal | that literal |
| anything else, including the shorthand `{p}`, strings with a lone surrogate, and BigInt | Unknown |

  - Two values are the same when their types are the same and `Object.is` is true.
  - The value is written again, never copied from the caller's text. It must read back as the
    same value without naming an identifier (`1e400`, not `Infinity`; NUL as an escape).
  - The `const` is placed immediately **before** the `$props()` statement. The key stays in the
    pattern under a fresh name and **without its default**, so `...rest` still excludes it and
    the fresh binding is not a prop source. In Svelte source:
    `const p = 5; let { p: _p1, ...rest } = $props();`.
  - `{#if}` is not folded. "Bindable never bound" is a lint finding (X3), not a rewrite. Every
    other form stays Unknown until it gets a row and an oracle (b) pair.
- **Summaries are computed once, from `Analyzed`, never from `Optimized`.** This is sound only if
  `Optimize` never adds a call site, a spread, a use of a component value, or a passed value. The
  harness asserts: call sites and passed values in `Optimized` ⊆ those in `Analyzed`.
- **Its own pass, `Optimize`, on the Svelte IR,** after Link and before lowering. Lowering never
  sees a slice (P11). Where optimization happens:

| Where | Level | Knows | Who |
|---|---|---|---|
| Inside lowering | one file, Svelte → JS | this component | lowering (what upstream does) |
| **Optimize** | project, Svelte IR | every use of this component | this pass |
| After emit | bundle, JS | JS values, side effects | Rolldown / oxc (non-goal) |

- **What `Optimized` is:** a second `CompileInput`: a new `Ast` built with `rsv_js::copy` and a
  rewrite, and a rewritten HIR whose expressions point into it, with `Resolution` and node metadata (dynamic tags,
  `has_state`, known values) computed again from it. Every CSS decision (the CSS text, pruning,
  which elements get the scope class) and every warning comes from `Analyzed`, so the rewrite
  cannot change them. The recompute takes `Analyzed`'s `scoped` flags as input for the steps that
  read them (upstream `mark_subtree_dynamic` for scoped custom elements, class and style
  attributes). So our JS equals the official compiler's output for the hand-rewritten source,
  except for decisions derived from `metadata.scoped`: class strings, synthesized `class`
  attributes and hash arguments, and the dynamic marking of scoped custom elements. Our output
  keeps the scoping of the source as written. The harness asserts that the CSS text and the
  scoped elements of `Optimized` equal those of `Analyzed`, and the per-file compile gate already
  compares that CSS with the official compiler's CSS for the source as written. A value copied from a caller's file is
  a synthetic node with owned text, a separate type (P4). `resolve`, `analyze` and lowering run unchanged on it (S6). The rows need no `Decisions` variant.
- **When no row fires,** `Optimize` returns the `Analyzed` it was given. With the flag on and no
  rewrite, output is byte-identical to the flag off, on every per-file unit.
- **Oracles** (concept.md:128 requires runtime tests):
  - (a) **Assumption validity.** A production build of *unoptimized* output, client and server.
    The compiler inserts one check at the start of each component where a row would fire. In such
    a component `$$props` is an object literal built by the caller, so its keys cannot change
    later, and one check is complete.
    - The instrumented runtime puts every object made by `spread_props`, `proxy` or the
      `svelte/legacy` class wrapper into a `WeakSet`. It wraps the internal `mount`, `hydrate`
      (`internal/client/render.js`, which `svelte/legacy` imports directly) and the server
      `render`. `$$props` in the `WeakSet`, or a closed component given to one of the three, is a
      violation, reported before any property access.
    - Otherwise check with `Object.hasOwn` and `Object.getOwnPropertyDescriptor`. Never call a
      getter.
    - Row 1: the key is absent, or an own data property with value `undefined`. Row 2: an own data
      property with the same value.
    - Reports go to a side channel, never a throw. It runs e2e (for example Playwright) against
      the production build.
  - (b) **Row equivalence.** For each row, hand-written pairs of components: as written, and
    rewritten by hand in Svelte source. Compile both with the official compiler and run the same
    interaction script, client and server, dev and prod. Compare the DOM after removing scope
    classes and `<style>` text, an event log and an effect log; console output is out of scope.
    This tests the rule, not our lowering. Each
    counterexample from the review is a pair that must show a difference when its precondition is
    removed: a TDZ read before `$props()`, `q = p * 2` in the same pattern, a `...rest` spread, an
    eager simple default, `{@render s()}` without `?.`, `<Icon />` with a prop tag, a `false`
    default with `{@render p?.()}`, `p={false}` with `<svelte:boundary pending={p}>`.
  - (c) **Behavior.** The same e2e with the flag off and on. Compare the DOM after removing
    hydration comments and scope classes, after scripted interactions.
  - Positive controls: per row, one project unit with an injected missed caller, where (a) and the
    build guard (X2) must report; one unit where an unrelated module is open, where no component
    may be closed.

## 3. New principles

| # | Rule | Stops | Enforced by |
|---|---|---|---|
| P8 | Data crosses files only through summaries and slices. | Hidden cross-file reads; one integer meaning different things in two files or two runs; imprecise cache keys | `Portable` bound on summary and slice outputs; no `Portable` for raw integers, `Atom`, `Span`, `NodeId`, `ModuleId`; a CI check that rejects the bare identifier `__private` outside the kernel and the derive crate (identifier pasting gets past it and is left to review); compile-fail tests (a summary holding `Atom`, one holding `u32`) and a test crate with a manual impl that the CI check must reject |
| P9 | One resolver per meaning. Bundler edges: our resolver, compared with the Vite plugin chain. Type facts: TypeScript's own resolution, never ours, except type names that travel over a value edge (a mixed `import { a, type T }`, a value `export *` or named re-export), which count as uses on the bundler target and on tsgo's target, as X1's every-target rule says (knip credits only its own resolver's target, which has no `types` condition, `util/resolve.ts:44-56`); tsgo's target of a value edge from an importer tsgo reads (a TS importer, or a JS importer under `allowJs`) is also a reach target, and the declaration-file rule covers `foo.ts` next to an imported `foo.js` without tsgo; a tsgo run that is required but incomplete is an unknown root for the run (X1). Four exceptions: two reach-only ones (X1), which mark a file as used and receive the edge's name uses (a type import's reach target from our resolver, and the declaration-file rule); call edges (X1), which follow knip's ported resolve steps; and the X3 source mapping from a package's output folder to its source folder. | Two resolutions of one import that disagree, unseen | `project.graph` on project units; a unit with an alias only one side knows must turn it red; the X2 build guard in user builds (only with X4 on; the X3 CLI has no comparison with Vite's resolution in user projects); `project.types` checks one way that tsgo's target is among the reach targets, for importers tsgo reads (TS importers, and JS importers under `allowJs`), with a control that drops tsgo's target; and that every value edge tsgo reads has its `value-reach` row (a test of the join); targets only ours has are listed as data |
| P10 | Open world is the default. A module is open when no framework rule names it and any of these holds: it is an `Outside` target (X1); for X3 only, it is a "knip compiler file" candidate as X3's list decides, reached or not; no rsvelte language plugin claims it, it is not on the leaf list, and it is not a raw or url target whose extension knip does not read either (a leaf for X3, X1), and it is not a call or `asset-url` target with an extension that knip does not accept and no known language imports code from (X1 "Call edges": such a target is a leaf marked used, except the target of a process call, which is an unknown root); its language has no edge summary (Vue today); its `EdgeSyntax` fails or panics; it is an `Unresolved` or `Virtual` target of a bundler edge (a `type` edge never opens its target, X1; an unresolved `asset-url` target is a hint, X1 "Call edges"; an `asset-url` target that is a directory, such as `new URL('./src', import.meta.url)` in a config, is a leaf, because a directory is not a module). A plugin or preprocessor that is not on the named list makes the whole project edge-uncertain instead (§6 plugin rule), because edges may then exist that no source shows. A framework rule (versioned data) may name a virtual or generated module, by its resolved id, as a leaf when its code never imports user components. The data is per pinned version and is gated by measurement, not by reading: the `project.graph` probe records every virtual id (`\0…`) that each own unit reaches, and an id the data does not name is a gate failure, so a framework or Vite upgrade cannot add an unnamed id silently. Read at kit 2.49.5 and rechecked by a reviewer at 2.70.3: `\0virtual:env/*`, `\0virtual:__sveltekit/server` and `\0virtual:service-worker` import only Kit runtime files; Kit's remote plugin rewrites `.remote.*` modules (client: their imports are replaced by one import of `__sveltekit/remote`; SSR: it adds a self-import and `@sveltejs/kit/internal`), and the Kit rule names that rewrite, with a remote-function unit as its control; Kit's service-worker build does not load the config file (`configFile: false`, Kit's aliases and its own virtual-module plugin only), so the Kit rule models that build and its virtual ids instead of the probe, under its own environment `service-worker` (Vite's default resolve options plus Kit's aliases; the user's `resolve.*` does not apply), with its entry (`kit.files.serviceWorker`) and expected edges written by hand; its virtual ids (`\0virtual:app/env/public` is a leaf) are measured too: the importer wraps `vite.build` with a Node loader hook and adds the probe to Kit's inline service-worker config; controls: a service worker importing a `$lib` file (resolved), one importing through `kit.alias` (resolved), and one through a user-only `resolve.alias` (Unresolved, open; Vite fails that build on the unresolved import, and the importer accepts this declared error for the service-worker step only); at 2.70.3, `\0virtual:__sveltekit/env` (which replaced `…/environment`) is a pass-through edge to the user's `src/env` entry when `explicitEnvironmentVariables` is on, and that entry is an X3 entry; Vite's `\0vite/preload-helper.js`, `\0vite/dynamic-import-helper.js` and `\0vite/modulepreload-polyfill.js` import no user code; `\0sveltekit-remote:*` is a pass-through edge to the user's `.remote` file; the generated manifests import route files, hooks and param matchers (route files are never closed; hooks and matchers are X3 entries). vite-plugin-svelte's own style id (`C.svelte?svelte&type=style&lang.css`) imports only CSS and is a leaf. An `External` target (a package Discover does not enter; a target outside the workspace root that is not inside a `node_modules` package is open instead, X1) is a leaf: a package cannot import user files except through an alias a framework defines for it, and a framework rule names such edges. A user alias with a bare key that a package also imports is not detected here; in a build the X2 guard sees the real edge. Otherwise a package cannot reach user files, and a user component given to a package function is a value use, which makes it not closed. Kit's runtime breaks that condition: it imports `__SERVER__/internal.js`, aliased to `.svelte-kit/generated/server`, which imports user hooks; the Kit rule names that edge. A framework rule may name unresolved specifiers too (SvelteKit `$app/*`, `$env/*`, `$service-worker` in knip units, whose `node_modules` are stubs). A project is *edge-uncertain* when a plugin may change its edges in ways no module shows (§6 plugin rule); then no component is closed and X3 makes no claim of any kind, the Svelte findings included. An open module makes no component closed and stops every X3 claim (files, exports, props, dependencies) for every project in the run (X3 "Across projects"). | Wrong programs from a missed caller; false "unused" reports | Computed in the kernel, not per rule. Control units, each with its expected result: an open module that is not a caller gives zero closed components and no file claims; a unit that imports CSS still gives file claims; a unit with a virtual module gives zero closed components; a unit with a `.html` entry gives file claims once the HTML edge summary exists, and none before; a Kit unit that imports a real dependency still gives file claims; a Kit unit's `edges.json` has the named edge from Kit's runtime to `.svelte-kit/generated/server` (removing the rule removes the edge, so the control can fail) |
| P11 | Optimize where the meaning still exists: on the Svelte IR, in one pass. | Pattern matching on output; one optimization per target | A slice reaches code only as the argument of the `SpecArtifact` that declares it (§5); lowering is a plain function of `(CompileInput, &Resolution, &Analysis)` with no context to ask for a slice. Caught only by review: a `SpecArtifact` that copies its slice into its output. A task that reads a `SpecArtifact` output has that slice's digest in its cache key |
| P12 | Project output does not depend on scheduling. | Nondeterministic reports and cache misses | Ids never leave the process; outputs sorted by the full module key (path bytes, query class, project, environment); a test that runs with 1 and N threads, each arm in its own process under the random-seed hasher cfg, and compares output digests, with an injected order dependence as its control |

## 4. Changes to fixed choices

Each change holds only if its measurement (§8) agrees. AGENTS.md is updated in the same change
that implements it.

| Fixed choice | Change | Allowed by |
|---|---|---|
| Tasks for one file run in order on one worker | Specialize may run on another worker, only when a barrier exists | Q-P1 |
| Each source file is read once | Re-parse of the kept text after the barrier is a candidate, and the default until Q-P1 decides | Q-P1 |
| One arena per file, freed when the file is done | Kept across the barrier if Q-P1 chooses "keep" | Q-P1 |
| AGENTS.md says `Span { file, lo, hi }`; the code has `Span { lo, hi }` (`source.rs:6`) | Keep `Span` per file; `ProjectSpan { path, text, lo, hi }` for data that crosses files. Fix AGENTS.md | — (the two texts already disagree) |
| Derived artifacts live for one run (concept C5: content-hash keys are not implemented yet) | A persistent cache, for skipping Link and for the LSP | Not planned yet (§7) |

## 5. Kernel sketch

```rust
/// A stable encoding and a digest. Only derived, or implemented in rsv_kernel (CI check).
pub trait Portable: __private::Sealed + Send + Sync + 'static {
    /// The derive combines the VERSION of every field.
    const VERSION: u32;
    fn encode(&self, out: &mut Encoder);
    /// Provided: one hash over VERSION and `encode`, the same for every type.
    fn digest(&self) -> Digest128 { Encoder::digest_of(self) }
}

pub trait Summary: Artifact<Output: Portable> {}

/// Tuples of `Summary` or `ProjectFact` types, so a fact or slice declares what it depends on.
pub trait SummarySet: 'static {}
pub trait FactSet: 'static {}

/// Computed in Link.
pub trait ProjectFact: 'static {
    type Reads: SummarySet;
    type Output: Send + Sync + 'static;
    fn compute(p: &ProjectCtx<'_>) -> Self::Output;
    // Discover runs one `Ctx` per (document, project) that shares the document's `Parsed`;
    // that `Ctx` carries the project key and compile options (a function-valued `runes` is
    // evaluated per file), so `Analyzed` and `ComponentSummary` are keyed by (path, project).
    // A unit shares one component between two projects with different options.
}

/// The part of project facts one file may see: the join over all environments.
pub trait Slice: 'static {
    type Reads: FactSet;          // the project facts it depends on
    type Output: Portable;
    fn slice(p: &ProjectCtx<'_>, m: &ModulePath) -> Self::Output;
}

/// Computed in Specialize. The slice is an argument: no other code can ask for it.
pub trait SpecArtifact: 'static {
    type Slice: Slice;
    type Output: Send + 'static;
    fn compute(ctx: &Ctx<'_>, slice: &<Self::Slice as Slice>::Output) -> Self::Output;
}
// A task in Specialize gets `SpecCtx`: `get::<A>()` for artifacts and `spec::<S>()` for
// SpecArtifact outputs. It has no method that returns a slice.

/// Runs once in Finish. `ProjectOutput` holds report files and diagnostics keyed by `(ModulePath, project)`; X3
/// findings, which have no project, and modules with no `ModulePath` (External, open) use a
/// run-level key.
pub trait ReportTask: Send + Sync {
    fn run(&self, r: &RunCtx<'_>, out: &mut ProjectOutput);
    // `RunCtx` holds every project of the run, for X3's join across projects, and the
    // `TypeEdges` of the tsgo step: (project, importer real path, specifier) → the union of
    // targets over both resolution modes and over that project's programs (a resolved target
    // stays a reach target; the type facts are Unknown if any (program, mode) leaves it unresolved),
    // each program's read-file set (real paths), and completeness. The mode is not a key: tsgo derives it
    // from the importer's format, and we never compute it ourselves.
}
```

In `rsv_svelte`:

```
Parsed ─► EdgeSyntax, ExportSummary                              (Discover; open if Parsed fails)
   ├──► Resolved ─► UseSummary; Analyzed ─► ComponentSummary     (Discover; the JS/TS plugin
   │                                                               has the same Resolved stage)
   └──► Normalized (HIR) ─┬── lower(input, res, an) ◄── compile task, X4 off (Discover)
                          └─► Optimized (SpecArtifact: CompileInput, res, an) ─► lower(...) ◄── X4 on (Specialize)
```

The Svelte plugin also claims `.svelte.js` and `.svelte.ts` (compiled as modules, like upstream
`compileModule`). A JS/TS plugin claims `.js`, `.ts`, `.mjs`, `.cjs`, `.mts`, `.cts`, and an HTML
plugin claims `.html` for its edge summary. All need the
parser of Q-P11. In a project, the Svelte plugin claims every extension in the resolved Svelte
`extensions` (vps compiles each one, `utils/id.js:177-185`; Kit passes them on,
`exports/vite/index.js:195`); when one of them is also claimed by another plugin (`.html`) or is on the
leaf list (`.svg`), the project is edge-uncertain, with that reason. An extension other than
`.svelte` is claimed only when every preprocessor is on the named list; otherwise (mdsvex's
`.svx`) it is not claimed, and the preprocessor already makes the project edge-uncertain.
vps's `compileModule` filter also matches infixes such as `x.svelte.test.ts`
(`id.js:214-235`); edges are the same, so only precision differs. A user `include` in vps's
options widens what vps compiles (`src/utils/id.js:186-188`), so it also makes the project
edge-uncertain.

`FinishTask` stays for type check. Its `finish` runs in Finish, after the tsgo step. Type check
through projection files (today's `check.rs`, which writes `f{i}.ts` into a temp folder with a
generated config that extends the root tsconfig) is an existing tool, not a deliverable of
this design: the design's type check starts with the 7.1 content mapper (M4), which reads
`.svelte` in place, so no projection path, mirror, `rootDirs` or `paths` rebasing exists.
Until then this design changes the old check only where the new kernel forces it: Discover
runs one `Ctx` per (document, project), so parts are keyed by (document, project), and the old
check runs once per X1 program (the root unless it is references-only, plus the configs its
`references` name directly, the same set `TypeEdges` uses; a file goes to the first program
whose `include`, read with TypeScript's include rules (relative to the folder of the config that set it, so Kit 2's inherited `../src/**` is relative to `.svelte-kit/`; directory expansion, `include: ["src"]` meaning `src/**/*`; the default `**/*`; names starting with a dot skipped under any wildcard component; the default `exclude`; the implicit `node_modules`/`bower_components`/`jspm_packages` skip under any wildcard component, kept with a user `exclude`; `files`) but without the extension filter, so `.svelte` can match, covers it (an S2 unit has a directory-form `include`) and whose `exclude`
does not, else the root; this is a deliberate change, since HEAD's root choice loses every
option of a references-only root, and a failure it causes is loud, `check_failed`, not
silent: a referenced config's `types` resolve from the temp folder and give an unlocated
TS2688 that fails the group, the stated trade-off until the mapper; an S2 unit has a references-only root, a `types` entry and a JS error under
`checkJs`), extending that program's config, with its env
merge; `--tsconfig <path>` still overrides the choice for a one-project run, as at HEAD
(`rsvelte_command_line/src/main.rs:11-12,59`); each group runs under its own `catch_unwind`
inside `finish` (two parts for one output would hit the kernel's
one-part-per-output `expect` outside `catch_unwind`, and a `finish` panic clears every output
of every owner document, `computation/pipeline.rs:379-388` at HEAD; S2 has a two-project unit with a shared
`.svelte` file and an injected panic in one program's check that leaves the other's output), and `check_run` is a free function in
`rsvelte_typescript` that the check task's `finish` calls (the kernel cannot read `Part`).
Deliberate changes besides those: the final development Kit sync before a one-shot check,
and the "run sync" and "sync failed" diagnostics (X1, X3 snapshot). Its output is labeled
experimental, and its known gaps are listed, gated per file only (the `svelte.check` gate of
S0), not as a project: Kit output reaches it only through the `extends` chain; `paths`, `rootDirs`,
`types`, `typeRoots` and `${configDir}` resolve from the temp folder; relative and `paths`
imports of `.svelte` from a projection; ESM-mode `.svelte` imports; forced
`moduleDetection` and `skipLibCheck`; program choice differs from svelte-check's; user-file
diagnostics fail the group. Each is measured against svelte-check when the mapper lands,
not before. X3 never reads this run: its traced tsgo run is separate (X1 "Type edges").
Its part is a payload, not a summary: it changes on every edit, so it must not be a Link
input. `TypeEdges` is a typed, per-run value, not a part.

## 6. Fixtures: project units

A project unit is a directory of files. It extends [fixtures.md](fixtures.md).

**Layout.** `fixtures/project/<source>/<unit>/input/**`, plus `meta.json`:
- every file with its sha256;
- the entries, the aliases and the project-file globs, so S2 does not need Q-P6. For own units,
  the entries and aliases come from what the probe plugin saw in Vite, and the globs are written
  by hand (Vite never sees files it does not reach). For knip units, entries and project files
  are knip's recorded lists (below), one set per mode variant, and a unit has a variant only for the modes its knip test runs, recorded in `meta.json` (`knip-sets.<mode>.json`: production mode changes knip's entry and project patterns), and aliases come from the knip config and its plugins;
- the environments;
- the stated working directory per project, keyed by the project key: the `ModulePath` of the
  Vite config file Vite loads (given by `-c` or found by default), else of the project's
  `package.json`, together with the stated working directory (two apps may share one `-c`
  config; `edges.json` uses the same key); projects are listed from their `package.json` files first; the default working
  directory is that `package.json`'s folder, and only then is the config found from it;
- the lockfile digest; the `fixtures` tool installs dependencies from the lockfile into a local
  cache, in CI too;
- the importer that made it.

On import, every file listed in `meta.json` must be in `git ls-files` (a global gitignore can drop
`node_modules/` or `.svelte-kit/` stubs silently). Every own SvelteKit unit ships Kit's generated
tsconfig: `.svelte-kit/tsconfig.json` for Kit 2, `node_modules/$app/tsconfig.json` and
`$app/tsconfig/service-worker.json` for Kit 3.

**Tasks, sources and oracles.**

| Task | Units | Oracle | Expected file | Compared as | Adjust entry |
|---|---|---|---|---|---|
| `project.graph` | ours | (`edges.json` is the default-mode build snapshot; run with `NODE_ENV` set to `production` by the importer; edges of the other snapshots go to `edges.snapshots.json`, keyed with a `snapshot` field `(command, mode, NODE_ENV)` and produced by machine where cheap: `vite build --mode m` with the probe, and `environments[e].pluginContainer.resolveId` in a dev server; the rest is written by hand; compared as a set like `edges.json`, and since `resolveId` answers only the specifiers asked, files that only the serve snapshot reaches get a hand-written list of their expected edges) `vite build` with a probe plugin (below) and Rolldown's `experimental.lazyBarrel` pinned off (default `false`, Rolldown `define-config-*.d.mts:3981-3992`; Rolldown plans to remove the option, `:3986-3987`, a recorded risk for the oracle and X4) (it skips unused barrel targets; X4 refuses to run when a build turns it on), per environment except `service-worker` (written by hand, P10), for the kinds it can see (table below); expectations written by hand for the others | `edges.json`: sorted `{project, env, from, kind, target}`, where `from` and `target` include the query class (`project` is the project key: the `ModulePath` of the Vite config file Vite loads, by `-c` or by default, else of the project's `package.json`, with the stated working directory; the specifier is ours, for messages only); reachable modules only | set (missing, extra), on the mapped kind | `{task, key = "project\|env\|from\|kind\|target"` (the mapped kind), `expect, replace, reason}` |
| `project.types` | ours | none for targets (they are TypeScript's own, X1); the gate checks that our `EdgeSyntax` names join the pinned TypeScript 7 trace (`--traceResolution`, typescript-go `internal/tsoptions/declscompiler.go`) on (absolute importer path, specifier) without loss in both directions, for importers that are project files and for the edges TypeScript resolves: ES imports and exports, literal `import()`, `import x = require()`, `declare module` augmentations as knip reads them (any string-named, non-`global` `declare module` in a module file, `walk.ts:420-433`, so `declare module 'svelte/elements'` in `app.d.ts` is joined; non-relative imports and re-exports inside ambient bodies of script files; not the two forms TypeScript rejects, TS2436 and TS2439), `import('./x')` type nodes, and `require` in JS files (a trace row of such an importer with no such `EdgeSyntax` edge is red). Trace rows that compiler options add are worked out from the resolved options and removed as a multiset, one per file: `importHelpers` adds one `tslib` row per module file (resolved or not), `jsx` with `jsxImportSource` adds `<source>/jsx-runtime` or `jsx-dev-runtime`, and inferred type names have the fake importer `__inferred type names__.ts` (a unit without `tslib` installed, and one that also writes `import 'tslib'`). JSDoc edges in JS files are one-way: tsgo's rows must be among ours (a missed `@import` is red), and our extra comment edges are reach-only data with a count. `reference types` edges join the trace's "type reference directive" rows, and `reference path` edges join `--explainFiles` (its paths are relative to tsgo's working directory and are made absolute first). JSDoc edges in TS files, `require` in TS files and the kinds TypeScript never resolves (`asset-url`, `glob`, template `import()`, `call`) are reach-only data with a count; one positive control per class, for importers tsgo reads (`.svelte` importers are listed as reach-only data, with a count, until the mapper), and that tsgo's target is among the reach targets; positive control: dropping tsgo's target from the reach set is red; reach-only targets go to `reach.json`; its `type-reach` rows are checked one way (tsgo's target, after the same classification, must be among the reach targets; `External` targets are excluded and counted; a target only we have is data), and every value edge tsgo reads must have its `value-reach` row with the trace's target after classification (a test of the join), both for importers tsgo reads (TS importers, and JS importers under `allowJs`), and its `declaration-file`, `call`, `source-map` and `knip-reach` rows with rows written by hand in the unit; positive control: removing the declaration-file rule is red | `type-edges.json`, `reach.json` | set | `type-edges.json`: same shape; `reach.json`: key = `tag\|from\|target` |
| `project.unused` | knip's and ours | pinned knip `main()` with the options and mode of the knip test (see below); for our units, `input/knip.json` (`project` generated from the hand-written globs in `meta.json`, per workspace as `workspaces.<dir>.project`, because knip applies top-level keys to the root workspace only; `entry` left to knip's plugins, because Vite's inputs are mostly `node_modules`, generated or `index.html` paths that knip drops) and knip's default options, default mode only; dependency kinds are a separate variant (S4) | `issues.json`: sorted keys `{type, file, name}` plus a non-key field `namespace?` (reported, not compared), where `name` is `parent.member` for enum and namespace members and the plain symbol otherwise (knip's map key `${parentSymbol}.${symbol}`, `IssueCollector.ts:172`, carries the importer's namespace alias for export kinds, which is dropped; see the import details below); `line`/`col` are a separate field, not part of the key (knip counts UTF-16 units; a non-ASCII control unit checks our conversion) | set | add or remove one issue (`expect` = the issue key); or set one kind's claim state (key = the kind, `expect` = the sorted multiset of reasons, each `(class, module path, shape or specifier, span)`) |
| `project.svelte-unused` | ours | none: expectations written by hand, one unit per finding kind and case | `issues.json`, same shape | set | none |
| `project.unused-own` | ours | none: unused files and exports written by hand (the truth for Q-P6) | `issues.json`, same shape | set | none |
| `project.build` | ours | real vite-plugin-svelte per module, never our port: the probe wraps vps's real `api.compileSvelte` in the companion's slot and records its arguments and the returned `CompileData`; an `order: 'post'` transform records the final module code, checked separately; a second arm without the probe checks only final code, so the warm-cache arm of Q-P2, once it exists, also runs; filename recorded; neither arm injects `rootDir` (it is the stated working directory inside the copy) | per module: the whole `CompileData` (JS, CSS, `css.hasGlobal`, warnings, `lang`, the CSS import), source maps through `mapToRelative`; plus the CSS assets of the final bundle; plus the companion state per environment (`active`, or `inactive(reason)` with the exact reason), declared by the unit, because the oracle arm runs vps without the companion | `js-ast` for JS with the `svelte.compile` adjust rules; warnings through the per-file diagnostic projection (no `frame`; `frame` is compared in a separate count of mismatches, because vps prints it) plus `filename` with the copy root replaced; maps by the S7 mapping-quality measure and bound; exact for the rest; a separate check that our plugin received the same code and options (before the companion fills in `rootDir` for the native call) | as for `svelte.compile`, plus a `module` field |

- **What the `project.graph` oracle can see:**

| Our kind | Oracle kind | Expected edges come from |
|---|---|---|
| `static`, `reexport` | static (`importedIds`) | the probe |
| `dynamic` | dynamic (`dynamicallyImportedIds`) | the probe |
| `glob` | dynamic (`dynamicallyImportedIds`; Vite expands `import.meta.glob`); static (`importedIds`) for `{ eager: true }` | the probe; a unit per form |
| `worker`, `asset-url` | none: they become asset URLs, not module edges; but in the client environment only, a template-literal `new URL(…, import.meta.url)` becomes an eager `import.meta.glob` with `?url`, so those edges are static (not with `/* @vite-ignore */` or a pattern that starts with `${…}`) | written by hand; the probe for the template form |
| `css` | static | the probe |
| `type` | none: erased before Vite sees it | `project.types` |
| `require` | static (`importedIds`; Rolldown's `require-call`) | the probe |
| any kind inside a branch that a key Vite defines makes dead (`import.meta.env.DEV`, `PROD`, `MODE`, `SSR`, `VITE_*` keys, any other `import.meta.env.*` key, which is `undefined`, `import.meta.hot` in a build, `undefined`, `node.js:16979,17031`, `process.env.NODE_ENV`, `global.process.env.NODE_ENV` and `globalThis.process.env.NODE_ENV` with the value `process.env.NODE_ENV || config.mode`, only where `keepProcessEnv` is false (the client, a webworker SSR build, or set by the user; it defaults to true for other server consumers, `node.js:37117,16996,17009`) and never under `build.lib`, `:16962-16963`, with an SSR unit, and user `define` keys, `node.js:16960-17045`; `process.env.FOO` keeps its edge) | none: Rolldown drops it | written by hand per snapshot, one unit per define key; our edge stays (a superset, safe for X3) |
| `call` | none: X3 only (a free `require(…)` is also a bundler `require` edge, row above) | written by hand (`reach.json`, tag `call`); knip units: the S3 walk-set check |

- **Probe plugin.** The importer injects it through a temporary copy of the unit's config file
  (`input/**` is pinned by sha256), because SvelteKit starts the client build from the config file
  and an inline plugin would not be in it. Edges come from `buildEnd` module info (`importedIds`,
  `dynamicallyImportedIds`) per environment, compared on `(project, env, from, kind, target)`;
  Vite's alias runs before user plugins, so the probe never sees the source specifier and does
  not need it. Only edges that compile or Vite adds (the named Vite helpers, `svelte/internal/*`, the `svelte` runtime, vps's
  style id) are on an allow-list; any other unmatched edge is a mismatch, including edges that a
  plugin or preprocessor added. Positive controls: a unit with an alias (Vite runs
  its alias plugin before user plugins), and a SvelteKit unit that must show an edge with
  `env = client`.
- **Positive control for the query class:** a unit imports `./C.svelte` and `./C.svelte?raw`; a
  resolver that drops the code edge is red.
- **Edges from open modules** are not compared; they are listed separately. The set of open
  modules, each with its reason, is part of `edges.json` and compared as a set, so a parser
  regression that opens a module turns the gate red instead of removing its edges. The project's edge-uncertain state, with its reason, is
  in `edges.json` too; in such a unit, oracle edges we do not have are listed, not compared.
  Positive control: a unit with an auto-import plugin is red when the project is not marked
  edge-uncertain.
- `meta.json` records the names of the unit's Vite plugins and Svelte preprocessors. The list of
  those that never change the import set (P10) is versioned data and starts with
  vite-plugin-svelte's own plugins, SvelteKit's plugins and `vitePreprocess`. With `script` on,
  vps transforms the script with oxc and `onlyRemoveTypeImports: true` (vps `src/preprocess.js`):
  every value import stays, and `import { type A }` becomes a side-effect import (oxc-transform
  0.129.0, measured by a reviewer; Vite's bundled oxc is UNVERIFIED), which the X1 kind rule
  takes as input; a unit pins it. We do not classify an
  unknown plugin by its hooks: a JS plugin can change edges from almost any hook, through
  another plugin's `api`, or from a native (Rolldown) plugin with no JS hooks at all. The rule is:
  - The named list (versioned data) holds plugins and preprocessors known not to change the
    import set: vite-plugin-svelte's, SvelteKit's, rsvelte's own companion plugin (X2),
    `vitePreprocess`, and Vite's own core plugins. Vite's HTML plugin adds one edge no source
    shows (`vite/modulepreload-polyfill` from an HTML entry); a rule names it as a leaf, and it is
    on the probe allow-list.
  - A project is *edge-uncertain* (P10) when its user plugins (the pre, normal and post groups
    of every environment after `resolveConfig`, and the client plugins of the resolved
    `worker.plugins()` call; the probe goes into `worker.plugins` too) or its Svelte preprocessors include anything not on the list, or
    when user resolver code runs inside a core plugin: a non-empty `build.rolldownOptions.plugins`
    (or `rollupOptions`, also per environment) or an alias `customResolver`, or a PostCSS plugin set (`css.postcss`, or the config Vite
    finds, `resolvePostcssConfig`, Vite 8.3.1 `dist/node/chunks/node.js:30358-30390`) that is not
    empty and not on the named list (a plugin is named by its resolved package and version;
    the snapshot process (one `resolveConfig` per process, because `NODE_ENV` sticks once set,
    `node.js:37256-37262,6965`) reruns, after its `resolveConfig`, a pinned install of the
    loader Vite bundles but does not export (its `tsx`/`jiti` resolved from the project's
    `vite` folder, as Vite's bundled copy does, `node.js:6800-6825`)
    (`postcss-load-config` 6.0.1, `node.js:6787-6917`) as Vite calls it, `postcssrc({},
    searchPath, {stopDir})` with `searchPath` = a string `css.postcss` or `config.root`
    (`node.js:30370-30372`), because Vite keeps the result in a private cache
    (`node.js:29564`); any error other than "No PostCSS Config found" makes the project
    edge-uncertain; the loader returns plugin instances, so until a way to name an instance
    is measured the named list is empty and any non-empty set is edge-uncertain; units with a
    `.ts` config and with a root other than the working directory; under
    `css.transformer: 'lightningcss'` Vite runs no PostCSS, `node.js:30165`, and the check is
    skipped): Tailwind's `@plugin` and `@config` load local JS files
    from CSS, which our CSS leaf cannot see (knip's Tailwind compiler reads them,
    `src/plugins/tailwind/compiler.ts:4-17`); an own unit with `@tailwindcss/postcss` and an
    `@plugin` file is red unless the project is edge-uncertain. Less `@plugin` and Stylus `use()`
    also run JS files; knip misses them too, and they are listed with the shared false
    findings. For X3 (the CLI), the
    sets are the union over every snapshot (`resolveConfig` with `build` and with `serve`, for each Vite mode and `NODE_ENV` value
    (X1 "Projects and workspaces"); inside a build, X2's rule applies instead),
    because `apply` drops plugins per command and a config can differ per mode. A user
    may list a plugin in rsvelte's config as "adds no edges"; that is their claim, and the report
    names it.
  - No static read for these sets. A real project's sets come from `resolveConfig` (with the
    config file and `svelte.config` that Vite, vps and Kit really load); without it (the LSP
    never resolves configs for X3) the project is edge-uncertain, except a package with no Vite
    (X1 "Projects and workspaces"). A fixture whose config cannot run (knip's
    fixtures ship a stub `vite` and stub packages) has its sets written into `meta.json` by the
    importer, which reads names from the config's AST with the precedence of the pinned Kit
    (above, X3), ignoring the stub's own `version` (knip's Kit stubs say 1.0.0 or 1.11.0), and
    accepts the Kit 1.x import path `@sveltejs/kit/vite` for `vitePreprocess` that knip's fixtures use, and marks them "by
    name, stub dependencies". This is a fixture-only path: the CLI never takes it for a real project.
  - Listed plugins do not change one another, so no identity check is needed. Two preprocessors
    are listed. SvelteKit's `warning_preprocessor`, which `sveltekit()` always appends, counts
    only when its keys are a subset of `{script, markup}` and each function's source text equals
    the pinned Kit's. A preprocessor counts as `vitePreprocess` only when, after `resolveConfig`, its keys are a subset of
    `{name, script, style}`, its `style`, when present, carries vps's `__resolvedConfig` marker, and its
    `script` source text equals the pinned vps's (vps clones a single preprocessor object, so
    object identity would fail on correct projects); a name alone is not enough.
  - "Mode" here is Vite's: the default for each command, plus each mode `m` that has a
    `.env.m` or `.env.m.local` file in the resolved `envDir` (`.env.local` is not a mode). X3 claims hold for those modes, and the report names them.
  Controls: a `resolveId` plugin with a prop finding (both claims disappear); a
  `perEnvironmentPlugin`; a spread plugin array; `svelte({ preprocess: [x()] })`; an
  `apply: 'build'` plugin; a plugin in `build.rolldownOptions.plugins`; an alias
  `customResolver`; an inline object plugin; `{ ...vitePreprocess(), markup }`; a
  `configFile` that points to another `svelte.config`; a SvelteKit project with only listed
  plugins, `vitePreprocess`, Kit's `warning_preprocessor` and the companion keeps its closed
  components and claims.
- `meta.json` and the config snapshot also record each listed preprocessor's options (the kind
  rule needs `vitePreprocess`'s `script`). When an option is unknown, the affected edges count as
  both a bundler edge and a reach edge, as for a failed `UseSummary`.
- **Positive control for `project.build`:** the root-plus-`-c` unit (its stated working directory is not the app folder; it ships `.svelte-kit/tsconfig.json` (Kit 2; Kit 3 writes it to `node_modules/$app/tsconfig.json`, versioned data, so the unit's install must keep it, and Kit 3's separate service-worker tsconfig is not reachable through the root `references`, as X1 "Type edges" says) at the root) passes against its own snapshot, and turns red when the companion passes the app folder instead of `process.cwd()`; the two-Kit-apps workspace unit (working directory = app folder, not the workspace root) is in `project.build` too and turns red when the native side hashes `ModulePath` instead of the `rootDir`-relative filename. Both units have a component with a scoped `<style>` and a `<svelte:head>` (in production, the CSS hash, the head hash and warning filenames read `rootDir`; dev `$.FILENAME` too once the S7 variants exist; the `rootDir` variant has a warning case; the `project.build` warning compare adds `filename` (copy root replaced) to the per-file projection, so a wrong warning filename turns it red).
- **`project.types` does not cover `.svelte` targets:** our units ship an ambient `*.svelte`
  declaration, so TypeScript resolves `./C.svelte` to it.
- Our units ship real dependencies (from the lockfile) and a generated `.svelte-kit` when needed.
  knip's fixtures ship stub `node_modules` (no real `svelte` or `vite`), so only `project.unused`
  runs on them.

**Importing knip's fixtures.**
- Source: the knip repository at the tag of the oracle version (`knip@<version>`), with its sha in
  `meta.json`. A knip bump is one change that re-imports, regenerates and re-checks the adjusts.
- The oracle run is a pinned Node script that calls knip's `main()` with the test's exact
  options and the fixture's config (`include`, `exclude` and `rules` also turn issue types on or
  off), as knip's own tests do; not the CLI. Runs with `isFix` (it rewrites the input files) or
  `isSession` are not imported. Runs with `isUseTscFiles` are excluded and counted until we model
  it; `isStrict` and `isIncludeEntryExports` are options we implement (as knip, `isIncludeEntryExports` does not report the exports of a file added as an entry by a call edge, unless it is also an explicit entry). The test's assertions (counters and presence
  checks) run on that result, and a mismatch stops the import. The snapshot is the same run's
  issues, kept only for the gated types (`files`, `exports`, `types`, `nsExports`, `nsTypes`,
  `enumMembers`, `namespaceMembers`, `duplicates`) that the test's options turn on; dependency
  types are a separate variant (S4). Key details: `name` is built from knip's `issue.symbol`, with the `parentSymbol.` prefix
  only for `enumMembers` and `namespaceMembers` (there it is the export's own name,
  `analyze.ts:245`); for the four export kinds, knip's `parentSymbol` is the importer's
  namespace alias (`analyze.ts:284`, taken from the first importer knip walks), so it goes to
  `namespace?`, a field that is reported (ours picks the smallest importer module key, so it
  does not depend on walk order, P12) but neither part of the key nor compared (its value
  depends on knip's `importedBy` order, `has-strictly-ns-references.ts:20-43`); a `duplicates`
  name is the `|`-joined list, compared as a sorted set.
- Entries and project files: knip returns neither (its `--debug` dumps miss entries added while
  the graph is walked). A small pinned patch, right after `build()` returns in `run.ts` (the sets
  are final at the end of `build.ts`), writes `principal.entryPaths`, `principal.programPaths`,
  the files that skip export analysis, and `principal.projectPaths`, as sets; a second write
  just before `principal.walkAndAnalyze` gives the same sets before the walk. knip adds files
  during the walk (`import.meta.glob` targets, `require.resolve` and `import.meta.resolve`
  targets, workspace imports), which we model as `glob`, `call` and ordinary edges. "Added during the walk" is a diff per
  set: the `entryPaths` after the walk minus before, and the same for `programPaths` (a file
  already in `projectPaths` can still be added to `entryPaths`). The first patch also writes, after the walk, the files recorded at the end of `build.ts`'s `analyzeSourceFile` closure (X3 "Across projects"; not `analyzedFiles`, which is filled before analysis and so also holds files with no workspace and files whose analysis threw), and S3 compares them with our M_K importer set. A third patch wraps `pluginCtx` per registered plugin, and separately the context the Bun
  visitor gets from `ProjectPrincipal.ts:81`, and records `(containing file, plugin, payload)`;
  it records `(containing file, resolved path, cause)` where scripts and globs become entries or
  program paths (`graph/build.ts:546,555,558`) and where `entryFiles` (pino) are added
  (`build.ts:505-507`), with Bun, `calls.ts` and each visitor as separate causes, so visitor
  and glob causes have an importer. A second patch records each call
  edge flagged `IMPORT_FLAGS.ENTRY` with its importer, its call shape and its resolved path, at
  `get-imports-and-exports.ts:188` with the shape passed down from `calls.ts`. Only these are
  compared both ways in S3, and on our side only for JS and TS importers on which knip ran `analyzeFile`, recorded by the
  patch (other files are read only through `extractSpecifiers`, which reads `require.resolve`
  but never flags `ENTRY`, `follow-imports.ts:12-21`; that difference is listed) and
  targets that are not `External`; `require` targets (flag `NONE`, partly through
  `imports.ts`), `node <file>` entries (`graph/build.ts:537-546`) and our `.svelte` call edges are gated by
  `project.unused` and own units instead, and a difference has the adjust key
  `importer|shape|target`. Unknown roots are never "our call targets"; they are only matched against knip rows. A knip row whose call we made an unknown root counts as matched only when our unknown
  root carries the same resolved target (a `.sh` target that knip finds by its last
  `existsSync` step); an unknown root of the class "unresolved" against a knip row that
  resolved is red (positive control: break one call resolution in the port, and this check
  turns red). Records at that line without a `calls.ts` shape (env pragmas,
  `comments.ts:154`; pino transports) are left out and counted (the flag
  `IMPORT_FLAGS.ENTRY` is shared by several shapes, by `comments.ts:154` and by the pino
  visitor, so the shape is the cause); walk-added paths that do not exist (an optional
  `new URL` knip could not resolve, `get-imports-and-exports.ts:243-246`) are excluded and
  counted; a file with several causes keeps
  them all. Our entries are compared with the sets from before the walk, and the
  files added during the walk with our edge targets; our project files ∪ our entries with knip's full
  before-walk `projectPaths` (knip's `addEntryPath` also adds to it; knip keeps `.d.ts` files
  there, as entries). Files knip adds as entries during the walk
  (`file.imports.entryFiles`, script commands found in source files, entry-type import globs)
  are mapped to our `glob` edge where they come from `import.meta.glob`, to our `call` target where they come from a call shape or a ported visitor (S3 says how), and are otherwise excluded
  and counted. Positive control: a fixture whose entry comes only from
  a `package.json` script is in the entry set. Whether the lists are stable across runs is
  UNMEASURED.
- Selection, part 1 (Svelte): fixture projects that contain a `.svelte` file or depend on `svelte`, and need no CSS
  edges, meaning the oracle's analyzed set has no non-JS file other than `.svelte`. The importer
  prints the count, the excluded count with reasons, and the command.
- A test that is not a `main()` run is not imported; the importer lists it with the reason.
- A knip config written as code is evaluated once by `regen` and stored as JSON; our side reads
  the JSON. A config with a function value (at knip `99cac78`, untagged, six Svelte fixtures have a `compilers` function) is
  not JSON: the oracle then reflects that function, so the unit is imported only with an
  `[[adjust]]` entry per differing issue, each with that reason, or excluded and counted.
- Selection, part 2 (export logic): knip's export fixtures by name (`namespaces/module-register`,
  `resolution/url-import-meta-url`, `resolution/worker-path-join`,
  `plugin-config/child-process-exec`, `plugin-config/script-visitors-execa`, `plugin-config/script-visitors-zx`,
  `plugin-config/script-visitors-bun`, the nano-spawn and pino fixtures, which also run the S3 call-edge check; each one's claim
  state is `on` unless a claim-state adjust, created on the first S3 run and reviewed, names
  its reasons,
  `resolution/tsconfig-references-source-map`,
  `resolution/tsconfig-solution-references`, `resolution/subpath-imports-outdir`,
  `resolution/subpath-imports-to-dist`, `plugins/sveltejs-package`,
  `plugins/sveltejs-package2`, `exports`, `re-exports`,
  `namespaces`, `ignore-exports-used-in-file`, `language/jsdoc-exports`, `language/jsdoc`,
  `resolution/ambient-declaration-files`, `language/jsdoc-import-tag` (in S3 `language/jsdoc` gates only the claim state; its
  `unlisted` issues belong to S4), `tags-hints`,
  `e2e-lib-export-star-as`, `types/enum-members-enumerated`, the three
  `types/enum-members-element-access*` fixtures, `types/type-in-type`, `types/type-in-type-alias`,
  `types/type-in-value-export`, `types/typeof-in-type-alias`, `types/typeof-class-in-type-alias`,
  `namespaces/namespace-enumerated`,
  `language/custom-elements`, `imports/namespace-with-nsexports`, `types/enum-members`,
  `language/commonjs`, `language/commonjs-tsconfig`, `language/js-only`, `entry/exports-*`,
  `entry/include-entry-reexports`, `entry/public-enum-members`, `ignore/members`, every fixture
  under `re-exports/` and `ignore-exports-used-in-file/`, and the others the importer lists).
  Because the use model is ported whole, the selection is also by content, not by folder:
  every `main()` run whose test compares counters (`deepEqual` on `counters`, including
  `baseCounters` zeros) while its resolved `includedIssueTypes` (defaults included) has an export kind (`exports`,
  `nsExports`, `types`, `nsTypes`, `enumMembers`, `namespaceMembers`, `duplicates`) is selected, and the
  importer prints that population and how many of it are imported, adjusted and excluded
  (most plugin tests are expected to be excluded, each with a reason).
  The `e2e-lib-*` fixtures have no `main()` run (only `test/e2e/fix-tsc.test.ts:79-87`, which
  runs `--fix` and `tsc`), so the importer makes one oracle run per fixture with default
  options, no fix, no `tsc` build (with `dist/` present knip also reports `dist/*` files), and
  the `pkg` layout of `fix-tsc.test.ts:106-113` (the workspace root is `pkg`, as knip's `cwd`; the consumer stays outside `input/`), and checks that each name of
  `libFixtureRemovals` (`:90-102`) is in that run's issues and, as the e2e's `(removed)` check
  (`:128-129`), that every fixture has at least one issue; for the six fixtures the test comment names as false-finding
  checks (`fix-tsc.test.ts:61-73`), the names whose `export` the consumer or the emitted
  declarations need (`greet`, `Greeting`, `Utils`, …, written in `meta.json`) must not be in
  the issues. The full issue set is compared as usual. An own `.svelte` unit has
  `{#await import('./x.ts') then m}` (opaque). Part 1 alone asserts one export
  issue (reviewer counts at knip `99cac78`, an untagged main commit: 12 directories, 15 runs;
  after the exclusions, an estimate of 3 directories run with default options and no adjust),
  which cannot gate exports. The counts are recounted at the oracle tag on import. The importer
  prints these counts with the knip sha; S3 reports the remaining Svelte population before
  claiming Svelte coverage.
- A nested `.gitignore` in a knip fixture can hide its own files; the importer adds them with
  `git add -f`, then runs the `git ls-files` check.
- Repository license: ISC (GitHub API).

**Changes to `tools/fixtures`** (today every unit is one file):
- a `ProjectUnit` kind that is scanned under `fixtures/project/`, with `run(unit, files)`;
- a set compare that reports missing and extra keys (the `.json` compare is `JSON.stringify`
  equality today, `canonical.ts`);
- a set adjust, for `issues.json` and `edges.json` and also for the recorded entry and
  project-file sets (`{task, variant = <mode>, set = "entries" | "projectPaths", key = <module
  path>}`). An add and a remove of the same key, or a `replace` whose two keys are equal,
  are rejected when the file is read. Each entry gets the first state that holds, in this order;
  only `ok` is green:

  | # | State | Remove K (Add K is symmetric) |
  |---|---|---|
  | 1 | `stale` | the unit or its expected file is gone |
  | 2 | `redundant` | K is not in the snapshot (the oracle now agrees, as `redundant` means today) |
  | 3 | `fixed` | K is in our output, so it agrees with the snapshot at K and the entry is not needed (for Add K: K is not in our output); from S2/S3 only, when our output exists |
  | 4 | `ok` | otherwise |

  `replace` is a remove of the first key and an add of the second, and its state is the worse of
  the two. Before our output exists (S1), states 1, 2 and 4 apply, as `adjust.ts` does today.
  `line`/`col` are compared and reported but not gated until the non-ASCII control unit passes;
- no sha256 dedupe inside a project unit;
- inside `input/**`, no `~actual`/`~cache` renaming (`paths.ts`), because it would change import
  specifiers; a `.gitignore` negation keeps `actual/` and `cache/` there instead.

Every oracle version goes into `fixtures/_registry/oracles.json`, as today.

## 7. Order of work

Read-only consumers first; output-changing ones last. Every "done" row reports the tree
(`git rev-parse HEAD`), the oracle and its version, the population (units, and edges or issues),
the pass count, the adjust count per reason class (each class ratcheted), and an injected defect
that turned the gate red. An arm that cannot run (old rsvelte has no project tasks) is written
UNMEASURED.

| Step | What | Done when |
|---|---|---|
| S0 | Kernel base: `Portable` (marker and field check), its derive and CI check, `Arc<Document>`, `Output: Send`, per-step `catch_unwind` | The compile-fail tests fail to build and the CI check rejects the test crate (P8); an injected panic in one task keeps the document's other outputs; every per-file gate in `fixtures/svelte` and `fixtures/vue` has the same **set** of passing unit ids as the baseline tree (named in the row, with oracle versions) |
| S1 | `tools/fixtures` project units (§6) and the first units | The tool changes land; the importer reports imported, stopped and excluded knip units (with reasons), and an injected counter defect in one test's assertion stops `regen`; at least one own unit per edge kind except `type` (its expected edges need S2) and per environment |
| S2 | Parser (decides Q-P11); JS/TS, `.svelte.js/.ts` and HTML documents; Discover; `EdgeSyntax`, `ExportSummary`, `UseSummary`, edge kinds in Link; resolver (decides Q-P3); graph and export table; projects of a workspace | `project.graph` and `project.types` pass on every own unit, with the unit and edge counts written in this row before measuring; units include a type-only import and `import { type A }` in `.svelte` and `.ts`, with and without `verbatimModuleSyntax`, a refused caller, a `?raw` import, a `?worker&inline` import, a `.ts?inline` import, an unused value import in `.ts` with the flag off, a `.svelte.ts` value import used only as a type, a `.svelte` value import used only as a type, a free `require` and a `createRequire` `require` (only the first is a bundler edge), call edges by `.js` → `.ts`, with no extension and through `$lib` (their `reach.json` rows), a barrel, an `export *` cycle, an ambiguous name, two paths to one binding, a two-project workspace, a case-variant path; a `jsconfig.json` project and a project with no config; TS forms `import x = require()`, `declare module './x'` and
  `import('./x')` type nodes; a two-project unit with a shared `.svelte` file whose old type check runs once per program, with an injected panic in one program's check that leaves the other's output; the P12 thread test passes |
| S3 | Config snapshot (resolved every run; its cost reported per project) and entry rules (decides Q-P6); unused files and exports, both modes; the tsgo type-edge run on knip units (without it, units that expect a `types` issue fail) | `project.unused` passes on every imported unit and every own unit; the units whose tsconfig sets `baseUrl` (TS5102 under TypeScript 7) are printed with how many stop for it; our M_K analyzed files (excluding files that depend on U) ⊆ knip's `analyzedFiles` recorded at the end of the analysis closure (with a workspace; "Across projects") ⊆ M_K ∪ U ∪ the files that depend on U, on every imported unit; knip units that need CSS edges are excluded and counted; on every imported unit, in each mode variant, our entry set equals knip's recorded entry set for that mode and our project files equal knip's recorded project paths, as sets (both as defined in §6) (a difference is a failure or a reasoned adjust); on every own unit, run with the entries in `meta.json` withheld, every module Vite reached that matches the unit's project-file globs is reachable from our entries, and the count left out (generated files, `node_modules`, virtual ids) is printed; `project.unused-own` passes, with units for a call edge whose target imports a second file (that file is used), a `.mjs` entry that imports `register` from `node:module` and calls `register('./loader.js', import.meta.url)` with only `loader.ts` present (read and walked), `const require = createRequire(import.meta.url); const { a } = require('./lib.cjs')` (not a bundler edge, but `a` is used, as knip's `imports.ts:73-137`), an `execSync('node scripts/gen.js')` call (`gen.js` is an entry), a `spawn('git', ['status'])` call (claims stay `on`), and a refused file that calls `import.meta.resolve` (its target is still used); on every imported unit, each file knip added during the walk (per-set diff, §6) with the cause `import.meta.glob`, a call shape or a ported visitor is a target of our matching edge from the same importer, a file added by a ported visitor whose script is an unknown root on our side matches when our run has an unknown root of that visitor from the same importer (counted), a file added by an unported visitor is red unless our run stopped claims with that visitor as the reason, and the other causes are counted; the number of checked files is printed per unit and is above 0 on `resolution/subpath-imports-to-dist`, `resolution/tsconfig-references-source-map` and the call-edge and visitor fixtures of Selection part 2 (`namespaces/module-register`, `resolution/url-import-meta-url`, `resolution/worker-path-join`, `plugin-config/child-process-exec`, `plugin-config/script-visitors-execa`, `plugin-config/script-visitors-zx`, `plugin-config/script-visitors-bun`, and the pino fixture; the nano-spawn fixture adds no file, so an own nano-spawn unit stands in); positive control: recording every cause as "other" turns this red; and, both ways, our call targets per (importer, shape) equal knip's recorded call edges (§6 second patch), so a shape we accept and knip does not is red even when the unit's claims are `stopped` (positive control: giving one call edge a wrong importer turns this check red while `project.unused` stays green) |
| S4 | Svelte findings; then unused and unlisted dependencies with tool rules | `project.svelte-unused` passes; each finding kind has a positive and a negative unit; the dependency variant of `project.unused` passes on every imported unit |
| S5 | `SpecArtifact`, barrier (re-parse until Q-P1), slices, `Portable` encoding and digest (cost measured); cross-file lint (`bind:` to a non-bindable prop, a prop that does not exist). When a cross-file rule is selected, `svelte.lint` runs in Specialize and merges its diagnostics | Expected diagnostics written by hand (no oracle), at least one positive and one negative own unit per rule; per-file lint diagnostics are byte-identical whether lint runs in Discover or Specialize; two runs: a callee signature edit changes the slice digest and the caller's diagnostic, and a body-only edit changes neither |
| S6 | `Optimized` as a second `CompileInput` producer; `analyze` takes `Analyzed`'s `scoped` flags as an input | BLOCKED with S8 (it serves only X4). With the identity rewrite, every unit's client and server output is byte-identical to the X4-off output; Q-P8 cost within a bound written here before measuring |
| S7 | Before: `client-runes-absent` and `server-runes-absent` variants (whole output); the mixed native/official hydration units with their DOM harness (X2 "Per-file fallback"), red on an injected wrong marker and on an injected wrong attribute in the native server output (both caught by the server-HTML compare), and, for the server-only fallback unit, red on a native client defect that changes how hydration walks the DOM (a removed comment marker the client expects, which must end in `hydration_failed`) and on an element defect (caught by the DOM compare); all six inactive-control units of X2, each named with its exact `inactive(reason)` and gated in "Done when", a per-variant set of unit ids that ran natively, gated like the passing ids of S0, with a control that forces `Legacy`; controls for the three other inactive reasons (probe differs, probe throws, two `vite-plugin-svelte:config`), and a unit for the double `dynamicCompileOptions` call; `client-dev`, `client-hmr` (input with vps's `' *{}'` style injection) and `server-dev` variants of the per-file compile gate; input-sourcemap variants (an identity map, a `vitePreprocess` map) and a `rootDir` variant; a per-file source-map artifact, compared by a mapping-quality measure with a bound written in this row before measuring (today the gate stores js, css, warnings and error only). Then the companion plugin (X2), runtime check, per-file fallback, transfer without JSON; a provisional parallelism mode chosen on own units by a rule written in this row before measuring (async with our own bounded pool, sized from Rolldown's pool, unless the sync arm is better on both absolute JS-thread busy time and wall time by a margin written before measuring); the chosen mode and pool size are reported in the done row; no warm cache until Q-P2 is decided (§9) | `project.build` passes on every own unit, with the native-compile count in each unit's report equal to its declared count (error units pass by their native-error-then-official-error rule instead); the wrong-order, `await`, allow-list, runtime-check and `rootDir` controls red under their injected defect; the companion's differential test passes; the per-file compile gate passes through the shipped wrapper, not the raw `.node`; boundary cost per call reported; whether a fresh resolution of the pinned svelte on a stated date matches the pinned closure versions (X2 "Runtime check") is reported with that date, UNMEASURED until then. Vite build time, HMR p50/p99 (three arms, ABBA) are reported on own units and stay UNMEASURED for application-size projects until §9 decides their source; they do not block S7 |
| S8 | Opt-in `Optimize` (decides Q-P7); build guard | BLOCKED until a minimum gain is written here, before Q-P5 is measured. Then oracles (a)–(c), the byte-identity test and the guard pass on project units |

Not planned yet: the persistent cache and incremental Link for the LSP.

## 8. Open questions, decided by measurement

| # | Question | Candidates | How to decide |
|---|---|---|---|
| Q-P1 | Trees across the barrier | Keep arenas / re-parse the kept text / keep only files with a non-Unknown slice | Wall time, live heap peak (text and trees), pool reuse, per-phase allocation attribution |
| Q-P2 | Parallelism in the plugin | Sync NAPI / async NAPI with our own bounded pool / warm cache at `buildStart` | JS-thread share left after the async arm; CPU oversubscription next to Rolldown's pool; production build time, three arms, ABBA; for the warm cache also the hit rate with and without `vitePreprocess` and the memory held (in SvelteKit, through the whole server build) |
| Q-P3 | Resolver | `oxc_resolver` / our own | Must support `package.json` `imports` (Kit 3's `#lib` replaces `$lib`, and its generated `paths` copy `imports`, `write_tsconfig/index.js:244-248`; a Kit 3 unit). Edge agreement with both oracles; time per resolve; whether `stat` on rayon workers blocks |
| Q-P4 | Summary stability | Summary shapes | Replay commit histories; share of edits that keep the summary digest |
| Q-P5 | Which rewrites pay | Rows of the X4 table | 1) share of projects with no open module, no unbounded `import(x)`, and no `vitePreprocess` (which rewrites every `<style>`, so the guard would always fail); 2) share of closed components; 3) sites in closed components; 4) bytes and runtime per site, measured on the oracle (b) pairs |
| Q-P6 | Entry points and tool rules | Static config reading / `resolveConfig` / knip's plugin layer (ISC) | Deciding: false "unused" findings against `project.unused-own` (knip-entry equality favors knip's layer by construction, so it is a check, not the deciding number); cost per project; known gap: knip resolves through vitest `test.alias` too (`plugins/vitest/index.ts:160-196`), so a mock reached only that way is a false finding until a tool rule exists; knip also reads `test.alias`, `resolve.alias` and plugins from a separate `vitest.config.*` (`plugins/vitest/index.ts:193,196`), which our plugin rule does not read; a vitest-only alias gives `Unresolved` (fails closed), but one that overrides a key Vite also resolves gives a false finding knip does not share, listed as ours; vitest's mode `test` and `NODE_ENV=test` configs are not snapshotted, a gap knip shares (it calls the config with development and production only, `vitest/index.ts:104-107`); the share of projects that TS 7's removed options (TS5102, TS5108, TS5023) stop is measured with Q-P12 |
| Q-P7 | Output of `Optimize` | New trees for every file / only for files with a rewrite | Copy cost; share of files with a rewrite |
| Q-P8 | Cost of a second `CompileInput` per optimized file | Rebuild the whole input / share untouched HIR subtrees | Compile time and allocations per optimized file, X4 on with the identity rewrite against X4 off, same corpus |
| Q-P9 | Cross-file facts in bundled dev | No / yes | Only after S8; HMR p50/p99 |
| Q-P10 | Parse coverage for X3 | A recovering parse that still yields edges / the full parse only | Share of projects with no open module, per parser build. UNMEASURED until application-size projects exist (§9) |
| Q-P11 | The JS/TS parser for module documents and for scripts and expressions inside `.svelte` (full JS and TS: `import()`, `import.meta`, classes, all `export` forms); one parser for both, or say why two | Extend `rsv_js` / oxc behind the C10 adapter | The `js.parse` gate of concept C10; parse time and allocations on the same input |
| Q-P12 | Scope of a stop | An open module or unknown root anywhere in the run stops every X3 claim (today) / only one that our walk reaches from an entry stops claims (an unreached file never runs, so its edges cannot make a file used; unreached files are not walked by knip either, but knip can make a file an entry that we do not model, so "knip compiler files" stay open in every candidate) / a server-side template `new URL` stops file claims only (on the server it computes a URL and loads no code) | Share of knip units and own units whose claims go from `stopped` to `on` (for example knip's `language/jsdoc-exports` and `tags-hints`, which have static edges to unresolved files); false findings on own units with an unreached open module as a control |

## 9. Decisions (2026-10-01)

| # | Question | Decision |
|---|---|---|
| D1 | Project fixtures | No copies of whole application repos. Copy knip's fixture projects and add our own small projects. This project is not a port: a difference from knip is an adjustment with a reason |
| D2 | Scope of X4 | Opt-in, off by default, turned on per project. Built only after Q-P5 shows the gain written in S8 |

Open: Q-P1, Q-P2, Q-P4, Q-P5, Q-P10 and the speed claims in S7 need application-size projects.
Where these projects come from is not decided.
