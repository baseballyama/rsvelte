# `hoisted-import-leading-comment.svelte`

**Issue:** corpus residue

An instance-script `import` is hoisted to module scope and its leading comments are not: upstream removes the node and lets esrap's cursor flush them from the enclosing body, so they land on the next located node INSIDE the component function. The SSR assembly placed the region on the hoisted import, which carried the comments out of the function and dropped them — under a `script.rs` comment saying that replaying them in place would put them in the wrong function. The shape after the import decides the placement, not this rule, so the file carries a split declaration (comment after the keyword) and the `// Props` control that already worked.
