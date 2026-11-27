;
import C from './C.svelte';;

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
          foo: () => {
            async () => {
            };
            return __rsvelte_snippet_return;
          },
        },
      });
      const $$_C0 = __rsvelte_constructed(__rsvelte_component_0, __rsvelte_element0);
      const { foo } = __rsvelte_component_props(__rsvelte_component_0);
      {
        const {} = $$_C0.$$slot_def["a"];
        {
          svelteHTML.createElement("div", {});
          x;
        }
      }
      x;
      {
        const {} = $$_C0.$$slot_def["1"];
        {
          new (__rsvelte_component(C))(__rsvelte_internals(), {
            props: {
              "a": x,
            },
          });
        }
      }
      {
        const {} = $$_C0.$$slot_def["0"];
        {
          svelteHTML.createElement("span", {});
          (x);
        }
      }
      C;
    }
    {
      const __rsvelte_component_0 = __rsvelte_component(C);
      const __rsvelte_element0 = new (__rsvelte_bind_this(__rsvelte_component_0))(__rsvelte_internals(), {
        props: {},
      });
      const $$_C0 = __rsvelte_constructed(__rsvelte_component_0, __rsvelte_element0);
      {
        const {} = $$_C0.$$slot_def["b"];
        {
          svelteHTML.createElement("svelte:fragment", {});
          {
            svelteHTML.createElement("span", {});
            x;
          }
        }
      }
      {
        const {} = $$_C0.$$slot_def["c"];
        {
          svelteHTML.createElement("svelte:fragment", {});
          {
            svelteHTML.createElement("svg", {});
            {
              svelteHTML.createElement("rect", {});
            }
          }
        }
      }
      C;
    }
    {
      new (__rsvelte_component(C))(__rsvelte_internals(), {
        props: {
          children: __rsvelte_children,
        },
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
