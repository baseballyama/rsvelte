# `script-data-lang-ts-strips.svelte`

**Issue:** [#4881](https://github.com/baseballyama/rsvelte/pull/4881)

Upstream's `regex_lang_attribute` matches the `lang=` inside `data-lang="ts"`, so the parser reads the component as TypeScript and `compile` strips it on `parsed.metadata.ts`. rsvelte parsed it as TypeScript too but decided whether to strip by looking for a `lang` attribute on the top-level scripts, so the `interface` and the `: Item` annotation were emitted into the JavaScript output. The strip decision now reads the parser's own flag (`Root::ts`). A `<script lang="ts">` nested in the markup, or one written inside a string in the instance script, turns the flag on in the same way; those shapes are pinned by `typescript_is_stripped_on_the_parser_decision_not_the_script_lang` in `crates/rsvelte_core/src/compiler/mod.rs`.
