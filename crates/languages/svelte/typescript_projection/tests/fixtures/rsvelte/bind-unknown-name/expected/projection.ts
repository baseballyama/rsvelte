;
function $$render() {
  
	let w = $state(0);

;

  async () => {
    {
      svelteHTML.createElement("div", {
        "bind:whatever": w,
      });
      () => {
        // @ts-ignore
        w = __rsvelte_untyped_prop();
      };
    }
  };
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
}
const BindUnknownName__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof BindUnknownName__SvelteComponent_>} */ (BindUnknownName__SvelteComponent_);
