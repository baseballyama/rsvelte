---
"@rsvelte/fmt": patch
---

fix(fmt): don't force a JSX-disambiguation comma on a single arrow type parameter in `<script>`

`<script lang="ts">` bodies were formatted with `SourceType::ts()`, whose
`extension` field is `None`. oxc_formatter forces a trailing
JSX-disambiguation comma on a single arrow-function type parameter
(`const f = <T>(…) => …` → `<T,>`) for every source whose extension is not
`.ts` (i.e. `.tsx`/`.mts`/`.cts`/unknown), so the `None` extension triggered the
comma. oxfmt formats embedded `.svelte` scripts as `.ts` and emits `<T>`.

Parse `<script>` bodies with `SourceType::from_extension("ts")` (extension
`Some(Ts)`, otherwise identical to `SourceType::ts()`) so the formatter sees a
`.ts` extension and leaves `<T>` as `<T>`. The only output-affecting use of
`source_type.extension()` in oxc_formatter is this arrow type-parameter comma.

Burns down the fmt-parity corpus by 1 (74 known failures; svelte-splitpanes
Splitpanes.svelte).
