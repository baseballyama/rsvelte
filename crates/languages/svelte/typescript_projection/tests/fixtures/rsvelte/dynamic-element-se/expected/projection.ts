;
function $$render() {
  let tag = $state('div'); let c = $state('red'); let /** @typedef {{ p: any }} $$ComponentProps *//** @type {$$ComponentProps} */ { p } = $props();
;

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
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const DynamicElementSe__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof DynamicElementSe__SvelteComponent_>} DynamicElementSe__SvelteComponent_ */
export default DynamicElementSe__SvelteComponent_;
