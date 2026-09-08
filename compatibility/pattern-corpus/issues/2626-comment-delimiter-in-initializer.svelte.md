# `2626-comment-delimiter-in-initializer.svelte`

**Issue:** [#2626](https://github.com/baseballyama/rsvelte/issues/2626)

A `//` comment carrying a statement delimiter, inside a multi-line initializer whose value continues on the next line. The initializer scan counted the `;`, `)` and `}` spelled **inside the comment** and decided the declaration ended there. All three delimiters are in one file because the scan tracks each separately, so a single-delimiter repro reads as fixed when only that one was hardened
