# `2060-const-shadow-textcontent.svelte`

**Issue:** [#2060](https://github.com/baseballyama/rsvelte/issues/2060)

A `{@const}` **shadowing** a component-scope binding must resolve to the `{@const}`, so the read stays a static `textContent` assignment
