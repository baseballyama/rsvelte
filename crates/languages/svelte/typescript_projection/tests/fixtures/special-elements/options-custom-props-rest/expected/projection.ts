;
function $$render() {
  let /** @type {typeof __rsvelte_public_props0} */ {value,...rest}=$props()
;

  const __rsvelte_public_props0 = __rsvelte_props({
    value: __rsvelte_untyped_prop(),
  }, {}, true);
  async () => {
    {
      svelteHTML.createElement("svelte:options", {
        "customElement": "my-element",
      });
    }
    {
      svelteHTML.createElement("p", {});
      value;
      rest.other;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
const OptionsCustomPropsRest__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof OptionsCustomPropsRest__SvelteComponent_>} */ (OptionsCustomPropsRest__SvelteComponent_);
