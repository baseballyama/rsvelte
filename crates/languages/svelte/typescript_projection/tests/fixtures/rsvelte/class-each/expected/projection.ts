;

	let selected = $state(1);
	let items = $state([
		{ id: 1, name: 'one', done: false },
		{ id: 2, name: 'two', done: true }
	]);

;

async () => {
  {
    svelteHTML.createElement("ul", {});
    {
      for (let [, item] of __rsvelte_each(items)) {
        (item.id);
        {
          svelteHTML.createElement("li", {
            "class": "row",
          });
          (item.id === selected);
          (item.done);
          {
            svelteHTML.createElement("button", {
              "class": { current: item.id === selected },
              "onclick": () => (selected = item.id),
            });
            (item.name);
          }
        }
      }
    }
  }
};
const ClassEach__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof ClassEach__SvelteComponent_>} */ (ClassEach__SvelteComponent_);
