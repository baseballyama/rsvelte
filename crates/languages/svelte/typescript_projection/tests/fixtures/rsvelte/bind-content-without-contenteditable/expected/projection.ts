;
function $$render() {
  
	let x = $state();

;

  async () => {
    {
      svelteHTML.createElement("div", {
        "bind:innerHTML": x,
      });
      () => {
        // @ts-ignore
        x = __rsvelte_untyped_prop();
      };
    }
  };
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
}
const BindContentWithoutContenteditable__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof BindContentWithoutContenteditable__SvelteComponent_>} */ (BindContentWithoutContenteditable__SvelteComponent_);
