;
function $$render() {
  
	let x = $state();
	let ty = $state('checkbox');

;

  async () => {
    {
      svelteHTML.createElement("input", {
        "type": ty,
        "bind:checked": x,
      });
      () => {
        // @ts-ignore
        x = __rsvelte_untyped_prop();
      };
    }
  };
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
}
const BindCheckedBesideDynamicType__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof BindCheckedBesideDynamicType__SvelteComponent_>} */ (BindCheckedBesideDynamicType__SvelteComponent_);
