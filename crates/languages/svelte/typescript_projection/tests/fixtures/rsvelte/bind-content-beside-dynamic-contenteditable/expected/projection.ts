;
function $$render() {
  
	let x = $state();
	let c = $state(true);

;

  async () => {
    {
      svelteHTML.createElement("div", {
        "contenteditable": c,
        "bind:textContent": x,
      });
      () => {
        // @ts-ignore
        x = __rsvelte_untyped_prop();
      };
    }
  };
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
}
const BindContentBesideDynamicContenteditable__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof BindContentBesideDynamicContenteditable__SvelteComponent_>} */ (BindContentBesideDynamicContenteditable__SvelteComponent_);
