;

	class Counter {
		count = $state(0);
	}

	const counter = new Counter();

;

() => {
  {
    svelteHTML.createElement("button", {
      "onclick": () => counter.count++,
    });
    (counter.count);
  }
};
const ClassStateField__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type ClassStateField__SvelteComponent_ = ReturnType<typeof ClassStateField__SvelteComponent_>;
export default ClassStateField__SvelteComponent_;
