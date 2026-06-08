---
"@rsvelte/fmt": patch
---

fix(fmt): break the braces of a multi-line Svelte 5 function binding and drop its outer parens (#795 sub-case b). A function binding `bind:value={getter, setter}` parses as a top-level sequence expression, so it previously went through the generic mustache-sequence path that re-adds the outer parens (`bind:value={(getter, setter)}`, kept for `{(a, b)}` content — #799) and hugged the braces on one line. prettier-plugin-svelte instead prints a function binding *without* the parens and, when the members don't fit on the attribute line (or a member is itself multi-line, e.g. a block-bodied setter), breaks the `{` / `}` onto their own lines with each member indented one level:

```svelte
<TextInput
  bind:value={
    () => model.x ?? '',
    (value) => {
      model.x = value;
    }
  }
/>
```

A new `format_function_binding` in `crate::expression` detects the top-level sequence on a `bind:` directive, formats each member individually (so no outer parens), and either keeps the binding inline (`bind:value={a, b}`) when it fits or emits the broken-brace shape, which the existing open-tag `render_multi_line` reindent then pushes out to the attribute column. Closes #795.
