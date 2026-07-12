---
"@rsvelte/fmt": patch
---

fix(fmt): stop `<style>` dedent panicking on Unicode-whitespace indent and guard collapse against overlapping edits

Two formatter robustness fixes:

- **`<style>` dedent panic on non-ASCII leading whitespace.** `dedent` measured
  each line's indentation as `line.len() - line.trim_start().len()`, but
  `str::trim_start` strips multi-byte Unicode whitespace (e.g. U+00A0), so the
  common-indent offset could land in the middle of a code point and
  `line[min_indent..]` panicked. Indentation is now counted as leading ASCII
  space/tab only (always a char boundary), with a `get(..)` fallback.
- **Collapse whole-element open-tag break corrupted nested edits.**
  `collect_break_inline_open_tag` pushed a whole-element edit (rewriting the tag
  *and* its children in one span) and then still recursed into the children,
  whose edits applied against now-stale offsets inside that span — corrupting the
  output or panicking `apply_edits`. Recursion is now skipped after a
  whole-element edit, and `apply_edits` drops any edit that overlaps an
  already-applied one as a safety net.
