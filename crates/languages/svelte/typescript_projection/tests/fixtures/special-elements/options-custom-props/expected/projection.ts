;
function $$render() {
  /** @type {typeof __rsvelte_public_props0} */ let {value=true}= $props();
;

  const __rsvelte_public_props0 = __rsvelte_props({}, {
    value: true,
  }, false);
  async () => {
    {
      svelteHTML.createElement("svelte:options", {
        "customelement": "my-element",
      });
    }
    {
      svelteHTML.createElement("p", {});
      value;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
const OptionsCustomProps__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof OptionsCustomProps__SvelteComponent_>} */ (OptionsCustomProps__SvelteComponent_);
