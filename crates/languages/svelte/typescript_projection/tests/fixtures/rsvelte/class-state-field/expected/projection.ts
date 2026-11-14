;

	class Counter {
		count = $state(0);
	}

	const counter = new Counter();

;

async () => {
  {
    svelteHTML.createElement("button", {
      "onclick": () => counter.count++,
    });
    (counter.count);
  }
};
const ClassStateField__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof ClassStateField__SvelteComponent_>} */ (ClassStateField__SvelteComponent_);
