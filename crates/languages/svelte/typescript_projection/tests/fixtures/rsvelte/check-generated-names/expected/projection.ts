;

	import type { Component } from 'svelte';
	const Foo: Component<{ a: number }> = null!;

;

() => {
  {
    __rsvelte_component(Foo)(__rsvelte_internals(), {
      children: __rsvelte_children,
      "a": 1,
    });
  }
  {
    svelteHTML.createElement("div", {
      "this-is": "wrong",
    });
  }
};
export default __rsvelte_export_component<__rsvelte_no_props, {}, "">();
