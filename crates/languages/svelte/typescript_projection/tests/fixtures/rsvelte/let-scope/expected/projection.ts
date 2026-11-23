;
import C from "./C.svelte";;

;

function $$render() {
  
	
	let x = $state(1);

;

  async () => {
    {
      const __rsvelte_component_0 = __rsvelte_component(C);
      __rsvelte_component_0(__rsvelte_internals(), {
        children: __rsvelte_children,
      });
      {
        const {
          x,
        } = __rsvelte_instance(__rsvelte_component_0).$$slot_def.default;
        x;
        {
          svelteHTML.createElement("p", {});
          x;
        }
        {
          const {
            y,
          } = __rsvelte_instance(__rsvelte_component_0).$$slot_def["b"];
          __rsvelte_component(C)(__rsvelte_internals(), {
            children: __rsvelte_children,
          });
          x;
          y;
          C;
        }
      }
      C;
    }
    {
      svelteHTML.createElement("button", {
        "onclick": () => x++,
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const LetScope__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof LetScope__SvelteComponent_>} LetScope__SvelteComponent_ */
export default LetScope__SvelteComponent_;
