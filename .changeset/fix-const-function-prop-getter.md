---
"@rsvelte/compiler": patch
---

fix(transform): a function-valued `{@const}` passed as a component prop is not a getter

Upstream's `Identifier.js` `has_state` computation excludes function
bindings (`!binding.is_function()`), so a `{@const fn = (e) => …}` read as
a component prop is emitted as a plain value rather than a getter:

```js
// {#each items as item}
//   {@const onItemEnter = (e) => { … }}
//   <Path onpointerenter={onItemEnter} />
C($$anchor, { onpointerenter: $.get(onItemEnter) }); // was: get onpointerenter() { … }
```

Two gaps caused rsvelte to wrap it in a getter: the analyzer's
`set_const_tag_initial` never set `initial_is_function` for a `{@const}`
whose initializer is an arrow/function expression (so `is_function()`
returned `false`), and the client `expression_has_reactive_state`
Template branches checked only `is_expression_known_json`, missing the
`!binding.is_function()` term. Both now mirror upstream.
