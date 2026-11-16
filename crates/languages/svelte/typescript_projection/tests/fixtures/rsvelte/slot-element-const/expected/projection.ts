;
import C from "./C.svelte";;

;

function $$render() {
  
	
	let k = $state(1);

;

  async () => {
    {
      __rsvelte_component(C)(__rsvelte_internals(), {});
      {
        svelteHTML.createElement("p", {});
        const twice = k * 2;
        (twice);
      }
      C;
    }
    {
      svelteHTML.createElement("button", {
        "onclick": () => k++,
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
}
const SlotElementConst__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof SlotElementConst__SvelteComponent_>} */ (SlotElementConst__SvelteComponent_);
