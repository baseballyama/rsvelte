---
"@rsvelte/compiler": patch
---
Make several SSR (server) code-generation paths byte-faithful to the official
compiler / esrap, burning down the output-equality corpus:

- The `rsvelte_esrap` printer now flushes per-property leading comments in
  object **patterns** (and their rest element), mirroring esrap's `_` wildcard.
  A `// line` comment inside a `$props()` destructure no longer prints on a
  single line where it would swallow the following token (`tabindex = // c 0`).
- `escape_js_string` emits tab characters literally instead of as `\t`, matching
  esrap's `quote()` — multi-line `class="…"` values keep their source tabs.
- `transform_class_fields_server` no longer mangles JSDoc / block comments in the
  class body of `.svelte.(js|ts)` server modules (it was appending `;` to every
  comment line and joining `*/` to the following method).
