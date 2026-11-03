---
"@rsvelte/fmt": patch
"@rsvelte/language-server": patch
---

fix(fmt): a quoted `style:` directive value now prints its text the way prettier-plugin-svelte does, as a `fill` of its words: whitespace runs (including a line break inside the text) collapse to one space that breaks at the print width, and a line break at the edge of a text chunk becomes a line break at the attribute indent. Regular attributes and `style:` directives inside `<pre>` / `<textarea>` keep their text verbatim.
