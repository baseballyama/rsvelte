---
"@rsvelte/fmt": patch
"@rsvelte/language-server": patch
---

fmt: keep a `<pre>`'s attributes flat when its content offers the first break

A `<pre>` whose one-line form overflowed had its attributes wrapped one per
line where prettier keeps `<pre class="…">` on one line and breaks inside the
content — at a mustache's member chain or call, at a child `<code>`'s hugged
`>`, or at a child component's attributes. prettier's `fits` runs past the open
tag to the content's first line-break opportunity, and only a content with no
opportunity at all (a bare identifier, a long first text line) wraps the
attributes.

The formatter now measures that prefix, and lays the content line's mustaches
out left to right the way prettier's printer does: a mustache breaks when its
flat form plus everything up to the next opportunity overflows, its first line
is charged the open tag before it and its last line the `}</pre>` after it, and
its continuation lines sit one level inside the element.
