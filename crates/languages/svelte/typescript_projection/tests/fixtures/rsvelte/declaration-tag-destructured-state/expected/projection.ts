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
const DeclarationTagDestructuredState__SvelteComponent_ = __rsvelte_export_component();
export default DeclarationTagDestructuredState__SvelteComponent_;
