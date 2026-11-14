;
let tag = $state("div"); let attrs = $state({ id: "test" });
;

async () => {
  {
    svelteHTML.createElement(tag, {
      ...(attrs),
    });
  }
};
const ElementSpread__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof ElementSpread__SvelteComponent_>} */ (ElementSpread__SvelteComponent_);
