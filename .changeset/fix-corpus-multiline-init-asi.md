---
"@rsvelte/compiler": patch
---

fix(compiler): don't truncate a multi-line initializer whose continuation starts with `(`/`[`/backtick

A legacy state declaration whose initializer continues on the next line starting
with `(` was wrapped incorrectly:

```svelte
<script>
  let shownCalendar =
    (range && value != null ? value.start : value) || new Date();
</script>
```

produced `let shownCalendar = $.mutable_source()(range … ) || new Date()` — an
empty `$.mutable_source()` followed by the un-wrapped initializer — instead of
`$.mutable_source((range … ) || new Date())`.

`find_statement_end_client` treated the newline after `=` as a statement end
because the next non-whitespace char (`(`) was not in its continuation set, so the
extracted initializer was empty. Per JavaScript ASI, a line break followed by `(`,
`[`, or a backtick continues the previous expression (`foo\n(bar)` is `foo(bar)`,
`a\n[i]` is `a[i]`). Add those to the continuation set. Clears
`attractions/.../date-picker/date-picker.svelte` (40 → 39).
