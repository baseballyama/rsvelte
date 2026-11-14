;
async () => {
  {
    svelteHTML.createElement("svelte:options", {
      "customelement": {tag:"my-element",shadow:"none"},
    });
  }
  {
    svelteHTML.createElement("p", {});
  }
};
const OptionsCustomShadow__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof OptionsCustomShadow__SvelteComponent_>} */ (OptionsCustomShadow__SvelteComponent_);
