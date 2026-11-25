;
import C from "./C.svelte";;

;

function $$render() {
  
	
	let k = $state(1);

;

  async () => {
    {
      const __rsvelte_component_0 = __rsvelte_component(C);
      const __rsvelte_element0 = __rsvelte_bind_this(__rsvelte_component_0)(__rsvelte_internals(), {});
      const $$_C0 = __rsvelte_constructed(__rsvelte_component_0, __rsvelte_element0);
      {
        const {} = $$_C0.$$slot_def["a"];
        {
          svelteHTML.createElement("p", {});
          const twice = k * 2;
          twice;
        }
      }
      C;
    }
    {
      svelteHTML.createElement("button", {
        "onclick": () => k++,
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const SlotElementConst__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof SlotElementConst__SvelteComponent_>} SlotElementConst__SvelteComponent_ */
export default SlotElementConst__SvelteComponent_;
