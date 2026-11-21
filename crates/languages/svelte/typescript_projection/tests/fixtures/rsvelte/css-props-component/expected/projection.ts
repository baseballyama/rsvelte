;
import C from './C.svelte';;

;

function $$render() {
  
	
	let /** @type {typeof __rsvelte_public_props0} */ { color = 'red', Dyn } = $props();
	let n = $state(1);

;

  const __rsvelte_public_props0 = __rsvelte_props({
    Dyn: __rsvelte_untyped_prop(),
  }, {
    color: 'red',
  }, false);
  async () => {
    {
      __rsvelte_component(C)(__rsvelte_internals(), {
        ...(__sveltets_2_cssProp({
          "--color": color,
        })),
        ...(__sveltets_2_cssProp({
          "--size": "2px",
        })),
        "a": 1,
      });
    }
    {
      svelteHTML.createElement("svg", {});
      {
        __rsvelte_component(C)(__rsvelte_internals(), {
          ...(__sveltets_2_cssProp({
            "--fill": "blue",
          })),
          ...(__sveltets_2_cssProp({
            "--w": n,
          })),
        });
      }
    }
    {
      __rsvelte_component(Dyn)(__rsvelte_internals(), {
        children: __rsvelte_children,
        ...(__sveltets_2_cssProp({
          "--x": "1",
        })),
      });
      {
        svelteHTML.createElement("p", {});
      }
      Dyn;
    }
    {
      __rsvelte_component(Dyn)(__rsvelte_internals(), {
        ...(__sveltets_2_cssProp({
          "--y": n,
        })),
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
const CssPropsComponent__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof CssPropsComponent__SvelteComponent_>} */ (CssPropsComponent__SvelteComponent_);
