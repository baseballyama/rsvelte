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
      const __rsvelte_element0 = new (__rsvelte_bind_this(__rsvelte_component_0))(__rsvelte_internals(), {
        props: {
          "a": n,
        },
      });
      const $$_C0 = __rsvelte_constructed(__rsvelte_component_0, __rsvelte_element0);
      $$_C0.$on("click", f);
      $$_C0.$on("click", () => n++);
      $$_C0.$on("hover", h);
      $$_C0.$on("make", make());
      $$_C0.$on("bubble", () => {});
      $$_C0.$on("x-y", f);
    }
    {
      const __rsvelte_component_0 = __rsvelte_component(C);
      const __rsvelte_element0 = new (__rsvelte_bind_this(__rsvelte_component_0))(__rsvelte_internals(), {
        props: {},
      });
      const $$_tnenopmoc_etlevs0 = __rsvelte_constructed(__rsvelte_component_0, __rsvelte_element0);
      $$_tnenopmoc_etlevs0.$on("click", f);
    }
  };
  return (/** @type {typeof __rsvelte_export_isomorphic<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_isomorphic))()(__rsvelte_any_event({
    "bubble": __sveltets_2_bubbleEventDef(__sveltets_2_instanceOf((/** @type {typeof __rsvelte_value<typeof C>} */ (__rsvelte_value))()).$$events_def, "bubble"),
  }), {});
}
export const ComponentEvents__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof ComponentEvents__SvelteComponent_>} ComponentEvents__SvelteComponent_ */
export default ComponentEvents__SvelteComponent_;
