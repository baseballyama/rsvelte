;

	import C from './C.svelte';
	let n = $state(0);
	let h = $state(() => {});
	function f() { n++; }
	const make = () => () => {};

;

async () => {
  {
    const __rsvelte_component_0 = __rsvelte_component(C);
    __rsvelte_component_0(__rsvelte_internals(), {
      "a": n,
    });
    __rsvelte_instance(__rsvelte_component_0).$on("click", f);
    __rsvelte_instance(__rsvelte_component_0).$on("click", () => n++);
    __rsvelte_instance(__rsvelte_component_0).$on("hover", h);
    __rsvelte_instance(__rsvelte_component_0).$on("make", make());
    __rsvelte_instance(__rsvelte_component_0).$on("bubble", () => {});
    __rsvelte_instance(__rsvelte_component_0).$on("x-y", f);
  }
  {
    const __rsvelte_component_0 = __rsvelte_component(C);
    __rsvelte_component_0(__rsvelte_internals(), {});
    __rsvelte_instance(__rsvelte_component_0).$on("click", f);
  }
};
const ComponentEvents__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type ComponentEvents__SvelteComponent_ = ReturnType<typeof ComponentEvents__SvelteComponent_>;
export default ComponentEvents__SvelteComponent_;
