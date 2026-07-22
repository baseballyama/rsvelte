---
"@rsvelte/fmt": minor
---

feat(fmt): honor sortTailwindcss.functions in the native Svelte path

`sortTailwindcss` previously sorted only fully static `class` attribute values.
The oxfmt option `sortTailwindcss.functions` — sorting the class strings passed
to wrapper calls like `cn(...)` / `cva(...)` / `clsx(...)` — was ignored inside
`.svelte` files.

rsvelte-fmt now mirrors oxfmt's `.svelte` pipeline (verified byte-for-byte
against `oxfmt` + `prettier-plugin-tailwindcss`):

- **`<script>` bodies**: string and substitution-free template-literal arguments
  of a call whose callee is a bare identifier listed in `functions` are sorted.
  The descent stops at a nested call, so `cn(a, notcn("…"))` sorts only `a`; a
  nested call is sorted only when its own callee matches. Object keys, arrays,
  and nested plain containers inside a matched call are sorted.
- **`class={…}` mustaches** (and any configured `attributes`): every class
  literal in the expression is sorted, regardless of an enclosing call — matching
  the plugin's `transformSvelte`, which is not function-gated. `class:` directives
  and standalone `{expr}` mustaches are left untouched.

Sorting routes through the same class sorter as static attributes, so the native
(zero-config) and Node-sidecar (custom-config) paths both apply. The default path
stays untouched when `functions` is unset, and the fmt-parity corpus gate (sort
off) is unaffected. Substitution-bearing template literals and mixed
static-plus-`{expr}` class values remain out of scope.
