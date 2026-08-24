---
"@rsvelte/fmt": patch
---

The formatter no longer breaks an expression that fits inside a mustache glued to a preceding tag. The width a glued tag charged for what precedes it was measured from the start of the SOURCE line, which is the output column only when the input is already formatted — on a one-liner it counted the whole open tag even though that tag wraps and the content restarts at the element indent, leaving `{Bbbbbbbbbbbbbbbbb.ccccccccccc.length}` 21 columns instead of 45 and splitting a member chain the oracle keeps flat. The measurement now starts at the last `>` before the tag.
