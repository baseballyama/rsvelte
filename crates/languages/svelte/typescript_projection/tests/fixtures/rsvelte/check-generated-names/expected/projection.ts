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
const CheckGeneratedNames__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type CheckGeneratedNames__SvelteComponent_ = ReturnType<typeof CheckGeneratedNames__SvelteComponent_>;
export default CheckGeneratedNames__SvelteComponent_;
