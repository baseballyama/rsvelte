---
"@rsvelte/compiler": patch
---

Stop rejecting five constructs upstream compiles

Compiling open-webui v0.11.0 (650 components) and Huly Platform v0.7.426 (2,462)
failed on nine files that `svelte.compile` accepts:

- **`catch (err) { err = … }`** reported `constant_assignment`. The catch
  parameter was declared `const`; upstream's `scope.js` declares it `let`.
- **`const { $from } = state.selection`** reported
  `store_invalid_scoped_subscription` when some other scope happened to declare
  a `from`. The `$`-name is a declaration, but the scan that decides which
  `$name`s are store reads only recognised `let`/`const`/`var $x` written
  directly, not a destructuring pattern. The same shorthand inside an object
  *literal* is still a store read — the two are told apart by what precedes the
  pattern's opening bracket.
- **`import { $comparedDocument as compareTo }`** reported
  `global_reference_invalid`. The imported name is not a reference at all.
- **`export let state` alongside `$state.room = v`** reported
  `legacy_export_invalid`. `$state` there is a store read, not the rune, and
  upstream removes such names before it decides runes mode — but the scan that
  collects locally declared names missed `export let`, declarators with no
  initialiser, and TypeScript annotations, so all three of `export let state`,
  `let state;` and `let state: T` left `$state` looking like a rune.
- **`(a?: string, b: string) => b`** and 14 other TypeScript grammar rules were
  raised as `js_parse_error`. Upstream parses `lang="ts"` with
  `acorn-typescript`, which does not run TypeScript's grammar checks; OXC does.
  Each suppressed rule was confirmed against `svelte.compile`, and the TS rules
  acorn-typescript *does* implement (1049, 1096, 1098, 1257, 1276, 2452, …) still
  fail, as does TypeScript syntax in a plain `<script>`.

Both corpora now compile for client and server everywhere upstream does.
