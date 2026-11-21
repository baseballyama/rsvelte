;
function $$render() {
  
	let /** @type {typeof __rsvelte_public_props0} */ { ...attrs } = $props();
	let text = $state('');
	let checked = $state(false);

;

  const __rsvelte_public_props0 = __rsvelte_props({}, {}, true);
  async () => {
    {
      svelteHTML.createElement("input", {
        ...(attrs),
      });
    }
    {
      svelteHTML.createElement("input", {
        ...(attrs),
        "bind:value": text,
      });
      () => {
        // @ts-ignore
        text = __rsvelte_untyped_prop();
      };
    }
    {
      svelteHTML.createElement("input", {
        "type": "checkbox",
        ...(attrs),
        "bind:checked": checked,
      });
      () => {
        // @ts-ignore
        checked = __rsvelte_untyped_prop();
      };
    }
    {
      svelteHTML.createElement("input", {
        ...(attrs),
        "value": text,
        "defaultvalue": "seed",
      });
    }
    {
      svelteHTML.createElement("p", {});
      text;
      checked;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const SpreadInput__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof SpreadInput__SvelteComponent_>} SpreadInput__SvelteComponent_ */
export default SpreadInput__SvelteComponent_;
