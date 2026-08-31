# Awaited autofocus and event attributes emit unparseable JavaScript

Oracle: `submodules/svelte` @ `5.56.10`, client output with
`experimental.async: true`.

These two components compile successfully:

```svelte
<script>const p = Promise.resolve(true);</script>
<input autofocus={await p} />
```

```svelte
<script>const p = Promise.resolve(() => {});</script>
<button onclick={await p}>click</button>
```

The official compiler emits an `await` in a non-async function in both cases:

```js
$.autofocus(input, await p);
```

```js
function (...$$args) {
	(await p)?.apply(this, $$args);
}
```

Neither output is JavaScript a parser accepts. The neighbouring custom-element
attribute path had the same defect in 5.56.9 and was fixed in 5.56.10 by routing
the value through `Memoizer`; these two paths still bypass it:

- `RegularElement.js` calls `build_attribute_value` for `autofocus` without a
  memoize callback and pushes the result directly into `state.init`.
- `shared/events.js` puts the visited expression inside a plain function and
  only memoizes calls, not awaited expressions.

rsvelte deliberately diverges by resolving each awaited value through a local
`template_effect` memoizer. The awaited expression then lives in an
`async () => ...` value thunk, while `$.autofocus` and the event registration
receive its resolved parameter. Synchronous attributes retain upstream's exact
output.

The differential gates cannot report this shared defect: official output is the
oracle, and the generated matrix aborts an official parse failure instead of
creating a ratchet verdict. This blind spot and these two measured examples are
recorded in `compatibility/GATES.md#gate-coverage` section 5r.

Local anchor: [#3651](https://github.com/baseballyama/rsvelte/issues/3651).
