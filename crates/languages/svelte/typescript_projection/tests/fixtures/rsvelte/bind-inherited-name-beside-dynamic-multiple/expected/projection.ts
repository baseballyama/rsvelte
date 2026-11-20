;
function $$render() {
  
	let x = $state();
	let t = $state(false);

;

  async () => {
    {
      svelteHTML.createElement("select", {
        "multiple": t,
        "bind:toString": x,
      });
      () => {
        // @ts-ignore
        x = __rsvelte_untyped_prop();
      };
    }
  };
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
}
const BindInheritedNameBesideDynamicMultiple__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof BindInheritedNameBesideDynamicMultiple__SvelteComponent_>} */ (BindInheritedNameBesideDynamicMultiple__SvelteComponent_);
