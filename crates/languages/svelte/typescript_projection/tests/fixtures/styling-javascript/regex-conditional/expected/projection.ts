;
const value=(/[)]/.test("a")?"a":"b");
;

async () => {
  {
    svelteHTML.createElement("p", {
      "class": value,
    });
  }
};
const RegexConditional__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof RegexConditional__SvelteComponent_>} */ (RegexConditional__SvelteComponent_);
