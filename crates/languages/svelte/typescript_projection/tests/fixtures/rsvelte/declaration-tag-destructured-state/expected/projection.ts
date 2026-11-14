;
async () => {
  let [a] = $state([1]), b = $state(2), { c } = $derived({ c: a + b });
  {
    svelteHTML.createElement("p", {});
    (a);
    (b);
    (c);
  }
  {
    svelteHTML.createElement("button", {
      "onclick": () => { a++; b++; },
    });
  }
};
const DeclarationTagDestructuredState__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof DeclarationTagDestructuredState__SvelteComponent_>} */ (DeclarationTagDestructuredState__SvelteComponent_);
