;

	let d = $state('y');

;

async () => {
  {
    svelteHTML.createElement("input", {
      "value": "x",
      "defaultvalue": d,
    });
  }
  {
    svelteHTML.createElement("input", {
      "defaultvalue": d,
    });
  }
  {
    svelteHTML.createElement("input", {
      "type": "checkbox",
      "checked": true,
      "defaultchecked": false,
    });
  }
  {
    svelteHTML.createElement("input", {
      "type": "checkbox",
      "defaultchecked": false,
    });
  }
  {
    svelteHTML.createElement("textarea", {
      "defaultvalue": d,
    });
  }
  {
    svelteHTML.createElement("textarea", {
      "defaultvalue": d,
    });
  }
};
const DefaultValue__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof DefaultValue__SvelteComponent_>} */ (DefaultValue__SvelteComponent_);
