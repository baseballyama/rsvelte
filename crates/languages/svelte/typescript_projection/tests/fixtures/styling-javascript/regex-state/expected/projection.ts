;
let pattern=$state(/a/g);
;

async () => {
  {
    svelteHTML.createElement("p", {
      "class": pattern.test("a") ? "a" : "b",
    });
  }
};
const RegexState__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof RegexState__SvelteComponent_>} */ (RegexState__SvelteComponent_);
