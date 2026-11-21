;
function $$render() {
  
	let /** @type {typeof __rsvelte_public_props0} */ { items } = $props();

;

  const __rsvelte_public_props0 = __rsvelte_props({
    items: __rsvelte_untyped_prop(),
  }, {}, false);
  async () => {
    {
      svelteHTML.createElement("ol", {});
      {
        for (let [i, item] of __rsvelte_each(items)) {
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
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const EachIndex__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof EachIndex__SvelteComponent_>} EachIndex__SvelteComponent_ */
export default EachIndex__SvelteComponent_;
