;
import C from './C.svelte';;

;

function $$render() {
  
	
	let /** @typedef {{ show?: boolean, w?: number }} $$ComponentProps *//** @type {$$ComponentProps} */ { show = true, w = 1 } = $props();
	let items = $state([1]);

;

  async () => {
    {
      __rsvelte_component(C)(__rsvelte_internals(), {
        ...(__sveltets_2_cssProp({
          "--w": `${w}px`,
        })),
      });
    }
    if (show) {
      {
        __rsvelte_component(C)(__rsvelte_internals(), {
          ...(__sveltets_2_cssProp({
            "--a": items.length,
          })),
        });
      }
    }
    {
      for (let item of __rsvelte_each(items)) {
        {
          __rsvelte_component(C)(__rsvelte_internals(), {
            children: __rsvelte_children,
            ...(__sveltets_2_cssProp({
              "--b": item,
            })),
            "c": item,
          });
          item;
          C;
        }
      }
    }
    {
      svelteHTML.createElement("div", {});
      {
        __rsvelte_component(C)(__rsvelte_internals(), {
          ...(__sveltets_2_cssProp({
            "--x": Math.max(w, 2),
          })),
        });
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const CssPropsStandalone__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof CssPropsStandalone__SvelteComponent_>} CssPropsStandalone__SvelteComponent_ */
export default CssPropsStandalone__SvelteComponent_;
