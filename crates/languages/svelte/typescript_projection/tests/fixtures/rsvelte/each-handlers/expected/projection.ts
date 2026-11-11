;

	let items = $state(['one', 'two', 'three']);
	let picked = $state('');

	function remove(item) {
		items = items.filter((i) => i !== item);
	}

;

async () => {
  {
    for (let [i, item] of __rsvelte_each(items)) {
      (item);
      {
        svelteHTML.createElement("button", {
          "onclick": () => (picked = item),
        });
        (item);
      }
      {
        svelteHTML.createElement("button", {
          "onclick": () => remove(item),
        });
        (i);
      }
    }
  }
  {
    svelteHTML.createElement("p", {});
    (picked);
  }
};
const EachHandlers__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type EachHandlers__SvelteComponent_ = ReturnType<typeof EachHandlers__SvelteComponent_>;
export default EachHandlers__SvelteComponent_;
