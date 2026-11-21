;
function $$render() {
  let tag = $state('div'); let c = $state('red'); let /** @type {typeof __rsvelte_public_props0} */ { p } = $props();
;

  const __rsvelte_public_props0 = __rsvelte_props({
    p: __rsvelte_untyped_prop(),
  }, {}, false);
  async () => {
    {
      svelteHTML.createElement(tag, {});
      __sveltets_2_ensureType(String, Number, c);
      __sveltets_2_ensureType(String, Number, "1px");
      __sveltets_2_ensureType(String, Number, c);
    }
    {
      svelteHTML.createElement(tag, {
        ...(p),
        "style": "a: b",
      });
      __sveltets_2_ensureType(String, Number, c);
    }
    {
      svelteHTML.createElement(tag, {
        "style": "margin: 0",
      });
      __sveltets_2_ensureType(String, Number, c);
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
const DynamicElementSe__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof DynamicElementSe__SvelteComponent_>} */ (DynamicElementSe__SvelteComponent_);
