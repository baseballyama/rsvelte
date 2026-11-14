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
const EachHandlers__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof EachHandlers__SvelteComponent_>} */ (EachHandlers__SvelteComponent_);
