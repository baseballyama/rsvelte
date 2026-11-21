;
function $$render() {
  let /** @type {typeof __rsvelte_public_props0} */ {value=true}= $props();
;

  const __rsvelte_public_props0 = __rsvelte_props({}, {
    value: true,
  }, false);
  async () => {
    {
      svelteHTML.createElement("svelte:options", {
        "customElement": "my-element",
      });
    }
    {
      svelteHTML.createElement("p", {});
      value;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const OptionsCustomProps__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof OptionsCustomProps__SvelteComponent_>} OptionsCustomProps__SvelteComponent_ */
export default OptionsCustomProps__SvelteComponent_;
