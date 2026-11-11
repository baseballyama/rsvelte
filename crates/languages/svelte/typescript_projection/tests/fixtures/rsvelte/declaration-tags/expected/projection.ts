;

	let shown = $state(true);
	let start = $state(3);

;

() => {
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
const DeclarationTags__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type DeclarationTags__SvelteComponent_ = ReturnType<typeof DeclarationTags__SvelteComponent_>;
export default DeclarationTags__SvelteComponent_;
