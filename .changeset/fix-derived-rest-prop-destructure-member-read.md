---
"@rsvelte/compiler": patch
---

fix(transform): destructuring `$derived(props)` of a rest binding reads members from `$$props`

When a second destructuring reads from a `...rest` binding via
`$derived(...)`, upstream's rest-prop member rewrite turns each named
member read `props.X` into `$$props.X`, while the top-level `...rest`
element keeps `props` for `$.exclude_from_object(props, …)`:

```js
// let { ChartChildren, ...props } = $props();
// let { ssr = false, width, ...restProps } = $derived(props);
let ssr = $.derived(() => $.fallback($$props.ssr, false)), // was: props.ssr
  width = $.derived(() => $$props.width),                  // was: props.width
  restProps = $.derived(() => $.exclude_from_object(props, ["ssr", "width", …]));
```

The client `$derived` destructuring helpers now thread a separate
`member_base` (the `$$props` source of the rest binding) for member reads,
keeping `base_expr` (`props`) for the rest exclude.
