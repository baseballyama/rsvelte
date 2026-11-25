;
function $$render() {
  
	let shown = $state(true);
	let start = $state(3);

;

  async () => {
    let n = $state(0), twice = $derived(n * 2);
    {
      svelteHTML.createElement("button", {
        "onclick": () => n++,
      });
      n;
      twice;
    }
    if (shown) {
      let box = $state({ v: start });
      const label = 'v: ';
      {
        svelteHTML.createElement("p", {
          "onclick": () => box.v++,
        });
        label;
        box.v;
      }
      {
        svelteHTML.createElement("section", {});
        const label = 'inner';
        let t = $derived(twice + 1);
        {
          svelteHTML.createElement("i", {});
          label;
          t;
        }
      }
    }
    {
      for (let item of __rsvelte_each([1, 2])) {
        let el = $state();
        {
          el = svelteHTML.createElement("b", {});
          item;
        }
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const DeclarationTags__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof DeclarationTags__SvelteComponent_>} DeclarationTags__SvelteComponent_ */
export default DeclarationTags__SvelteComponent_;
