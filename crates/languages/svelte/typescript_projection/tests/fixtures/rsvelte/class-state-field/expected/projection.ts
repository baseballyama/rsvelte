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
const ClassStateField__SvelteComponent_ = __rsvelte_export_component();
export default ClassStateField__SvelteComponent_;
