;
async () => {
  {
    svelteHTML.createElement("svelte:options", {
      "customelement": {shadow:"none",extend: Base => Base},
    });
  }
  {
    svelteHTML.createElement("p", {});
  }
};
const OptionsCustomExtend__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof OptionsCustomExtend__SvelteComponent_>} */ (OptionsCustomExtend__SvelteComponent_);
