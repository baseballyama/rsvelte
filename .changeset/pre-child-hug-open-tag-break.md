---
"@rsvelte/fmt": patch
---

Break the hugged open tag of an attribute-free child element inside `<pre>` /
`<textarea>` when its content spans multiple lines, matching prettier. For
`<pre><code><span>a</span>\n…</code></pre>` the oracle drops the `>` of `<code>`
onto its own line (`<pre><code\n    ><span>a</span>`) because the first child is
leading-space-sensitive and borrows the parent's `>`; rsvelte only did this for
child tags that had attributes, so any attribute-free `<code>` stayed glued. The
break is still skipped when the content starts with whitespace or the child is a
block-display element — neither borrows the `>`.
