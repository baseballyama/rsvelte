;
function $$render() {
  
	let x = $state();

;

  async () => {
    {
      svelteHTML.createElement("input", {
        "type": true,
        "bind:value": x,
      });
      () => {
        // @ts-ignore
        x = __rsvelte_untyped_prop();
      };
    }
  };
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
}
const BindValueBesideBooleanType__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof BindValueBesideBooleanType__SvelteComponent_>} */ (BindValueBesideBooleanType__SvelteComponent_);
