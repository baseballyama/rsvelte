;
async () => {
  {
    svelteHTML.createElement("svelte:options", {
      "customelement": {shadow:{mode:"closed"}},
    });
  }
  {
    svelteHTML.createElement("p", {});
  }
};
const OptionsCustomShadowObject__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type OptionsCustomShadowObject__SvelteComponent_ = ReturnType<typeof OptionsCustomShadowObject__SvelteComponent_>;
export default OptionsCustomShadowObject__SvelteComponent_;
