;
import C from './C.svelte';;

;

function $$render() {
  
	
	let /** @type {typeof __rsvelte_public_props0} */ { show = true, w = 1 } = $props();
	let items = $state([1]);

;

  const __rsvelte_public_props0 = __rsvelte_props({}, {
    show: true,
    w: 1,
  }, false);
  async () => {
    {
      new (__rsvelte_component(C))(__rsvelte_internals(), {
        props: {
          ...(__sveltets_2_cssProp({
            "--w": `${w}px`,
          })),
        },
      });
    }
    if (show) {
      {
        new (__rsvelte_component(C))(__rsvelte_internals(), {
          props: {
            ...(__sveltets_2_cssProp({
              "--a": items.length,
            })),
          },
        });
      }
    }
    {
      for (let item of __rsvelte_each(items)) {
        {
          new (__rsvelte_component(C))(__rsvelte_internals(), {
            props: {
              children: __rsvelte_children,
              ...(__sveltets_2_cssProp({
                "--b": item,
              })),
              "c": item,
            },
          });
          item;
          C;
        }
      }
    }
    {
      svelteHTML.createElement("div", {});
      {
        new (__rsvelte_component(C))(__rsvelte_internals(), {
          props: {
            ...(__sveltets_2_cssProp({
              "--x": Math.max(w, 2),
            })),
          },
        });
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const CssPropsStandalone__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof CssPropsStandalone__SvelteComponent_>} CssPropsStandalone__SvelteComponent_ */
export default CssPropsStandalone__SvelteComponent_;
