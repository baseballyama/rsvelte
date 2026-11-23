;
import C from './C.svelte';;

;

function $$render() {
  
	
	let x = $state(1);

;

  async () => {
    {
      const __rsvelte_component_0 = __rsvelte_component(C);
      const __rsvelte_element0 = __rsvelte_bind_this(__rsvelte_component_0)(__rsvelte_internals(), {
        children: __rsvelte_children,
        foo: () => {
          async () => {
          };
          return __rsvelte_snippet_return;
        },
      });
      const { foo } = __rsvelte_component_props(__rsvelte_component_0);
      foo;
      {
        svelteHTML.createElement("div", {});
        x;
      }
      x;
      {
        __rsvelte_component(C)(__rsvelte_internals(), {
          "slot": "1",
          "a": x,
        });
      }
      {
        svelteHTML.createElement("span", {});
        (x);
      }
      C;
    }
    {
      __rsvelte_component(C)(__rsvelte_internals(), {});
      {
        svelteHTML.createElement("svelte:fragment", {});
        {
          svelteHTML.createElement("span", {});
          x;
        }
      }
      {
        svelteHTML.createElement("svelte:fragment", {});
        {
          svelteHTML.createElement("svg", {});
          {
            svelteHTML.createElement("rect", {});
          }
        }
      }
      C;
    }
    {
      __rsvelte_component(C)(__rsvelte_internals(), {
        children: __rsvelte_children,
      });
      {
        svelteHTML.createElement("svelte:fragment", {});
        x;
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
export const NamedSlots__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof NamedSlots__SvelteComponent_>} NamedSlots__SvelteComponent_ */
export default NamedSlots__SvelteComponent_;
