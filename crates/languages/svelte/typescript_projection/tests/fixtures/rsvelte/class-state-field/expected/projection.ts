;

	class Counter {
		count = $state(0);
	}

	const counter = new Counter();

;

() => {
  {
    svelteHTML.createElement("button", {
      onclick: () => counter.count++,
    });
    (counter.count);
  }
};
export default __rsvelte_export_component<Record<string, never>, {}, "">();
