---
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

fix(svelte2tsx): infer a generic component's `T` into its `T`-dependent prop params (#923). A runes-mode generic component (`<script generics="T">` + `$props()`) was lowered with `__sveltets_2_fn_component($$render())`, which discards `T` — `$$render()` is called without `<T>` and the component type alias (`type C<T> = ReturnType<typeof C>`) never consumes its own `<T>`. So `T` could not be inferred at the call site, and sibling props whose types depend on it — callback props `(row: T) => …` and snippet props `Snippet<[{ row: T }]>` — collapsed to `unknown` ("'row' is of type 'unknown'"). This was the dominant remaining `--tsgo` blocker on real generic table/list components. rsvelte now emits the upstream `__sveltets_Render<T>` + `$$IsomorphicComponent` shape (byte-identical to svelte2tsx) for runes generics, whose generic constructor / call signatures let TypeScript infer `T` from the supplied props and flow it into every `T`-dependent prop parameter. The previous `#801` fix (making `Foo<X>` a valid generic *reference*) is preserved by the new shape's `type Foo<T> = InstanceType<typeof Foo<T>>` alias.
