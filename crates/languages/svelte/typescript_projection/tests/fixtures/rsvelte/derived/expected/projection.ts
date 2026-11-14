;

	let count = $state(1);
	let double = $derived(count * 2);

	function increment() {
		count += 1;
	}

;

async () => {
  {
    svelteHTML.createElement("button", {
      "onclick": increment,
    });
    (count);
    (double);
  }
};
const Derived__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof Derived__SvelteComponent_>} */ (Derived__SvelteComponent_);
