;
function $$render() {
  async () => {
    let [a] = $state([1]), b = $state(2), { c } = $derived({ c: a + b });
    {
      svelteHTML.createElement("p", {});
      a;
      b;
      c;
    }
    {
      svelteHTML.createElement("button", {
        "onclick": () => { a++; b++; },
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const DeclarationTagDestructuredState__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof DeclarationTagDestructuredState__SvelteComponent_>} DeclarationTagDestructuredState__SvelteComponent_ */
export default DeclarationTagDestructuredState__SvelteComponent_;
