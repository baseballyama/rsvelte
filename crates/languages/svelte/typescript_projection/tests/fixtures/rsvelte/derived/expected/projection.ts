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
const Derived__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type Derived__SvelteComponent_ = ReturnType<typeof Derived__SvelteComponent_>;
export default Derived__SvelteComponent_;
