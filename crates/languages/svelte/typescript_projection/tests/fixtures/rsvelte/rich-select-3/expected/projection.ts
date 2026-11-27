;
import Option from './Option.svelte';;

;

function $$render() {
  
	
	let /** @type {typeof __rsvelte_public_props0} */ { p, c } = $props();

;

  const __rsvelte_public_props0 = __rsvelte_props({
    p: __rsvelte_untyped_prop(),
    c: __rsvelte_untyped_prop(),
  }, {}, false);
  async () => {
    {
      svelteHTML.createElement("select", {});
      {
        svelteHTML.createElement("svelte:boundary", {});
        {
          svelteHTML.createElement("option", {});
        }
      }
    }
    {
      svelteHTML.createElement("select", {
        ...(p),
        "class": c,
      });
      {
        new (__rsvelte_component(Option))(__rsvelte_internals(), {
          props: {},
        });
      }
    }
    {
      svelteHTML.createElement("select", {
        ...(p),
      });
      {
        svelteHTML.createElement("option", {
          "class": c,
          ...(p),
        });
        {
          svelteHTML.createElement("b", {});
          c;
        }
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const RichSelect3__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof RichSelect3__SvelteComponent_>} RichSelect3__SvelteComponent_ */
export default RichSelect3__SvelteComponent_;
