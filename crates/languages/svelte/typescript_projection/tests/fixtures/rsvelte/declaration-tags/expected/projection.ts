;

	let shown = $state(true);
	let start = $state(3);

;

async () => {
  let n = $state(0), twice = $derived(n * 2);
  {
    svelteHTML.createElement("button", {
      "onclick": () => n++,
    });
    (n);
    (twice);
  }
  if (shown) {
    let box = $state({ v: start });
    const label = 'v: ';
    {
      svelteHTML.createElement("p", {
        "onclick": () => box.v++,
      });
      (label);
      (box.v);
    }
    {
      svelteHTML.createElement("section", {});
      const label = 'inner';
      let t = $derived(twice + 1);
      {
        svelteHTML.createElement("i", {});
        (label);
        (t);
      }
    }
  }
  {
    for (let [, item] of __rsvelte_each([1, 2])) {
      let el = $state();
      {
        el = svelteHTML.createElement("b", {});
        (item);
      }
    }
  }
};
const DeclarationTags__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof DeclarationTags__SvelteComponent_>} */ (DeclarationTags__SvelteComponent_);
