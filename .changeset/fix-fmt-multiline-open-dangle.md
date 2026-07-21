---
"@rsvelte/fmt": patch
---

fix(formatter): dangle close brackets for wrapped open tags

Two prettier-parity mechanisms for elements whose open tag goes multi-line:

- A `<pre>` child (e.g. `<pre><code class={…}>`) whose open tag breaks now
  dangles its closing tag's `>` onto its own line, mirroring prettier's
  whitespace-sensitive close handling. This also covers the common
  highlighted-code-block shape (`<pre><code>{@html …}</code></pre>`).
- An empty `<textarea>` whose glued last line (`{indent}{last attr}></textarea>`)
  overflows the print width now dangles the open tag's `>`. The rule is
  width-driven, not categorical — a short empty `<textarea>` stays glued, and
  `<pre>` (a block element, which prettier never hugs) is untouched. The
  boundary was pinned with a 40–76 column sweep against the oracle.
