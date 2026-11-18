;
function $$render() {
  const f=(pattern=/[(){}]/) => pattern.test("a");
;

  async () => {
    {
      svelteHTML.createElement("p", {
        "class": f() ? "a" : "b",
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, string>} */ (__rsvelte_export_component))();
}
const RegexDefault__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof RegexDefault__SvelteComponent_>} */ (RegexDefault__SvelteComponent_);
