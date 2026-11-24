;
import C from './C.svelte';;

;

function $$render() {
  
	
	let k = $state(1);

;

  async () => {
    {
      const __rsvelte_component_0 = __rsvelte_component(C);
      __rsvelte_component_0(__rsvelte_internals(), {
        children: __rsvelte_children,
      });
      {
        const {
          item,
          "index": i,
          "pair": { a, b: [c], ...rest },
        } = __rsvelte_instance(__rsvelte_component_0).$$slot_def.default;
        {
          for (let [, x] of __rsvelte_each(item)) {
            {
              svelteHTML.createElement("p", {
                "onclick": () => k++,
              });
              x;
              i;
              a;
              c;
              rest.d;
              k;
            }
          }
        }
        {
          const {
            x,
          } = __rsvelte_instance(__rsvelte_component_0).$$slot_def["named"];
          svelteHTML.createElement("div", {});
          x;
        }
        {
          const {
            "y": { z },
          } = __rsvelte_instance(__rsvelte_component_0).$$slot_def["f"];
          svelteHTML.createElement("svelte:fragment", {});
          z;
        }
        {
          const {
            w,
          } = __rsvelte_instance(__rsvelte_component_0).$$slot_def["comp"];
          __rsvelte_component(C)(__rsvelte_internals(), {
            children: __rsvelte_children,
            "foo": w,
          });
          w;
          C;
        }
        {
          const {
            v,
          } = __rsvelte_instance(__rsvelte_component_0).$$slot_def["consts"];
          svelteHTML.createElement("p", {});
          const twice = v * 2;
          twice;
        }
      }
      C;
    }
    {
      const __rsvelte_component_0 = __rsvelte_component(C);
      __rsvelte_component_0(__rsvelte_internals(), {
        children: __rsvelte_children,
      });
      {
        const {
          v,
        } = __rsvelte_instance(__rsvelte_component_0).$$slot_def.default;
        svelteHTML.createElement("svelte:fragment", {});
        v;
      }
      C;
    }
    {
      const __rsvelte_component_0 = __rsvelte_component(C);
      __rsvelte_component_0(__rsvelte_internals(), {
        children: __rsvelte_children,
      });
      {
        const {
          u,
        } = __rsvelte_instance(__rsvelte_component_0).$$slot_def["default"];
        svelteHTML.createElement("svelte:fragment", {});
        u;
      }
      C;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const LetDirectives__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof LetDirectives__SvelteComponent_>} LetDirectives__SvelteComponent_ */
export default LetDirectives__SvelteComponent_;
