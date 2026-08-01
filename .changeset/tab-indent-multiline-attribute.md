---
"@rsvelte/fmt": patch
---

fix(fmt): re-indent multi-line attribute values correctly under `useTabs`. A multi-line attribute value (an arrow handler, a `bind:` getter/setter pair, an object literal) is formatted at column 0 and re-indented to the attribute column afterwards, but the re-indent treated every line starting with a tab as verbatim raw HTML text. That holds only while the embedded JS is space-indented — with `useTabs: true` the formatted JS is tab-indented too, so the value's continuation lines were left at column 0 and the closing `}}` lost the element's nesting depth entirely. The raw-text boundary is now the value's `{…}` brace depth instead of a leading tab, which also stops a tab-indented template literal from being mistaken for raw text.
