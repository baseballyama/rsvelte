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
const OptionsCustomExtend__SvelteComponent_ = __rsvelte_export_component();
export default OptionsCustomExtend__SvelteComponent_;
