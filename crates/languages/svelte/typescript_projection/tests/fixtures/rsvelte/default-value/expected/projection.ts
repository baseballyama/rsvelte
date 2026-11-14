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
const DefaultValue__SvelteComponent_ = __rsvelte_export_component();
export default DefaultValue__SvelteComponent_;
