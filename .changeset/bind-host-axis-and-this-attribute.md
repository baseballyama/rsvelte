---
"@rsvelte/compiler": patch
---

Run the host-independent half of the `bind:` rules for every host, and read `this=` the way the official compiler does.

- `await` anywhere a `bind:` expression can reach it — including both halves of a `{get, set}` pair — is now rejected with `experimental_async`, as the official compiler does; an `await` inside a function *below* the pair still compiles.
- `<svelte:element>` reached none of the target-shape rules, so `bind:clientWidth={o?.k}` compiled into `($$value) => o?.k = $$value`, which no JS parser accepts, and a shorthand `bind:clientWidth` emitted a write to an undeclared name. A component and `<svelte:component>` never reached the `{get, set}` pair rules, so `bind:group={get, set}`, a parenthesised pair and a three-element pair were all accepted.
- On the server, `<select bind:value={get, set}>` rendered the sequence expression — whose value is the *setter* — instead of calling the getter, so no `<option>` was ever selected.
- `<C bind:this={x} bind:this={x} />` was rejected with `attribute_duplicate`; the official compiler exempts every attribute named `this` from that rule.
- A second `this=` on `<svelte:element>` / `<svelte:component>` was dropped instead of being passed through as an attribute / prop.
- `<svelte:self bind:group={x} />` did not declare its binding group array.
