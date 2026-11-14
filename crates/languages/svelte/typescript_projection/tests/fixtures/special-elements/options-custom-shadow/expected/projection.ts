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
const OptionsCustomShadow__SvelteComponent_ = __rsvelte_export_component();
export default OptionsCustomShadow__SvelteComponent_;
