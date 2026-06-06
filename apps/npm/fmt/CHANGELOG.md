# @rsvelte/fmt

## 0.1.1

### Patch Changes

- 6994f59: fix(fmt): preserve markup after a `<script>` block and stop the self-closing close-tag panic (#669)

  A self-closing / void element (`<span />`, `<path />`) after a leading
  `<script>` block was corrupted: the close-tag detector scanned backward for any
  `</` and matched the preceding `</script>`, emitting a bogus edit over the
  script-close plus the markup in between. One such element silently dropped the
  markup (exit 0); two or more siblings produced overlapping edits that panicked
  with a slice out-of-bounds.

  `find_close_tag_span` is now strict — the close tag must be the text immediately
  ending at the element (`<`, `/`, tag name, optional whitespace, `>`) — so
  self-closing/void elements yield no edit while genuine `</tag>` close tags still
  normalize. The Node CLI wrapper also now propagates native signal terminations
  (e.g. SIGABRT from a panic) as a non-zero exit instead of reporting exit 0.
