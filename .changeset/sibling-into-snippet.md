---
"@rsvelte/compiler": patch
---

Leave a `{#snippet}` body through its render sites when walking siblings, as the official compiler does. The walk used to stop at the snippet, so every element inside one had no siblings at all and a component-wide flag then made every sibling selector unprunable. `.b + .x` with `.x` inside a snippet rendered under `.b` is a descendant and is now pruned, while `.c + .y` across a `{@render}` is matched. The walk also reports per element whether it stopped at something it could not enumerate, instead of the whole component being deoptimized by one snippet.
