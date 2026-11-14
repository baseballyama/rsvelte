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
const OptionsCustomExtendedBuiltin__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof OptionsCustomExtendedBuiltin__SvelteComponent_>} */ (OptionsCustomExtendedBuiltin__SvelteComponent_);
