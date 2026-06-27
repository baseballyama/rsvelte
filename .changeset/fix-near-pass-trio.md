---
"@rsvelte/compiler": patch
---

fix(transform): three near-miss codegen fixes (template indent, use: SSR, each index)

- The fast-path JS re-indenter tracked template-literal state with a `bool`,
  which desynced across a multi-line `${ … }` interpolation and mis-indented the
  continuation lines of a later template literal's string content. It now uses the
  full template/interpolation stack (matching the slow path).
- A `use:` directive on a load/error element (`<track>`/`<img>`/…) in the
  non-spread SSR attribute path now re-captures `onload`/`onerror` (the spread
  path already did).
- The typed `AssignmentExpression` path now sets `uses_index` on the owning each
  block when an each-item identifier is assigned/mutated (e.g. an event handler
  mutating an outer item), so the `$$index` callback parameter is emitted — the
  JSON path already did this.
