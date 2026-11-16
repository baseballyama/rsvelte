;
function $$render() {
  /** @type {typeof __rsvelte_public_props0} */ let {value: local}= $props();
;

  const __rsvelte_public_props0 = __rsvelte_props({
    value: __rsvelte_untyped_prop(),
  }, {}, false);
  async () => {
    {
      svelteHTML.createElement("svelte:options", {
        "customelement": "my-element",
      });
    }
    {
      svelteHTML.createElement("p", {});
      local;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
const OptionsCustomPropsAlias__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof OptionsCustomPropsAlias__SvelteComponent_>} */ (OptionsCustomPropsAlias__SvelteComponent_);
