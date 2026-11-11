# `whitespace-body-inline-element-breaks-before-close.svelte`

**Issue:** [#4912](https://github.com/baseballyama/rsvelte/pull/4912), found by the `svar-core` submodule bump, `apps/widget/src/components/Segmented.svelte`.

prettier-plugin-svelte prints an inline element whose body is only whitespace as `group([...openingTag, '>', line, '</tag>'])`. When the open tag fits but `<tag …> </tag>` does not, that `line` breaks and the close tag drops to the indent of the line the element starts on. `try_collapse` always printed the one-space form. The file holds the reported shape (an open tag that only fits once its multi-line attribute value is flattened), an element one column over the width beside one that fits exactly, and the element mid-line after text, where the close tag takes the line's indent rather than the element's column.
