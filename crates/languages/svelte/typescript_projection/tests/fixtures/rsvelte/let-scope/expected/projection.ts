;
import C from "./C.svelte";;

;

function $$render() {
  
	
	let x = $state(1);

;

  async () => {
    {
      const __rsvelte_component_0 = __rsvelte_component(C);
      const __rsvelte_element0 = new (__rsvelte_bind_this(__rsvelte_component_0))(__rsvelte_internals(), {
        props: {
          children: __rsvelte_children,
        },
      });
      const $$_C0 = __rsvelte_constructed(__rsvelte_component_0, __rsvelte_element0);
      {
        const {
          x,
        } = $$_C0.$$slot_def.default;
        x;
        {
          const {} = $$_C0.$$slot_def["a"];
          {
            svelteHTML.createElement("p", {});
            x;
          }
        }
        {
          const {
            y,
          } = $$_C0.$$slot_def["b"];
          {
            new (__rsvelte_component(C))(__rsvelte_internals(), {
              props: {
                children: __rsvelte_children,
              },
            });
            x;
            y;
            C;
          }
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
