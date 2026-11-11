;
import "./custom-button.js";
;

async () => {
  {
    svelteHTML.createElement("svelte:options", {
      "customelement": "my-element",
    });
  }
  {
    svelteHTML.createElement("button", {
      "is": "custom-button",
    });
  }
};
const OptionsCustomExtendedBuiltin__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type OptionsCustomExtendedBuiltin__SvelteComponent_ = ReturnType<typeof OptionsCustomExtendedBuiltin__SvelteComponent_>;
export default OptionsCustomExtendedBuiltin__SvelteComponent_;
