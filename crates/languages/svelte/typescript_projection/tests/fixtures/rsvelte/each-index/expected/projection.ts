;
function $$render() {
  
	let /** @typedef {{ items: any }} $$ComponentProps *//** @type {$$ComponentProps} */ { items } = $props();

;

  async () => {
    {
      svelteHTML.createElement("ol", {});
      {
        for (let item of __rsvelte_each(items)) {
          let i = 1;
          {
            svelteHTML.createElement("li", {});
            i + 1;
            item;
          }
        }
      }
    }
    {
      svelteHTML.createElement("p", {});
      items.length;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const EachIndex__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof EachIndex__SvelteComponent_>} EachIndex__SvelteComponent_ */
export default EachIndex__SvelteComponent_;
