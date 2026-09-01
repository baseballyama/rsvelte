---
'@rsvelte/compiler': patch
---

Scope a `{#snippet}`'s body from the ancestors of every place the snippet is
used, not only from its `{@render}` tags. Upstream's `analysis.snippet_renderers`
holds a component alongside each render tag, so a snippet handed to a component
as a prop still has that component's position as one of its sites; rsvelte
collected only the render tags, so an element in such a snippet was scoped as if
it had no ancestor and lost its scope class
