;
function $$render() {
  
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
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const DefaultValue__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof DefaultValue__SvelteComponent_>} DefaultValue__SvelteComponent_ */
export default DefaultValue__SvelteComponent_;
