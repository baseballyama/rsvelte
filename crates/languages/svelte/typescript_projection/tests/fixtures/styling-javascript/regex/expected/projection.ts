;
const pattern=/[(){}\/]+/giu;
;

async () => {
  {
    svelteHTML.createElement("p", {
      "class": pattern.test("a") ? "a" : "b",
    });
  }
};
const Regex__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof Regex__SvelteComponent_>} */ (Regex__SvelteComponent_);
