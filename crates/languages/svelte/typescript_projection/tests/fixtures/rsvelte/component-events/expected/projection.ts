;
import C from './C.svelte';;

;

function $$render() {
  
	
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
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
}
const ComponentEvents__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof ComponentEvents__SvelteComponent_>} */ (ComponentEvents__SvelteComponent_);
