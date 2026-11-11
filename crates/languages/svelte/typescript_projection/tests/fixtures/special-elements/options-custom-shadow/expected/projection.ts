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
const OptionsCustomShadow__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type OptionsCustomShadow__SvelteComponent_ = ReturnType<typeof OptionsCustomShadow__SvelteComponent_>;
export default OptionsCustomShadow__SvelteComponent_;
