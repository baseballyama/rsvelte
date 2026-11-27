;
import Option from './Option.svelte';;

;

function $$render() {
  
	
	let /** @typedef {{ p: any, c: any }} $$ComponentProps *//** @type {$$ComponentProps} */ { p, c } = $props();

;

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
        __rsvelte_component(Option)(__rsvelte_internals(), {});
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
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const RichSelect3__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof RichSelect3__SvelteComponent_>} RichSelect3__SvelteComponent_ */
export default RichSelect3__SvelteComponent_;
