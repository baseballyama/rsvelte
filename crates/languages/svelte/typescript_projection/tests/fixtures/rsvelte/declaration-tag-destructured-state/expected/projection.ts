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
const DeclarationTagDestructuredState__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type DeclarationTagDestructuredState__SvelteComponent_ = ReturnType<typeof DeclarationTagDestructuredState__SvelteComponent_>;
export default DeclarationTagDestructuredState__SvelteComponent_;
