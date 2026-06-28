---
"@rsvelte/compiler": patch
---

fix(compiler): don't drop `import`/`export` lines inside multi-line template literals

The legacy text-based instance-script transform walks the script line by line,
skipping lines that begin with `import `, `export { … }`, or a `$props.id()`
declaration (they are hoisted / handled elsewhere). That skip fired
unconditionally — even when the line actually lived *inside* a multi-line
template literal being accumulated, e.g. a code-sample string:

```js
const code = `<script>
  import { LayerCake, Svg } from 'layercake';
</script>`;
```

The `import …` line was silently dropped from the emitted template literal,
corrupting the string. (The line-by-line `$`-token heuristic routed these
scripts into the text transform because `${…}` interpolations contain `$`.)

Gate the three statement-boundary skips on `accumulated_lines.is_empty()`, which
is true only at a clean statement boundary (the accumulator is cleared on
completion), so lines inside a mid-statement template literal are preserved
verbatim. Shrinks `compat/corpus/known-failures.json` by 3 entries (59 → 56),
including the large `flowbite-svelte/.../builder/badge/+page.svelte` divergence.
