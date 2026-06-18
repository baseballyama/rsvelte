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
- Component-prop template-literal interpolations that statically evaluate to a
  defined string are interpolated raw instead of wrapped in `$.stringify(…)`,
  matching upstream `build_attribute_value`.
- TypeScript field modifiers (`readonly`, `public`, …) are stripped when lowering
  public `$derived`/`$derived.by` class fields, so `readonly x = $derived.by(…)`
  lowers to the correct `get x()/set x($$value)` accessor pair.
- `transform_class_fields_server` recurses across all classes in a module instead
  of bailing out at the first class without rune fields (which silently skipped
  later classes' field lowering).
- `bind:this` is excluded from `<svelte:element>` server spread attributes, and a
  dynamic `class` value in a spread object is wrapped in `$.clsx(…)`.
- Multi-line template-literal interiors in transformed `<script>` blocks are no
  longer re-indented (their content is part of the string value).
- `bind:prop={() => get, set}` (SequenceExpression) bindings keep their source
  position relative to `{...spread}` in `$.spread_props([…])`, and their get/set
  accessors reference the hoisted `bind_get()`/`bind_set($$value)` variables.
- Event-handler attributes (`onclick={…}` etc.) are excluded from `<svelte:element>`
  server spread attributes.
- A `{#snippet}` body — and a component's inline `children`/default-slot whose
  sole child is a standalone component/render-tag — no longer emits a trailing
  `<!---->` marker.
- A typed `$props()` destructure with an object/intersection TS annotation
  (`{ a, ...rest }: Base & { … }`) strips the annotation correctly instead of
  leaking it into the rest element (which dropped user-written `$$slots`/`$$events`).
- A multi-line `$props()` destructure with an interior `// line comment` no longer
  collapses into unparseable output (the comment swallowing the next property).
- `const id = $.props_id($$renderer)` is hoisted to the top of the component body,
  matching upstream's `body.unshift(...)`.
- Template-literal lines that resemble imports are no longer hoisted by the
  line-based import scanner, and template-literal interiors are preserved verbatim
  when re-indenting nested dynamic-component calls (no spurious tabs in HTML).
- A method chain split across lines by `//` comments no longer gets a spurious
  `;` inserted mid-chain (which orphaned the continuation and broke parsing).
