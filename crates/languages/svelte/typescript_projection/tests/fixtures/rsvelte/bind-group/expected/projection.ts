;
import C from './C.svelte';;

;

function $$render() {
  
	
	let selected = $state([]);
	let one = $state('a');
	let v = $state('x');
	let items = $state([{ picks: [] }]);
	let binding_group = 1;

;

  async () => {
    {
      svelteHTML.createElement("input", {
        "type": "checkbox",
        "value": "a",
      });
      selected = __rsvelte_untyped_prop();
    }
    {
      svelteHTML.createElement("input", {
        "type": "checkbox",
        "value": v,
      });
      selected = __rsvelte_untyped_prop();
    }
    {
      svelteHTML.createElement("input", {
        "type": "radio",
        "value": "b",
      });
      one = __rsvelte_untyped_prop();
    }
    {
      svelteHTML.createElement("input", {
        "type": "radio",
      });
      one = __rsvelte_untyped_prop();
    }
    {
      for (let item of __rsvelte_each(items)) {
        let i = 1;
        {
          svelteHTML.createElement("input", {
            "type": "checkbox",
            "value": "p",
          });
          item.picks = __rsvelte_untyped_prop();
        }
        {
          for (let n of __rsvelte_each([1, 2])) {
            (n);
            {
              svelteHTML.createElement("input", {
                "type": "checkbox",
                "value": n,
              });
              items[i].picks = __rsvelte_untyped_prop();
            }
          }
        }
      }
    }
    {
      for (let item of __rsvelte_each(items)) {
        let j = 1;
        (item);
        {
          svelteHTML.createElement("input", {
            "type": "radio",
            "value": j,
          });
          item.picks = __rsvelte_untyped_prop();
        }
      }
    }
    {
      const __rsvelte_component_0 = __rsvelte_component(C);
      const __rsvelte_element0 = __rsvelte_component_0(__rsvelte_internals(), {
        "group": one,
      });
      () => {
        // @ts-ignore
        one = __rsvelte_untyped_prop();
      };
      __rsvelte_bindings(__rsvelte_component_0).$$bindings = "group";
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const BindGroup__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof BindGroup__SvelteComponent_>} BindGroup__SvelteComponent_ */
export default BindGroup__SvelteComponent_;
