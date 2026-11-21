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
  return (/** @type {typeof __rsvelte_export_isomorphic<globalThis.Record<string, never>, { [evt: string]: CustomEvent<any> }, {}, "">} */ (__rsvelte_export_isomorphic))()({});
}
export const ComponentEvents__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof ComponentEvents__SvelteComponent_>} ComponentEvents__SvelteComponent_ */
export default ComponentEvents__SvelteComponent_;
