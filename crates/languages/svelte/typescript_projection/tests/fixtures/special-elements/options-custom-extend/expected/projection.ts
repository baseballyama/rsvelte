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
const OptionsCustomExtend__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type OptionsCustomExtend__SvelteComponent_ = ReturnType<typeof OptionsCustomExtend__SvelteComponent_>;
export default OptionsCustomExtend__SvelteComponent_;
