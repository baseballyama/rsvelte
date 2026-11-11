;

	let d = $state('y');

;

() => {
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
export default __rsvelte_export_component<__rsvelte_no_props, {}, "">();
